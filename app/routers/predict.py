import math
import numpy as np
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.database import get_db
from app.models.prediction import Prediction
from app.cache import get_cache, set_cache, delete_cache
from app.ml_models.loader import predict_risque as ml_predict_risque
from app.ml_models.loader import predict_consommation_lstm, FEATURES_LSTM, SEQ_LEN

router = APIRouter(prefix="/predict", tags=["Prédiction"])


class PredictRequest(BaseModel):
    zone_id: int
    temperature: float
    ensoleillement: float
    heure: int
    jour_semaine: int
    est_saison_pluie: int
    nuages: Optional[float] = 50.0
    pluie: Optional[float] = 0.0
    consommation_kwh: Optional[float] = 150.0
    conso_lag1: Optional[float] = 145.0
    conso_lag24: Optional[float] = 148.0


class PredictResponse(BaseModel):
    zone_id: int
    score_risque: float
    niveau_risque: str
    consommation_prevue_kwh: float
    prevision_24h: list
    message: str


def _build_rf_features(data: PredictRequest) -> list:
    """Build the 20-feature vector expected by the Random Forest."""
    heure = data.heure
    mois  = datetime.utcnow().month

    heure_sin = math.sin(2 * math.pi * heure / 24)
    heure_cos = math.cos(2 * math.pi * heure / 24)
    mois_sin  = math.sin(2 * math.pi * mois / 12)
    mois_cos  = math.cos(2 * math.pi * mois / 12)

    is_peak_matin = int(heure in [6, 7, 8, 9, 10])
    is_peak_soir  = int(heure in [18, 19, 20, 21])
    is_nuit       = int(heure in [22, 23, 0, 1, 2, 3, 4, 5])
    is_weekend    = int(data.jour_semaine in [5, 6])
    quartier_code = data.zone_id - 1

    return [
        heure,
        heure_sin,
        heure_cos,
        data.jour_semaine,
        mois,
        mois_sin,
        mois_cos,
        data.est_saison_pluie,
        data.temperature,
        data.ensoleillement,
        data.nuages,
        data.pluie,
        data.consommation_kwh,
        data.conso_lag1,
        data.conso_lag24,
        is_peak_matin,
        is_peak_soir,
        is_nuit,
        is_weekend,
        quartier_code,
    ]


def _build_lstm_sequence(data: PredictRequest) -> np.ndarray:
    """Build a synthetic (SEQ_LEN, 9) sequence for the LSTM from request data."""
    heure = data.heure
    row = [
        data.consommation_kwh,
        data.temperature,
        data.ensoleillement,
        data.nuages,
        data.pluie,
        math.sin(2 * math.pi * heure / 24),
        math.cos(2 * math.pi * heure / 24),
        float(data.est_saison_pluie),
        float(data.jour_semaine in [5, 6]),
    ]
    # Repeat the same row for the whole sequence (best we can do without history)
    return np.tile(row, (SEQ_LEN, 1)).astype(np.float32)


@router.post("/", response_model=PredictResponse)
def predict(data: PredictRequest, db: Session = Depends(get_db)):
    cache_key = f"predict:{data.zone_id}:{data.heure}:{data.temperature}"
    cached = get_cache(cache_key)
    if cached:
        return PredictResponse(**cached)

    # ── Random Forest prediction ──────────────────────────────────────────
    rf_features = _build_rf_features(data)
    result = ml_predict_risque(rf_features)
    score  = result["score"]
    niveau = result["niveau"]

    # ── LSTM 24h forecast ─────────────────────────────────────────────────
    sequence    = _build_lstm_sequence(data)
    prevision   = predict_consommation_lstm(sequence)
    conso_prevue = round(float(np.mean(prevision)), 2)

    # ── Persist to DB ─────────────────────────────────────────────────────
    prediction = Prediction(
        zone_id=data.zone_id,
        score_risque=score,
        niveau_risque=niveau,
        consommation_prevue_kwh=conso_prevue,
        horizon_heures=24,
        created_at=datetime.utcnow(),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    delete_cache("impact:environnemental")

    response = {
        "zone_id": data.zone_id,
        "score_risque": round(score, 4),
        "niveau_risque": niveau,
        "consommation_prevue_kwh": conso_prevue,
        "prevision_24h": prevision,
        "message": f"Zone {data.zone_id} - Risque {niveau} (score: {score:.2%})",
    }
    set_cache(cache_key, response, ttl=300)
    return PredictResponse(**response)


@router.get("/historique/{zone_id}")
def historique_predictions(zone_id: int, db: Session = Depends(get_db)):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.zone_id == zone_id)
        .order_by(Prediction.created_at.desc())
        .limit(24)
        .all()
    )
    return predictions
