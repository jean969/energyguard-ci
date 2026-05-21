const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PredictRequest {
  zone_id: number;
  temperature: number;
  ensoleillement: number;
  heure: number;
  jour_semaine: number;
  est_saison_pluie: number;
  nuages?: number;
  pluie?: number;
  consommation_kwh?: number;
  conso_lag1?: number;
  conso_lag24?: number;
}

export interface PredictResponse {
  zone_id: number;
  score_risque: number;
  niveau_risque: string;
  consommation_prevue_kwh: number;
  prevision_24h: number[];
  message: string;
}

export interface OptimizeZone {
  zone_id: number;
  nom: string;
  est_critique: boolean;
  niveau_risque: string;
  score_risque: number;
  demande_kwh: number;
  allocation_kwh: number;
  allocation_pct: number;
  deficit_kwh: number;
  taux_service: number;
  priorite: number;
  action: string;
}

export interface OptimizeResponse {
  total_zones: number;
  zones: OptimizeZone[];
  message: string;
}

export interface EquipementRisque {
  equipement_id: number;
  nom: string;
  type_equipement: string;
  zone_id: number;
  score_anomalie: number;
  niveau_alerte: string;
  temperature_actuelle: number | null;
  charge_actuelle: number | null;
  recommandation: string;
}

export interface MaintenanceResponse {
  total_equipements: number;
  equipements_a_risque: number;
  equipements: EquipementRisque[];
  message: string;
}

export interface ImpactResponse {
  total_predictions: number;
  coupures_evitees: number;
  co2_evite_kg: number;
  litres_diesel_non_brules: number;
  arbres_preserves: number;
  kwh_optimises: number;
  message: string;
}

export interface VillageStatus {
  id: number;
  nom_village: string;
  zone_id: number;
  niveau_batterie_pct: number;
  production_solaire_kwh: number;
  consommation_prevue_soir_kwh: number;
  autonomie_estimee_heures: number;
  statut: string;
  recommandation: string;
  est_alerte_batterie: boolean;
}

export interface MiniGridResponse {
  total_villages: number;
  villages_en_alerte: number;
  villages: VillageStatus[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const api = {
  health: () => get<{ status: string; redis: string }>("/health"),

  predict: (data: PredictRequest) =>
    post<PredictResponse>("/predict/", data),

  predictHistorique: (zoneId: number) =>
    get<PredictResponse[]>(`/predict/historique/${zoneId}`),

  optimize: () => get<OptimizeResponse>("/optimize/"),

  maintenance: () => get<MaintenanceResponse>("/maintenance/"),

  impact: () => get<ImpactResponse>("/impact/"),

  miniGrid: () => get<MiniGridResponse>("/mini-grid/"),
};
