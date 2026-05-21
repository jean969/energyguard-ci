export type RiskLevel =
  | "Faible"
  | "Moyen"
  | "Élevé"
  | "Critique"
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface MapZoneInput {
  name: string;
  risk?: RiskLevel | string;
  score?: number;
  coordinates?: [number, number][];
  coords?: [number, number][];
}

export interface MiniGridInput {
  name: string;
  lat: number;
  lng: number;
  batteryLevel: number;
  solarProduction: number;
  status: "good" | "warning" | "critical" | string;
}

const RISK_COLORS: Record<string, string> = {
  Faible: "#22c55e",
  Moyen: "#f59e0b",
  Élevé: "#ef4444",
  Critique: "#818cf8",
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#171717",
};

const RISK_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
  Faible: "Faible",
  Moyen: "Moyen",
  Élevé: "Élevé",
  Critique: "Critique",
};

const RISK_LABEL_TO_KEY: Record<string, string> = {
  Faible: "low",
  Moyen: "medium",
  Élevé: "high",
  Critique: "critical",
};

export function riskToColor(risk?: string): string {
  const key = risk ? (RISK_LABEL_TO_KEY[risk] ?? risk) : undefined;
  return (key && RISK_COLORS[key]) || "#94a3b8";
}

export function riskToLabel(risk?: string): string {
  if (!risk) return "—";
  return RISK_LABELS[risk] ?? RISK_LABELS[RISK_LABEL_TO_KEY[risk] ?? ""] ?? risk;
}

export function normalizeZone(zone: MapZoneInput) {
  const riskKey = zone.risk ? (RISK_LABEL_TO_KEY[zone.risk] ?? zone.risk) : undefined;
  const coords = zone.coords ?? zone.coordinates;
  return { ...zone, risk: riskKey, coords };
}
