from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.equipement import Equipement
from app.cache import get_cache, set_cache
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

class MaintenanceResponse(BaseModel):
    total_equipements: int
    equipements_a_risque: int
    equipements: List[EquipementRisque]
    message: str

@router.get("/", response_model=MaintenanceResponse)
def detecter_anomalies(db: Session = Depends(get_db)):
    cached = get_cache("maintenance:anomalies")
    if cached:
        return cached

    equipements = db.query(Equipement).all()
    resultats = []

    for eq in equipements:
        if eq.score_anomalie >= 0.5:
            if eq.score_anomalie >= 0.85:
                niveau = "Critique"
                recommandation = "Intervention immédiate requise"
            elif eq.score_anomalie >= 0.70:
                niveau = "Élevé"
                recommandation = "Planifier maintenance sous 24h"
            else:
                niveau = "Moyen"
                recommandation = "Surveiller sous 72h"

            resultats.append(EquipementRisque(
                equipement_id=eq.id,
                nom=eq.nom,
                type_equipement=eq.type_equipement,
                zone_id=eq.zone_id,
                score_anomalie=eq.score_anomalie,
                niveau_alerte=niveau,
                temperature_actuelle=eq.temperature_actuelle,
                charge_actuelle=eq.charge_actuelle,
                recommandation=recommandation
            ))

    resultats.sort(key=lambda x: x.score_anomalie, reverse=True)

    response = MaintenanceResponse(
        total_equipements=len(equipements),
        equipements_a_risque=len(resultats),
        equipements=resultats,
        message=f"{len(resultats)} équipement(s) nécessitent une attention"
    )

    set_cache("maintenance:anomalies", response.model_dump(), ttl=180)
    return response