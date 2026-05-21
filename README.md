# 🔋 EnergyGuard CI

**Système intelligent d'optimisation énergétique en Côte d'Ivoire**

Un projet de gestion et optimisation de la consommation énergétique utilisant l'intelligence artificielle, conçu pour les mini-réseaux électriques en Côte d'Ivoire.

---

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Endpoints API](#endpoints-api)
- [Structure du projet](#structure-du-projet)
- [Contributions](#contributions)

---

## 📖 À propos

**EnergyGuard CI** est une application de gestion énergétique intelligente qui:
- Prédit la consommation énergétique basée sur des données historiques et météorologiques
- Optimise l'allocation des ressources énergétiques
- Gère les alertes et maintenances préventives
- Analyse l'impact énergétique des équipements
- Supporte les mini-réseaux électriques décentralisés

---

## ✨ Fonctionnalités

### 🔮 Prédiction (`/predict`)
- Prédiction de la consommation énergétique
- Modèles ML: Random Forest, Isolation Forest, LSTM
- Données d'entrée: historique de consommation, données météorologiques

### ⚡ Optimisation (`/optimize`)
- Recommandations d'optimisation de consommation
- Allocation intelligente des ressources

### 🛠️ Maintenance (`/maintenance`)
- Gestion des alertes et anomalies
- Planification de la maintenance préventive
- Suivi des équipements

### 🌐 Mini-Grid (`/mini_grid`)
- Gestion des mini-réseaux électriques
- Configuration des zones et équipements

### 📊 Impact (`/impact`)
- Anályse d'impact énergétique
- Rapports de consommation

---

## 🏗️ Architecture

```
EnergyGuard CI
├── Backend FastAPI (Port: 8000)
├── Base de données PostgreSQL/SQLite (Alembic migrations)
├── Redis (Cache et queue - Port: 6379)
├── Modèles ML (Random Forest, LSTM)
└── API Open-Meteo (Données météorologiques)
```

### Stack technologique
- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **ML**: scikit-learn, TensorFlow/PyTorch, joblib
- **Cache**: Redis
- **API météo**: Open-Meteo (httpx)
- **Env**: python-dotenv

---

## 📦 Prérequis

- Python 3.8+
- Docker Desktop (pour Redis)
- Git

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd "ENERGIE TECH"
```

### 2. Créer et activer l'environnement virtuel

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

**Dépendances principales:**
- `fastapi` - Framework web
- `sqlalchemy` - ORM
- `alembic` - Gestion des migrations
- `scikit-learn joblib` - Modèles ML (Random Forest, Isolation Forest)
- `tensorflow` ou `torch` - Modèles profonds (LSTM)
- `redis` - Cache
- `httpx` - Client HTTP pour Open-Meteo
- `python-dotenv` - Gestion des variables d'environnement

---

## ⚙️ Configuration

### 1. Lancer Redis avec Docker

**Vérifier que Docker Desktop est lancé**, puis:

```bash
# Démarrer Redis
docker run -d --name redis-energyguard -p 6379:6379 redis:7

# Tester la connexion
docker exec -it redis-energyguard redis-cli ping
# Résultat attendu: PONG
```

**Après redémarrage:**
```bash
docker start redis-energyguard
```

### 2. Variables d'environnement

Créer un fichier `.env` à la racine du projet:

```env
# Base de données
DATABASE_URL=sqlite:///./test.db
# ou pour PostgreSQL: DATABASE_URL=postgresql://user:password@localhost/dbname

# Redis
REDIS_URL=redis://localhost:6379

# API Open-Meteo
OPENMETEO_BASE_URL=https://api.open-meteo.com/v1

# FastAPI
DEBUG=True
ENVIRONMENT=development
```

### 3. Migrations de base de données

```bash
# Créer les tables
alembic upgrade head

# Ou via Python:
python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"
```

---

## 🎯 Lancement

### Mode développement

```bash
# Vérifier que l'environnement virtuel est activé
# Puis lancer l'API:
uvicorn app.main:app --reload --port 8000
```

L'API sera disponible à: **http://localhost:8000**

### Documentation interactive

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔌 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | État du projet |
| GET | `/health` | Vérification de santé |
| GET/POST | `/predict/*` | Prédiction énergétique |
| GET/POST | `/optimize/*` | Optimisation énergétique |
| GET/POST | `/maintenance/*` | Gestion maintenance |
| GET/POST | `/mini_grid/*` | Gestion mini-réseaux |
| GET/POST | `/impact/*` | Analyse d'impact |

📖 **Documentation complète**: Consultez la Swagger UI (`/docs`) après lancement

---

## 📁 Structure du projet

```
ENERGIE TECH/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Point d'entrée FastAPI
│   ├── database.py             # Configuration SQLAlchemy
│   ├── ml_models/
│   │   ├── __init__.py
│   │   └── loader.py           # Chargement des modèles ML
│   ├── models/                 # Modèles de données
│   │   ├── alerte.py
│   │   ├── consommation.py
│   │   ├── equipement.py
│   │   ├── mini_reseau.py
│   │   ├── prediction.py
│   │   └── zone.py
│   └── routers/                # Routes API
│       ├── predict.py          # Prédictions
│       ├── optimize.py         # Optimisation
│       ├── maintenance.py      # Maintenance
│       ├── mini_grid.py        # Mini-réseaux
│       └── impact.py           # Analyse d'impact
├── alembic/                    # Migrations de BD
├── requirements.txt            # Dépendances Python
├── docker-compose.yml          # Configuration Docker
├── alembic.ini                 # Config Alembic
└── README.md                   # Ce fichier
```

---

## 🔧 Dépannage

### Redis ne démarre pas
```bash
# Vérifier les conteneurs
docker ps -a

# Supprimer l'ancien conteneur et relancer
docker rm redis-energyguard
docker run -d --name redis-energyguard -p 6379:6379 redis:7
```

### Erreur de modèles ML non chargés
- Vérifier que les fichiers `.pkl` et `.h5` sont présents dans `app/ml_models/`
- Les modèles doivent être au démarrage (voir event `startup` dans `main.py`)

### Erreurs de dépendances
```bash
# Réinstaller les dépendances
pip install --upgrade -r requirements.txt
```

---

## 👥 Contributions

Les contributions sont bienvenues! Veuillez:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Committer les changements (`git commit -m 'Add AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Licence

Ce projet est sous licence [À définir]

---

## 📧 Contact & Support

- **Équipe Dev**: [À compléter]
- **Email**: [À compléter]

---

**Dernière mise à jour**: Mai 2026
