from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import predict, optimize, maintenance, mini_grid, impact
from app.ml_models.loader import load_models
from app.cache import REDIS_AVAILABLE

# Créer toutes les tables
Base.metadata.create_all(bind=engine)

# Initialiser l'application
app = FastAPI(
    title="EnergyGuard CI",
    description="Système intelligent d'optimisation énergétique en Côte d'Ivoire",
    version="1.0.0"
)

# CORS pour Dev 3
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger les modèles ML au démarrage
@app.on_event("startup")
async def startup_event():
    load_models()

# Enregistrer les routers
app.include_router(predict.router)
app.include_router(optimize.router)
app.include_router(maintenance.router)
app.include_router(mini_grid.router)
app.include_router(impact.router)

@app.get("/")
def root():
    return {
        "projet": "EnergyGuard CI",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "redis": "connecté" if REDIS_AVAILABLE else "indisponible"
    }