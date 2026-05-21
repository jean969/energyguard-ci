export type RiskLevel = "Faible" | "Moyen" | "Élevé" | "Critique";

export interface ZoneRisk {
  name: string;
  risk: RiskLevel;
  score: number;
}

export interface MapZone {
  name: string;
  risk: RiskLevel;
  score?: number;
  coordinates: [number, number][];
}

export interface MiniGrid {
  name: string;
  lat: number;
  lng: number;
  batteryLevel: number;
  solarProduction: number;
  eveningForecast: number;
  villageConsumption: number;
  status: "good" | "warning" | "critical";
}

export interface KeyIndicators {
  riskScore: number;
  kwhOptimized: number;
  co2Avoided: number;
  equipmentAtRisk: number;
}

export interface OutagePrediction {
  horizonHours: number;
  probability: number;
  affectedZone: string;
  riskLevel: RiskLevel;
  summary: string;
}

export interface SystemAlert {
  id: string;
  type: "outage" | "maintenance" | "minigrid" | "network";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  zone?: string;
  time: string;
}

export interface NetworkRecommendation {
  id: string;
  priority: "hôpital" | "école" | "santé" | "réseau";
  title: string;
  description: string;
  impact: string;
}

/** Polygone approximatif autour d'un centre [lat, lng] */
function boxAround(lat: number, lng: number, dLat = 0.012, dLng = 0.014): [number, number][] {
  return [
    [lat + dLat, lng - dLng],
    [lat + dLat, lng + dLng],
    [lat - dLat, lng + dLng],
    [lat - dLat, lng - dLng],
  ];
}

export const KEY_INDICATORS: KeyIndicators = {
  riskScore: 42,
  kwhOptimized: 15847,
  co2Avoided: 8234,
  equipmentAtRisk: 7,
};

export const ZONES: ZoneRisk[] = [
  { name: "Plateau", risk: "Faible", score: 23 },
  { name: "Cocody", risk: "Moyen", score: 54 },
  { name: "Yopougon", risk: "Faible", score: 18 },
  { name: "Abobo", risk: "Élevé", score: 72 },
  { name: "Adjamé", risk: "Moyen", score: 48 },
  { name: "Treichville", risk: "Faible", score: 31 },
  { name: "Marcory", risk: "Critique", score: 89 },
  { name: "Port-Bouët", risk: "Moyen", score: 56 },
];

const communeCenters: Record<string, [number, number]> = {
  Plateau: [5.322, -4.016],
  Cocody: [5.355, -3.985],
  Yopougon: [5.342, -4.071],
  Abobo: [5.415, -4.016],
  Adjamé: [5.362, -4.021],
  Treichville: [5.305, -4.008],
  Marcory: [5.297, -3.997],
  "Port-Bouët": [5.261, -3.94],
};

export const MAP_ZONES: MapZone[] = ZONES.map((z) => {
  const [lat, lng] = communeCenters[z.name] ?? [5.36, -4.008];
  return {
    name: z.name,
    risk: z.risk,
    score: z.score,
    coordinates: boxAround(lat, lng),
  };
});

export const MINI_GRIDS: MiniGrid[] = [
  { name: "Village Adiaké", lat: 5.28, lng: -3.3, batteryLevel: 78, solarProduction: 145, eveningForecast: 98, villageConsumption: 267, status: "good" },
  { name: "Village Bonoua", lat: 5.27, lng: -3.59, batteryLevel: 45, solarProduction: 112, eveningForecast: 115, villageConsumption: 289, status: "warning" },
  { name: "Village Grand-Bassam", lat: 5.19, lng: -3.74, batteryLevel: 23, solarProduction: 87, eveningForecast: 134, villageConsumption: 312, status: "critical" },
  { name: "Village Assinie", lat: 5.15, lng: -3.27, batteryLevel: 91, solarProduction: 178, eveningForecast: 102, villageConsumption: 245, status: "good" },
  { name: "Village Aboisso", lat: 5.47, lng: -3.21, batteryLevel: 56, solarProduction: 134, eveningForecast: 128, villageConsumption: 298, status: "warning" },
  { name: "Village Dabou", lat: 5.33, lng: -4.38, batteryLevel: 82, solarProduction: 156, eveningForecast: 95, villageConsumption: 234, status: "good" },
];

export const ENVIRONMENTAL_IMPACT = {
  co2Avoided: 8234,
  dieselNotBurned: 3294,
  treesPreserved: 82,
};

export const OUTAGE_PREDICTION: OutagePrediction = {
  horizonHours: 8,
  probability: 91,
  affectedZone: "Marcory / Adjamé",
  riskLevel: "Critique",
  summary:
    "Le modèle LSTM anticipe une surcharge du réseau en soirée. Rééquilibrage recommandé avant 18h30.",
};

export const SYSTEM_ALERTS: SystemAlert[] = [
  { id: "a1", type: "outage", severity: "critical", title: "Risque de coupure — Marcory", message: "Pic de consommation +340 % vs normale. Score 89/100.", zone: "Marcory", time: "Il y a 12 min" },
  { id: "a2", type: "outage", severity: "high", title: "Alerte réseau — Abobo", message: "Charge prévue 94 MW à 19h. Délestage partiel possible.", zone: "Abobo", time: "Il y a 28 min" },
  { id: "a3", type: "maintenance", severity: "high", title: "Transformateur T-47", message: "Anomalie thermique détectée — maintenance sous 6 h.", zone: "Adjamé", time: "Il y a 1 h" },
  { id: "a4", type: "maintenance", severity: "medium", title: "Ligne Cocody Nord", message: "Usure isolant — intervention planifiée demain.", zone: "Cocody", time: "Il y a 2 h" },
  { id: "a5", type: "minigrid", severity: "critical", title: "Batterie critique — Grand-Bassam", message: "12 % restant, production solaire insuffisante.", zone: "Grand-Bassam", time: "Il y a 35 min" },
  { id: "a6", type: "network", severity: "medium", title: "Rééquilibrage actif", message: "Boost Yopougon +12 %, délestage léger Abobo −15 %.", time: "En cours" },
];

export const NETWORK_RECOMMENDATIONS: NetworkRecommendation[] = [
  { id: "r1", priority: "hôpital", title: "Priorité CHU Treichville", description: "Maintenir 100 % de capacité sur le feeder hospitalier.", impact: "Continuité soins critiques" },
  { id: "r2", priority: "école", title: "Écoles Cocody / Plateau", description: "Reporter délestage sur zones résidentielles après 20h.", impact: "~2 400 élèves sans coupure" },
  { id: "r3", priority: "santé", title: "Centre santé Marcory", description: "Alimentation secours activée — surveiller 2 h.", impact: "Vaccination & urgences préservées" },
  { id: "r4", priority: "réseau", title: "Rééquilibrage offre/demande", description: "Transférer 18 MW de Yopougon vers Marcory entre 17h et 21h.", impact: "Coupure évitée (simulation IA)" },
];

/** Flux énergétiques simulés : [lat, lng][] */
export const ENERGY_FLOWS: { from: [number, number]; to: [number, number]; label?: string }[] = [
  { from: [5.342, -4.071], to: [5.297, -3.997], label: "+12 MW" },
  { from: [5.415, -4.016], to: [5.362, -4.021], label: "−15 MW" },
];
