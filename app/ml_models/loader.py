import joblib
import numpy as np
import os

# TensorFlow chargé uniquement si disponible
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError: 
    TF_AVAILABLE = False

# Chemins des modèles
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RF_MODEL_PATH = os.path.join(BASE_DIR, "random_forest.pkl")
IF_MODEL_PATH = os.path.join(BASE_DIR, "isolation_forest.pkl")
LSTM_MODEL_PATH = os.path.join(BASE_DIR, "lstm_model.h5")

# Variables globales des modèles
rf_model = None
if_model = None
lstm_model = None

def load_models():
    """Charge tous les modèles ML au démarrage de l'application."""
    global rf_model, if_model, lstm_model

    # Charger Random Forest
    if os.path.exists(RF_MODEL_PATH):
        rf_model = joblib.load(RF_MODEL_PATH)
        print("✅ Random Forest chargé")
    else:
        print("⚠️  Random Forest non trouvé — mode simulé activé")

    # Charger Isolation Forest
    if os.path.exists(IF_MODEL_PATH):
        if_model = joblib.load(IF_MODEL_PATH)
        print("✅ Isolation Forest chargé")
    else:
        print("⚠️  Isolation Forest non trouvé — mode simulé activé")

    # Charger LSTM
    if os.path.exists(LSTM_MODEL_PATH) and TF_AVAILABLE:
        lstm_model = tf.keras.models.load_model(LSTM_MODEL_PATH)
        print("✅ LSTM chargé")
    else:
        print("⚠️  LSTM non trouvé — mode simulé activé")

def predict_risque(features: list) -> float:
    """
    Prédit le score de risque de coupure.
    features = [temperature, ensoleillement, heure, jour_semaine, est_saison_pluie]
    Retourne un score entre 0.0 et 1.0
    """
    if rf_model is not None:
        features_array = np.array(features).reshape(1, -1)
        score = rf_model.predict_proba(features_array)[0][1]
        return float(score)
    else:
        # Mode simulé si modèle absent
        temperature, ensoleillement, heure, jour_semaine, est_saison_pluie = features
        score = 0.0
        if ensoleillement < 30: score += 0.3
        if temperature > 35: score += 0.2
        if heure in [7, 8, 9, 18, 19, 20]: score += 0.25
        if est_saison_pluie == 1: score += 0.15
        if jour_semaine in [0, 4]: score += 0.1
        return min(score, 1.0)

def predict_consommation(sequence: list) -> float:
    """
    Prédit la consommation énergétique sur 24h via LSTM.
    sequence = liste de valeurs historiques de consommation
    Retourne la consommation prévue en kWh
    """
    if lstm_model is not None and TF_AVAILABLE:
        sequence_array = np.array(sequence).reshape(1, len(sequence), 1)
        prediction = lstm_model.predict(sequence_array)
        return float(prediction[0][0])
    else:
        # Mode simulé
        if sequence:
            return round(sum(sequence) / len(sequence) * 1.1, 2)
        return 150.0

def detect_anomalie(features: list) -> float:
    """
    Détecte les anomalies sur les équipements via Isolation Forest.
    features = [temperature_actuelle, charge_actuelle]
    Retourne un score d'anomalie entre 0.0 et 1.0
    """
    if if_model is not None:
        features_array = np.array(features).reshape(1, -1)
        score = if_model.decision_function(features_array)[0]
        # Normaliser entre 0 et 1
        score_normalise = max(0.0, min(1.0, (0.5 - score)))
        return float(score_normalise)
    else:
        # Mode simulé
        temperature, charge = features
        score = 0.0
        if temperature > 80: score += 0.5
        if charge > 90: score += 0.4
        return min(score, 1.0)