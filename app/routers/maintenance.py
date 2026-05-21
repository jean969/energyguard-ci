from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.equipement import Equipement
from app.cache import get_cache, set_cache
from app.ml_models.loader import detect_anomalie
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


class EquipementRisque(BaseModel):
    equipement_id: int
    nom: str
    type_equipement: str
    zone_id: int
    score_anomalie: float
    niveau_alerte: str
    temperature_actuelle: Optional[float]
    charge_actuelle: Optional[float]
    recommandation: str
    anomalie_detectee: bool


class MaintenanceResponse(BaseModel):
    total_equipements: int
    equipements_a_risque: int
    equipements: List[EquipementRisque]
    message: str


def _build_if_features(eq: Equipement) -> list:
    """Build the 9-feature vector for Isolation Forest from equipment data."""
    heure = datetime.utcnow().hour
    mois = datetime.utcnow().month
    # Rainy season: April-July and October-November in CI
    saison_pluies = int(mois in [4, 5, 6, 7, 10, 11])

    return [
        220.0,                                          # voltage (standard CI)
        50.0,                                           # frequence (Hz)
        eq.charge_actuelle if eq.charge_actuelle else 60.0,   # charge_transfo
        0.5 if eq.est_a_risque else 0.1,               # vibration (estimée)
        eq.temperature_actuelle if eq.temperature_actuelle else 45.0,  # temp_transfo
        150.0,                                          # consommation_kwh (défaut)
        30.0,                                           # temperature ambiante CI
        heure,
        saison_pluies,
    ]


@router.get("/", response_model=MaintenanceResponse)
def detecter_anomalies(db: Session = Depends(get_db)):
    cached = get_cache("maintenance:anomalies")
    if cached:
        return cached

    equipements = db.query(Equipement).all()
    resultats = []

    for eq in equipements:
        # Isolation Forest — vrai modèle Dev 1
        features = _build_if_features(eq)
        detection = detect_anomalie(features)
        score = detection["score"]
        anomalie = detection["anomalie"]

        # Mettre à jour le score dans la DB
        eq.score_anomalie = score
        eq.est_a_risque = anomalie

        # Seuil hybride : IF + règles physiques (temp > 70°C ou charge > 85%)
        temp_critique = (eq.temperature_actuelle or 0) > 70
        charge_critique = (eq.charge_actuelle or 0) > 85
        en_alerte = anomalie or score >= 0.50 or temp_critique or charge_critique

        if en_alerte:
            if score >= 0.85 or ((eq.temperature_actuelle or 0) > 80 and (eq.charge_actuelle or 0) > 88):
                niveau = "Critique"
                recommandation = "Intervention immediate requise"
            elif score >= 0.60 or temp_critique or charge_critique:
                niveau = "Eleve"
                recommandation = "Planifier maintenance sous 24h"
            else:
                niveau = "Moyen"
                recommandation = "Surveiller sous 72h"

            resultats.append(EquipementRisque(
                    equipement_id=eq.id,
                    nom=eq.nom,
                    type_equipement=eq.type_equipement,
                    zone_id=eq.zone_id,
                    score_anomalie=round(score, 4),
                    niveau_alerte=niveau,
                    temperature_actuelle=eq.temperature_actuelle,
                    charge_actuelle=eq.charge_actuelle,
                    recommandation=recommandation,
                    anomalie_detectee=anomalie,
                ))

    db.commit()
    resultats.sort(key=lambda x: x.score_anomalie, reverse=True)

    response = MaintenanceResponse(
        total_equipements=len(equipements),
        equipements_a_risque=len(resultats),
        equipements=resultats,
        message=f"{len(resultats)} equipement(s) avec anomalie detectee par Isolation Forest",
    )

    set_cache("maintenance:anomalies", response.model_dump(), ttl=180)
    return response
