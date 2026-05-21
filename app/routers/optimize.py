from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.zone import Zone
from app.models.prediction import Prediction
from app.cache import get_cache, set_cache
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/optimize", tags=["Optimisation"])

class ZoneOptimisation(BaseModel):
    zone_id: int
    nom: str
    est_critique: bool
    niveau_risque: str
    allocation_pct: float
    priorite: int
    action: str

class OptimizeResponse(BaseModel):
    total_zones: int
    zones: List[ZoneOptimisation]
    message: str

@router.get("/", response_model=OptimizeResponse)
def optimiser_distribution(db: Session = Depends(get_db)):
    cached = get_cache("optimize:distribution")
    if cached:
        return cached

    zones = db.query(Zone).all()
    if not zones:
        return OptimizeResponse(
            total_zones=0,
            zones=[],
            message="Aucune zone enregistrée"
        )

    resultats = []
    for zone in zones:
        derniere_pred = db.query(Prediction).filter(
            Prediction.zone_id == zone.id
        ).order_by(Prediction.created_at.desc()).first()

        niveau = derniere_pred.niveau_risque if derniere_pred else "Faible"

        if zone.est_critique:
            priorite, allocation, action = 1, 100.0, "Alimentation prioritaire garantie"
        elif niveau == "Critique":
            priorite, allocation, action = 2, 90.0, "Renforcement immédiat nécessaire"
        elif niveau == "Élevé":
            priorite, allocation, action = 3, 75.0, "Surveillance renforcée"
        elif niveau == "Moyen":
            priorite, allocation, action = 4, 60.0, "Distribution normale"
        else:
            priorite, allocation, action = 5, 50.0, "Distribution standard"

        resultats.append(ZoneOptimisation(
            zone_id=zone.id,
            nom=zone.nom,
            est_critique=zone.est_critique,
            niveau_risque=niveau,
            allocation_pct=allocation,
            priorite=priorite,
            action=action
        ))

    resultats.sort(key=lambda x: x.priorite)

    response = OptimizeResponse(
        total_zones=len(resultats),
        zones=resultats,
        message="Distribution optimisée — zones critiques alimentées en priorité"
    )

    set_cache("optimize:distribution", response.model_dump(), ttl=120)
    return response