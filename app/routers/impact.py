from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.prediction import Prediction
from app.cache import get_cache, set_cache
from pydantic import BaseModel

router = APIRouter(prefix="/impact", tags=["Impact Environnemental"])

class ImpactResponse(BaseModel):
    total_predictions: int
    coupures_evitees: int
    co2_evite_kg: float
    litres_diesel_non_brules: float
    arbres_preserves: float
    kwh_optimises: float
    message: str

@router.get("/", response_model=ImpactResponse)
def calculer_impact(db: Session = Depends(get_db)):
    cached = get_cache("impact:environnemental")
    if cached:
        return cached

    from app.models.zone import Zone
    from sqlalchemy import func

    # Une seule prédiction par zone (la plus récente)
    zones = db.query(Zone).all()
    predictions = []
    for zone in zones:
        p = db.query(Prediction).filter(
            Prediction.zone_id == zone.id
        ).order_by(Prediction.created_at.desc()).first()
        if p:
            predictions.append(p)

    coupures_evitees = len([
        p for p in predictions
        if p.niveau_risque in ["Élevé", "Critique", "Eleve"]
    ])

    litres_diesel = coupures_evitees * 6
    co2_evite = round(litres_diesel * 2.68, 2)
    arbres_preserves = round(co2_evite / 0.06, 1)
    # kWh optimisés = somme des consommations prévues par zone (1 par zone)
    kwh_optimises = round(sum([
        p.consommation_prevue_kwh for p in predictions
        if p.consommation_prevue_kwh is not None
    ]), 2)

    response = ImpactResponse(
        total_predictions=len(predictions),
        coupures_evitees=coupures_evitees,
        co2_evite_kg=co2_evite,
        litres_diesel_non_brules=float(litres_diesel),
        arbres_preserves=arbres_preserves,
        kwh_optimises=kwh_optimises,
        message=f"{coupures_evitees} coupures évitées — {co2_evite} kg de CO₂ économisés"
    )

    set_cache("impact:environnemental", response.model_dump(), ttl=300)
    return response