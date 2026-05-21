from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.prediction import Prediction
from app.cache import get_cache, set_cache
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/predict", tags=["Prédiction"])

class PredictRequest(BaseModel):
    zone_id: int
    temperature: float
    ensoleillement: float
    heure: int
    jour_semaine: int
    est_saison_pluie: int

class PredictResponse(BaseModel):
    zone_id: int
    score_risque: float
    niveau_risque: str
    consommation_prevue_kwh: float
    message: str

def calculer_niveau(score: float) -> str:
    if score < 0.25:
        return "Faible"
    elif score < 0.50:
        return "Moyen"
    elif score < 0.75:
        return "Élevé"
    else:
        return "Critique"

@router.post("/", response_model=PredictResponse)
def predict_risque(data: PredictRequest, db: Session = Depends(get_db)):
    score = 0.0
    if data.ensoleillement < 30: score += 0.3
    if data.temperature > 35: score += 0.2
    if data.heure in [7, 8, 9, 18, 19, 20]: score += 0.25
    if data.est_saison_pluie == 1: score += 0.15
    if data.jour_semaine in [0, 4]: score += 0.1
    score = min(score, 1.0)

    niveau = calculer_niveau(score)
    consommation_prevue = round(150 + (score * 100), 2)

    prediction = Prediction(
        zone_id=data.zone_id,
        score_risque=score,
        niveau_risque=niveau,
        consommation_prevue_kwh=consommation_prevue,
        horizon_heures=24,
        created_at=datetime.utcnow()
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # Invalider le cache impact après nouvelle prédiction
    from app.cache import delete_cache
    delete_cache("impact:environnemental")

    return PredictResponse(
        zone_id=data.zone_id,
        score_risque=round(score, 2),
        niveau_risque=niveau,
        consommation_prevue_kwh=consommation_prevue,
        message=f"Zone {data.zone_id} — Risque {niveau} détecté"
    )

@router.get("/historique/{zone_id}")
def historique_predictions(zone_id: int, db: Session = Depends(get_db)):
    predictions = db.query(Prediction).filter(
        Prediction.zone_id == zone_id
    ).order_by(Prediction.created_at.desc()).limit(24).all()
    return predictions