from app.database import SessionLocal, engine, Base
from app.models.zone import Zone
from app.models.consommation import Consommation
from app.models.prediction import Prediction
from app.models.alerte import Alerte
from app.models.equipement import Equipement
from app.models.mini_reseau import MiniReseau
from datetime import datetime

# Créer toutes les tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("🌱 Insertion des données de test...")

# ─── ZONES ───────────────────────────────────────────
zones = [
    Zone(nom="Hôpital Cocody", type_zone="urbain", latitude=5.3600, longitude=-3.9800, population=500, est_critique=True),
    Zone(nom="École Yopougon", type_zone="urbain", latitude=5.3200, longitude=-4.0600, population=1200, est_critique=True),
    Zone(nom="Quartier Abobo", type_zone="urbain", latitude=5.4100, longitude=-4.0200, population=45000, est_critique=False),
    Zone(nom="Quartier Koumassi", type_zone="urbain", latitude=5.2900, longitude=-3.9400, population=38000, est_critique=False),
    Zone(nom="Village Boundiali", type_zone="rural", latitude=9.5200, longitude=-6.4800, population=3200, est_critique=False),
    Zone(nom="Village Korhogo", type_zone="rural", latitude=9.4500, longitude=-5.6300, population=4100, est_critique=False),
    Zone(nom="Village Odienné", type_zone="rural", latitude=9.5100, longitude=-7.5600, population=2800, est_critique=False),
]
db.add_all(zones)
db.commit()
print(f"  ✅ {len(zones)} zones insérées")

# ─── CONSOMMATIONS ───────────────────────────────────
consommations = [
    Consommation(zone_id=1, valeur_kwh=320.5, temperature=31.0, ensoleillement=75.0, heure=14, jour_semaine=1, est_saison_pluie=0),
    Consommation(zone_id=2, valeur_kwh=185.0, temperature=29.5, ensoleillement=60.0, heure=10, jour_semaine=2, est_saison_pluie=0),
    Consommation(zone_id=3, valeur_kwh=520.0, temperature=33.0, ensoleillement=20.0, heure=19, jour_semaine=3, est_saison_pluie=1),
    Consommation(zone_id=4, valeur_kwh=410.0, temperature=32.0, ensoleillement=45.0, heure=18, jour_semaine=4, est_saison_pluie=1),
    Consommation(zone_id=5, valeur_kwh=95.0,  temperature=28.0, ensoleillement=85.0, heure=12, jour_semaine=1, est_saison_pluie=0),
    Consommation(zone_id=6, valeur_kwh=110.0, temperature=30.0, ensoleillement=70.0, heure=11, jour_semaine=2, est_saison_pluie=0),
    Consommation(zone_id=7, valeur_kwh=78.0,  temperature=27.0, ensoleillement=90.0, heure=13, jour_semaine=3, est_saison_pluie=0),
]
db.add_all(consommations)
db.commit()
print(f"  ✅ {len(consommations)} consommations insérées")

# ─── PRÉDICTIONS ─────────────────────────────────────
predictions = [
    Prediction(zone_id=1, score_risque=0.15, niveau_risque="Faible",   consommation_prevue_kwh=330.0, horizon_heures=24),
    Prediction(zone_id=2, score_risque=0.35, niveau_risque="Moyen",    consommation_prevue_kwh=200.0, horizon_heures=24),
    Prediction(zone_id=3, score_risque=0.78, niveau_risque="Élevé",    consommation_prevue_kwh=550.0, horizon_heures=24),
    Prediction(zone_id=4, score_risque=0.92, niveau_risque="Critique",  consommation_prevue_kwh=480.0, horizon_heures=24),
    Prediction(zone_id=5, score_risque=0.20, niveau_risque="Faible",   consommation_prevue_kwh=100.0, horizon_heures=24),
    Prediction(zone_id=6, score_risque=0.45, niveau_risque="Moyen",    consommation_prevue_kwh=120.0, horizon_heures=24),
    Prediction(zone_id=7, score_risque=0.10, niveau_risque="Faible",   consommation_prevue_kwh=80.0,  horizon_heures=24),
]
db.add_all(predictions)
db.commit()
print(f"  ✅ {len(predictions)} prédictions insérées")

# ─── ALERTES ─────────────────────────────────────────
alertes = [
    Alerte(zone_id=3, type_alerte="coupure",   niveau="Élevé",   message="Risque élevé de coupure détecté à Abobo — pic de consommation prévu à 19h"),
    Alerte(zone_id=4, type_alerte="surcharge",  niveau="Critique", message="Surcharge critique à Koumassi — redistribution automatique activée"),
    Alerte(zone_id=6, type_alerte="anomalie",   niveau="Élevé",   message="Transformateur T-06 à Korhogo — température anormale détectée"),
]
db.add_all(alertes)
db.commit()
print(f"  ✅ {len(alertes)} alertes insérées")

# ─── ÉQUIPEMENTS ─────────────────────────────────────
equipements = [
    Equipement(zone_id=1, nom="Transformateur T-01", type_equipement="transformateur", score_anomalie=0.12, est_a_risque=False, temperature_actuelle=45.0, charge_actuelle=62.0),
    Equipement(zone_id=2, nom="Transformateur T-02", type_equipement="transformateur", score_anomalie=0.35, est_a_risque=False, temperature_actuelle=55.0, charge_actuelle=71.0),
    Equipement(zone_id=3, nom="Transformateur T-03", type_equipement="transformateur", score_anomalie=0.72, est_a_risque=True,  temperature_actuelle=78.0, charge_actuelle=91.0),
    Equipement(zone_id=4, nom="Transformateur T-04", type_equipement="transformateur", score_anomalie=0.88, est_a_risque=True,  temperature_actuelle=85.0, charge_actuelle=96.0),
    Equipement(zone_id=5, nom="Batterie Solaire B-01", type_equipement="batterie",    score_anomalie=0.18, est_a_risque=False, temperature_actuelle=32.0, charge_actuelle=75.0),
    Equipement(zone_id=6, nom="Batterie Solaire B-02", type_equipement="batterie",    score_anomalie=0.65, est_a_risque=True,  temperature_actuelle=48.0, charge_actuelle=88.0),
]
db.add_all(equipements)
db.commit()
print(f"  ✅ {len(equipements)} équipements insérés")

# ─── MINI-RÉSEAUX ─────────────────────────────────────
mini_reseaux = [
    MiniReseau(zone_id=5, nom_village="Boundiali", nb_panneaux_solaires=30, capacite_batterie_kwh=120.0, niveau_batterie_pct=72.0, production_solaire_kwh=45.0, consommation_prevue_soir_kwh=38.0, est_alerte_batterie=False),
    MiniReseau(zone_id=6, nom_village="Korhogo",   nb_panneaux_solaires=25, capacite_batterie_kwh=100.0, niveau_batterie_pct=28.0, production_solaire_kwh=18.0, consommation_prevue_soir_kwh=35.0, est_alerte_batterie=True),
    MiniReseau(zone_id=7, nom_village="Odienné",   nb_panneaux_solaires=20, capacite_batterie_kwh=80.0,  niveau_batterie_pct=55.0, production_solaire_kwh=32.0, consommation_prevue_soir_kwh=25.0, est_alerte_batterie=False),
]
db.add_all(mini_reseaux)
db.commit()
print(f"  ✅ {len(mini_reseaux)} mini-réseaux insérés")

db.close()
print("\n🎉 Données de test insérées avec succès !")
print("   Ouvre http://127.0.0.1:8000/docs pour tester les endpoints.")