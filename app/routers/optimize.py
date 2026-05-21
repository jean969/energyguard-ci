import numpy as np
from scipy.optimize import linprog
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.zone import Zone
from app.models.prediction import Prediction
from app.models.consommation import Consommation
from app.cache import get_cache, set_cache
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/optimize", tags=["Optimisation"])

# Priorité par niveau de risque (plus haut = plus urgent)
RISK_PRIORITY = {"Critique": 1.0, "Eleve": 0.85, "Moyen": 0.65, "Faible": 0.45}
# Garantie minimale par niveau de risque (% de la demande)
RISK_MIN_RATIO = {"Critique": 0.90, "Eleve": 0.75, "Moyen": 0.60, "Faible": 0.50}

ENERGIE_TOTALE_DISPONIBLE = 2000.0  # kWh total à distribuer (paramètre démo)


class ZoneOptimisation(BaseModel):
    zone_id: int
    nom: str
    est_critique: bool
    niveau_risque: str
    score_risque: float
    demande_kwh: float
    allocation_kwh: float
    allocation_pct: float
    deficit_kwh: float
    taux_service: float
    priorite: int
    action: str


class OptimizeResponse(BaseModel):
    total_zones: int
    energie_disponible: float
    energie_demandee: float
    energie_allouee: float
    deficit_total: float
    optimisation_succes: bool
    zones: List[ZoneOptimisation]
    message: str


@router.get("/", response_model=OptimizeResponse)
def optimiser_distribution(db: Session = Depends(get_db), refresh: bool = False):
    if not refresh:
        cached = get_cache("optimize:distribution")
        if cached:
            return cached

    # Rafraîchir les prédictions RF+LSTM avant d'optimiser
    from app.services.prediction_service import rafraichir_predictions_rf
    from app.cache import delete_cache
    try:
        rafraichir_predictions_rf(db)
        delete_cache("optimize:distribution")
    except Exception as e:
        print(f"[OPTIMIZE] Erreur RF refresh: {e}")

    zones = db.query(Zone).all()
    if not zones:
        return OptimizeResponse(
            total_zones=0, energie_disponible=ENERGIE_TOTALE_DISPONIBLE,
            energie_demandee=0, energie_allouee=0, deficit_total=0,
            optimisation_succes=False, zones=[],
            message="Aucune zone enregistree",
        )

    # Récupérer dernière prédiction et consommation par zone
    zones_data = []
    for zone in zones:
        pred = (
            db.query(Prediction)
            .filter(Prediction.zone_id == zone.id)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        conso = (
            db.query(Consommation)
            .filter(Consommation.zone_id == zone.id)
            .order_by(Consommation.created_at.desc())
            .first()
        )
        niveau = pred.niveau_risque if pred else "Faible"
        score_risque = round(pred.score_risque, 4) if pred else 0.0
        # Normaliser les niveaux avec accents
        niveau_norm = niveau.replace("É", "E").replace("é", "e").replace("è", "e")
        if "lev" in niveau_norm.lower() or "lev" in niveau.lower():
            niveau_key = "Eleve"
        elif "critique" in niveau.lower():
            niveau_key = "Critique"
        elif "moyen" in niveau.lower():
            niveau_key = "Moyen"
        else:
            niveau_key = "Faible"

        demande = (
            pred.consommation_prevue_kwh if pred and pred.consommation_prevue_kwh
            else (conso.valeur_kwh if conso else 150.0)
        )
        # Les zones critiques (hôpitaux, écoles) ont un bonus de priorité
        prio = RISK_PRIORITY.get(niveau_key, 0.45)
        if zone.est_critique:
            prio = 1.0

        zones_data.append({
            "zone": zone,
            "niveau": niveau,
            "score_risque": score_risque,
            "niveau_key": niveau_key,
            "demande": demande,
            "priorite": prio,
            "min_ratio": RISK_MIN_RATIO.get(niveau_key, 0.50),
        })

    n = len(zones_data)
    demandes = np.array([z["demande"] for z in zones_data])
    prios = np.array([z["priorite"] for z in zones_data])
    min_ratios = np.array([z["min_ratio"] for z in zones_data])

    # scipy linprog — minimise -priorité (= maximise priorité pondérée)
    c = -prios
    A_ub = [np.ones(n)]
    b_ub = [ENERGIE_TOTALE_DISPONIBLE]
    bounds = [(min_ratios[i] * demandes[i], demandes[i]) for i in range(n)]

    result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

    if result.success:
        allocations = result.x
        succes = True
    else:
        # Fallback proportionnel aux priorités
        total_prio = prios.sum()
        allocations = np.minimum((prios / total_prio) * ENERGIE_TOTALE_DISPONIBLE, demandes)
        succes = False

    deficits = demandes - allocations
    taux_service = allocations / demandes * 100

    resultats = []
    for i, zd in enumerate(zones_data):
        zone = zd["zone"]
        niveau_key = zd["niveau_key"]
        taux = taux_service[i]

        if taux >= 90:
            action = "Alimentation normale garantie"
            rang = 5
        elif taux >= 75:
            action = "Distribution optimisee - surveillance"
            rang = 4
        elif taux >= 60:
            action = "Reduction appliquee - non essentiel limite"
            rang = 3
        else:
            action = "Deficit - intervention requise"
            rang = 2

        if zone.est_critique:
            rang = 1
            action = "Zone critique - alimentation prioritaire"

        resultats.append(ZoneOptimisation(
            zone_id=zone.id,
            nom=zone.nom,
            est_critique=zone.est_critique,
            niveau_risque=zd["niveau"],
            score_risque=zd["score_risque"],
            demande_kwh=round(float(demandes[i]), 2),
            allocation_kwh=round(float(allocations[i]), 2),
            allocation_pct=round(float(taux), 1),
            deficit_kwh=round(float(deficits[i]), 2),
            taux_service=round(float(taux), 1),
            priorite=rang,
            action=action,
        ))

    resultats.sort(key=lambda x: x.priorite)

    response = OptimizeResponse(
        total_zones=len(resultats),
        energie_disponible=ENERGIE_TOTALE_DISPONIBLE,
        energie_demandee=round(float(demandes.sum()), 2),
        energie_allouee=round(float(allocations.sum()), 2),
        deficit_total=round(float(deficits.sum()), 2),
        optimisation_succes=succes,
        zones=resultats,
        message=f"scipy linprog HiGHS - {len(resultats)} zones optimisees ({'succes' if succes else 'fallback'})",
    )

    set_cache("optimize:distribution", response.model_dump(), ttl=120)
    return response
