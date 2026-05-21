from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routers import predict, optimize, maintenance, mini_grid, impact
from app.ml_models.loader import load_models
from app.cache import REDIS_AVAILABLE

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EnergyGuard CI",
    description="Systeme intelligent d'optimisation energetique en Cote d'Ivoire",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # 1. Charger les modeles ML
    load_models()

    # 2. Lancer le vrai Random Forest + LSTM sur toutes les zones
    from app.services.prediction_service import rafraichir_predictions_rf
    db = SessionLocal()
    try:
        n = rafraichir_predictions_rf(db)
        print(f"[STARTUP] Predictions RF+LSTM calculees pour {n} zones")
    except Exception as e:
        print(f"[STARTUP] Erreur predictions initiales: {e}")
    finally:
        db.close()

app.include_router(predict.router)
app.include_router(optimize.router)
app.include_router(maintenance.router)
app.include_router(mini_grid.router)
app.include_router(impact.router)

@app.get("/")
def root():
    return {"projet": "EnergyGuard CI", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "redis": "connecte" if REDIS_AVAILABLE else "indisponible"}
