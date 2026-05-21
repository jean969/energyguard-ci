"""
Service qui exécute le vrai Random Forest + LSTM sur toutes les zones.
Appelé au démarrage et à chaque requête /optimize/.
"""
import math
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.zone import Zone
from app.models.consommation import Consommation
from app.models.prediction import Prediction
from app.ml_models.loader import predict_risque, predict_consommation_lstm, SEQ_LEN
import numpy as np


def _build_rf_features(zone: Zone, conso: Consommation | None) -> list:
    """Construit le vecteur de 20 features pour le Random Forest."""
    now = datetime.utcnow()
    heure = now.hour
    mois  = now.month

    heure_sin = math.sin(2 * math.pi * heure / 24)
    heure_cos = math.cos(2 * math.pi * heure / 24)
    mois_sin  = math.sin(2 * math.pi * mois / 12)
    mois_cos  = math.cos(2 * math.pi * mois / 12)

    # Saison des pluies en Côte d'Ivoire : avril-juillet, oct-nov
    saison_pluies = int(mois in [4, 5, 6, 7, 10, 11])

    temperature    = conso.temperature    if conso and conso.temperature    else 30.0
    ensoleillement = conso.ensoleillement if conso and conso.ensoleillement else 60.0
    conso_kwh      = conso.valeur_kwh     if conso and conso.valeur_kwh     else 150.0
    jour_semaine   = conso.jour_semaine   if conso and conso.jour_semaine   else now.weekday()

    is_peak_matin = int(heure in [6, 7, 8, 9, 10])
    is_peak_soir  = int(heure in [18, 19, 20, 21])
    is_nuit       = int(heure in [22, 23, 0, 1, 2, 3, 4, 5])
    is_weekend    = int(jour_semaine in [5, 6])
    quartier_code = zone.id - 1

    nuages = 50.0
    pluie  = 5.0 if saison_pluies else 0.0

    return [
        heure, heure_sin, heure_cos,
        jour_semaine, mois, mois_sin, mois_cos,
        saison_pluies,
        temperature, ensoleillement, nuages, pluie,
        conso_kwh, conso_kwh * 0.97, conso_kwh * 0.99,  # lag1, lag24
        is_peak_matin, is_peak_soir, is_nuit, is_weekend,
        quartier_code,
    ]


def _build_lstm_sequence(conso_kwh: float, heure: int, saison: int, is_weekend: int) -> np.ndarray:
    """Construit la séquence (SEQ_LEN, 9) pour le LSTM."""
    row = [
        conso_kwh,
        30.0,   # temperature
        60.0,   # ensoleillement
        50.0,   # nuages
        0.0,    # pluie
        math.sin(2 * math.pi * heure / 24),
        math.cos(2 * math.pi * heure / 24),
        float(saison),
        float(is_weekend),
    ]
    return np.tile(row, (SEQ_LEN, 1)).astype(np.float32)


def rafraichir_predictions_rf(db: Session) -> int:
    """
    Exécute le vrai Random Forest sur toutes les zones,
    sauvegarde les nouvelles prédictions en DB.
    Retourne le nombre de zones traitées.
    """
    zones = db.query(Zone).all()
    now   = datetime.utcnow()
    heure = now.hour
    mois  = now.month
    saison_pluies = int(mois in [4, 5, 6, 7, 10, 11])
    is_weekend    = int(now.weekday() in [5, 6])

    count = 0
    for zone in zones:
        # Dernière consommation connue pour cette zone
        conso = (
            db.query(Consommation)
            .filter(Consommation.zone_id == zone.id)
            .order_by(Consommation.created_at.desc())
            .first()
        )

        # ── Random Forest ──────────────────────────────────────────────────
        features = _build_rf_features(zone, conso)
        rf_result = predict_risque(features)

        # ── LSTM 24h ───────────────────────────────────────────────────────
        conso_kwh = conso.valeur_kwh if conso else 150.0
        sequence  = _build_lstm_sequence(conso_kwh, heure, saison_pluies, is_weekend)
        prevision = predict_consommation_lstm(sequence)
        conso_prevue = round(float(np.mean(prevision)), 2)

        # ── Sauvegarde en DB ───────────────────────────────────────────────
        pred = Prediction(
            zone_id=zone.id,
            score_risque=rf_result["score"],
            niveau_risque=rf_result["niveau"],
            consommation_prevue_kwh=conso_prevue,
            horizon_heures=24,
            created_at=now,
        )
        db.add(pred)
        count += 1

    db.commit()
    print(f"[RF+LSTM] {count} zones predites avec les vrais modeles IA")
    return count
