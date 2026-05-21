from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.mini_reseau import MiniReseau
from app.cache import get_cache, set_cache
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/mini-grid", tags=["Mini Réseaux Ruraux"])

class MiniReseauStatus(BaseModel):
    id: int
    nom_village: str
    zone_id: int
    niveau_batterie_pct: float
    production_solaire_kwh: float
    consommation_prevue_soir_kwh: float
    autonomie_estimee_heures: float
    statut: str
    recommandation: str
    est_alerte_batterie: bool

class MiniGridResponse(BaseModel):
    total_villages: int
    villages_en_alerte: int
    villages: List[MiniReseauStatus]

@router.get("/", response_model=MiniGridResponse)
def etat_mini_reseaux(db: Session = Depends(get_db)):
    cached = get_cache("minigrid:status")
    if cached:
        return cached

    reseaux = db.query(MiniReseau).all()
    resultats = []

    for r in reseaux:
        if r.consommation_prevue_soir_kwh > 0:
            energie_disponible = (r.niveau_batterie_pct / 100) * r.capacite_batterie_kwh
            autonomie = round(energie_disponible / r.consommation_prevue_soir_kwh, 1)
        else:
            autonomie = 99.0

        if r.niveau_batterie_pct < 20:
            statut = "Critique"
            recommandation = "Batterie critique — réduire consommation immédiatement"
        elif r.niveau_batterie_pct < 40:
            statut = "Faible"
            recommandation = "Batterie faible — limiter usage non essentiel ce soir"
        elif r.niveau_batterie_pct < 60:
            statut = "Moyen"
            recommandation = "Autonomie suffisante pour la soirée"
        else:
            statut = "Bon"
            recommandation = "Batterie bien chargée — autonomie garantie"

        resultats.append(MiniReseauStatus(
            id=r.id,
            nom_village=r.nom_village,
            zone_id=r.zone_id,
            niveau_batterie_pct=r.niveau_batterie_pct,
            production_solaire_kwh=r.production_solaire_kwh,
            consommation_prevue_soir_kwh=r.consommation_prevue_soir_kwh,
            autonomie_estimee_heures=autonomie,
            statut=statut,
            recommandation=recommandation,
            est_alerte_batterie=r.est_alerte_batterie
        ))

    villages_en_alerte = len([v for v in resultats if v.statut in ["Critique", "Faible"]])

    response = MiniGridResponse(
        total_villages=len(resultats),
        villages_en_alerte=villages_en_alerte,
        villages=resultats
    )

    set_cache("minigrid:status", response.model_dump(), ttl=60)
    return response