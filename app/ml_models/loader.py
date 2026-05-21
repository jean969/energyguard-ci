import joblib
import numpy as np
import os
import torch
import torch.nn as nn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

RF_MODEL_PATH      = os.path.join(BASE_DIR, "model_rf.pkl")
IF_MODEL_PATH      = os.path.join(BASE_DIR, "model_anomaly.pkl")
SCALER_IF_PATH     = os.path.join(BASE_DIR, "scaler_anomaly.pkl")
LSTM_MODEL_PATH    = os.path.join(BASE_DIR, "model_lstm.pt")
SCALER_LSTM_PATH   = os.path.join(BASE_DIR, "scaler_lstm.pkl")
SCALER_TARGET_PATH = os.path.join(BASE_DIR, "scaler_lstm_target.pkl")

rf_model      = None
if_model      = None
scaler_if     = None
lstm_model    = None
scaler_lstm   = None
scaler_target = None

SEQ_LEN = 48
HORIZON  = 24
FEATURES_LSTM = ['consommation_kwh', 'temperature', 'ensoleillement', 'nuages',
                 'pluie', 'heure_sin', 'heure_cos', 'saison_pluies', 'is_weekend']

class LSTMModel(nn.Module):
    def __init__(self, input_size=9, hidden_size=128, num_layers=2, output_size=24, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers=num_layers,
                            batch_first=True, dropout=dropout)
        self.fc1  = nn.Linear(hidden_size, 64)
        self.relu = nn.ReLU()
        self.fc2  = nn.Linear(64, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc2(self.relu(self.fc1(out[:, -1, :])))


def load_models():
    global rf_model, if_model, scaler_if, lstm_model, scaler_lstm, scaler_target

    if os.path.exists(RF_MODEL_PATH):
        rf_model = joblib.load(RF_MODEL_PATH)
        print("[OK] Random Forest charge")
    else:
        print("[WARN] Random Forest non trouve -- mode simule")

    if os.path.exists(IF_MODEL_PATH):
        if_model = joblib.load(IF_MODEL_PATH)
        print("[OK] Isolation Forest charge")
    else:
        print("[WARN] Isolation Forest non trouve -- mode simule")

    if os.path.exists(SCALER_IF_PATH):
        scaler_if = joblib.load(SCALER_IF_PATH)

    if os.path.exists(LSTM_MODEL_PATH):
        checkpoint = torch.load(LSTM_MODEL_PATH, map_location=torch.device('cpu'))
        cfg = checkpoint.get('model_config', {})
        lstm_model = LSTMModel(
            input_size=cfg.get('input_size', 9),
            hidden_size=cfg.get('hidden_size', 128),
            num_layers=cfg.get('num_layers', 2),
            output_size=cfg.get('output_size', 24)
        )
        lstm_model.load_state_dict(checkpoint['model_state_dict'])
        lstm_model.eval()
        print("[OK] LSTM (PyTorch) charge")
    else:
        print("[WARN] LSTM non trouve -- mode simule")

    if os.path.exists(SCALER_LSTM_PATH):
        scaler_lstm = joblib.load(SCALER_LSTM_PATH)
    if os.path.exists(SCALER_TARGET_PATH):
        scaler_target = joblib.load(SCALER_TARGET_PATH)


def predict_risque(features: list) -> dict:
    """
    Prédit le risque de coupure via Random Forest.
    features = [heure, heure_sin, heure_cos, jour_semaine, mois, mois_sin, mois_cos,
                saison_pluies, temperature, ensoleillement, nuages, pluie,
                consommation_kwh, conso_lag1, conso_lag24,
                is_peak_matin, is_peak_soir, is_nuit, is_weekend, quartier_code]
    Retourne: {'score': float, 'label': int, 'niveau': str}
    """
    LABELS = {0: 'Faible', 1: 'Moyen', 2: 'Élevé', 3: 'Critique'}
    if rf_model is not None:
        X = np.array(features).reshape(1, -1)
        label = int(rf_model.predict(X)[0])
        probas = rf_model.predict_proba(X)[0]
        score = float(probas[label])
        return {'score': score, 'label': label, 'niveau': LABELS[label]}
    else:
        # Mode simulé
        temperature = features[8] if len(features) > 8 else 28
        heure       = features[0] if len(features) > 0 else 12
        saison      = features[7] if len(features) > 7 else 0
        score = 0.0
        if temperature > 30: score += 0.3
        if saison == 1: score += 0.3
        if heure in [7, 8, 19, 20, 21]: score += 0.2
        score = min(score, 1.0)
        label = min(int(score / 0.25), 3)
        return {'score': score, 'label': label, 'niveau': LABELS[label]}


def predict_consommation_lstm(sequence: np.ndarray) -> list:
    """
    Prédit la consommation sur 24h via LSTM PyTorch.
    sequence : array (48, 9) des 48 dernières heures normalisées
    Retourne : liste de 24 valeurs en kWh
    """
    if lstm_model is not None and scaler_lstm is not None and scaler_target is not None:
        seq_scaled = scaler_lstm.transform(sequence)
        X = torch.FloatTensor(seq_scaled).unsqueeze(0)
        with torch.no_grad():
            pred_scaled = lstm_model(X).numpy()
        pred_kwh = scaler_target.inverse_transform(pred_scaled)[0]
        return [round(float(v), 2) for v in pred_kwh]
    else:
        base = float(np.mean(sequence[:, 0])) if sequence is not None else 150.0
        return [round(base * (1 + 0.05 * np.sin(i)), 2) for i in range(24)]


def detect_anomalie(features: list) -> dict:
    """
    Détecte une anomalie équipement via Isolation Forest.
    features = [voltage, frequence, charge_transfo, vibration, temp_transfo,
                consommation_kwh, temperature, heure, saison_pluies]
    Retourne: {'score': float, 'anomalie': bool}
    """
    if if_model is not None and scaler_if is not None:
        X = np.array(features).reshape(1, -1)
        X_scaled = scaler_if.transform(X)
        pred = if_model.predict(X_scaled)[0]
        score_raw = if_model.decision_function(X_scaled)[0]
        score_normalise = float(max(0.0, min(1.0, 0.5 - score_raw)))
        return {'score': score_normalise, 'anomalie': pred == -1}
    else:
        temp, charge = features[4], features[2]
        score = 0.0
        if temp > 80: score += 0.5
        if charge > 90: score += 0.4
        score = min(score, 1.0)
        return {'score': score, 'anomalie': score > 0.5}
