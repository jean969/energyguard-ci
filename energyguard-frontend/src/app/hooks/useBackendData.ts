import { useEffect, useState, useCallback } from "react";
import { api, OptimizeResponse, MaintenanceResponse, ImpactResponse, MiniGridResponse } from "../services/api";
import type {
  KeyIndicators, ZoneRisk, MapZone, MiniGrid,
  OutagePrediction, SystemAlert, NetworkRecommendation, RiskLevel,
} from "../data/energyData";

// ── helpers ───────────────────────────────────────────────────────────────────

function boxAround(lat: number, lng: number, dLat = 0.012, dLng = 0.014): [number, number][] {
  return [
    [lat + dLat, lng - dLng], [lat + dLat, lng + dLng],
    [lat - dLat, lng + dLng], [lat - dLat, lng - dLng],
  ];
}

const COMMUNE_CENTERS: Record<string, [number, number]> = {
  "Cocody": [5.355, -3.985], "Yopougon": [5.342, -4.071],
  "Abobo": [5.415, -4.016], "Adjamé": [5.362, -4.021],
  "Treichville": [5.305, -4.008], "Marcory": [5.297, -3.997],
  "Port-Bouët": [5.261, -3.94], "Plateau": [5.322, -4.016],
  "Koumassi": [5.290, -3.990], "Bingerville": [5.360, -3.880],
  "Anyama": [5.490, -4.050], "Attécoubé": [5.348, -4.040],
  "Songon": [5.390, -4.150],
};

function riskToLevel(niveau: string): RiskLevel {
  if (niveau.toLowerCase().includes("critique")) return "Critique";
  if (niveau.toLowerCase().includes("lev") || niveau.toLowerCase().includes("élevé")) return "Élevé";
  if (niveau.toLowerCase().includes("moyen")) return "Moyen";
  return "Faible";
}

function riskToScore(niveau: string): number {
  if (niveau.toLowerCase().includes("critique")) return Math.floor(75 + Math.random() * 25);
  if (niveau.toLowerCase().includes("lev") || niveau.toLowerCase().includes("élevé")) return Math.floor(55 + Math.random() * 20);
  if (niveau.toLowerCase().includes("moyen")) return Math.floor(35 + Math.random() * 20);
  return Math.floor(10 + Math.random() * 25);
}

function statusFromVillage(statut: string): "good" | "warning" | "critical" {
  if (statut === "Critique") return "critical";
  if (statut === "Faible") return "warning";
  return "good";
}

// ── types retournés ───────────────────────────────────────────────────────────

export interface BackendData {
  keyIndicators: KeyIndicators;
  zones: ZoneRisk[];
  mapZones: MapZone[];
  miniGrids: MiniGrid[];
  outage: OutagePrediction;
  alerts: SystemAlert[];
  recommendations: NetworkRecommendation[];
  impact: { co2Avoided: number; dieselNotBurned: number; treesPreserved: number };
  kwhOptimises: number;
  raw: {
    optimize: OptimizeResponse | null;
    maintenance: MaintenanceResponse | null;
    impact: ImpactResponse | null;
    miniGrid: MiniGridResponse | null;
  };
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useBackendData() {
  const [data, setData] = useState<BackendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [optimize, maintenance, impact, miniGrid] = await Promise.all([
        api.optimize(),
        api.maintenance(),
        api.impact(),
        api.miniGrid(),
      ]);

      // ── Zones risque ──────────────────────────────────────────────────────
      const zones: ZoneRisk[] = optimize.zones.map((z) => ({
        name: z.nom,
        risk: riskToLevel(z.niveau_risque),
        score: Math.round(z.score_risque * 100), // vrai score RF (0-1) → /100
      }));

      // ── Carte ─────────────────────────────────────────────────────────────
      const mapZones: MapZone[] = zones.map((z) => {
        // Cherche les coordonnées par correspondance de nom partielle
        const key = Object.keys(COMMUNE_CENTERS).find(k =>
          z.name.toLowerCase().includes(k.toLowerCase()) ||
          k.toLowerCase().includes(z.name.toLowerCase().split(" ").pop() ?? "")
        );
        const [lat, lng] = COMMUNE_CENTERS[key ?? ""] ?? [5.36, -4.008];
        return { name: z.name, risk: z.risk, score: z.score, coordinates: boxAround(lat, lng) };
      });

      // ── Mini-réseaux ──────────────────────────────────────────────────────
      const miniGrids: MiniGrid[] = miniGrid.villages.map((v) => ({
        name: v.nom_village,
        lat: 0, lng: 0,
        batteryLevel: v.niveau_batterie_pct,
        solarProduction: v.production_solaire_kwh,
        eveningForecast: v.consommation_prevue_soir_kwh,
        villageConsumption: Math.round(v.production_solaire_kwh * 5),
        status: statusFromVillage(v.statut),
      }));

      // ── Indicateurs clés ──────────────────────────────────────────────────
      const avgRisk = zones.length
        ? Math.round(zones.reduce((s, z) => s + z.score, 0) / zones.length)
        : 0;

      const keyIndicators: KeyIndicators = {
        riskScore: avgRisk,
        kwhOptimized: Math.round(impact.kwh_optimises),
        co2Avoided: Math.round(impact.co2_evite_kg),
        equipmentAtRisk: maintenance.equipements_a_risque,
      };

      // ── Prédiction la plus critique ───────────────────────────────────────
      const critiques = optimize.zones.filter(z =>
        ["Critique", "Élevé", "Eleve"].some(r => z.niveau_risque.includes(r))
      );
      const worst = critiques[0] ?? optimize.zones[0];
      const outage: OutagePrediction = worst ? {
        horizonHours: 24,
        probability: Math.min(99, Math.round(worst.allocation_pct > 0 ? (100 - worst.taux_service) + avgRisk : avgRisk)),
        affectedZone: worst.nom,
        riskLevel: riskToLevel(worst.niveau_risque),
        summary: `Le modèle Random Forest anticipe un risque ${worst.niveau_risque.toLowerCase()} sur ${worst.nom}. Taux de service : ${worst.taux_service}%. Rééquilibrage automatique scipy linprog actif.`,
      } : {
        horizonHours: 24, probability: avgRisk,
        affectedZone: "Réseau global", riskLevel: "Faible",
        summary: "Aucun risque critique détecté sur le réseau.",
      };

      // ── Alertes depuis maintenance + mini-réseaux ─────────────────────────
      const alerts: SystemAlert[] = [
        ...maintenance.equipements.map((eq, i) => ({
          id: `maint-${eq.equipement_id}`,
          type: "maintenance" as const,
          severity: eq.niveau_alerte === "Critique" ? "critical" as const
            : eq.niveau_alerte === "Eleve" ? "high" as const : "medium" as const,
          title: `${eq.nom} — Anomalie ${eq.niveau_alerte}`,
          message: `${eq.recommandation}. Temp: ${eq.temperature_actuelle ?? "N/A"}°C, Charge: ${eq.charge_actuelle ?? "N/A"}%`,
          zone: `Zone ${eq.zone_id}`,
          time: "Temps réel",
        })),
        ...miniGrid.villages
          .filter((v) => v.est_alerte_batterie)
          .map((v) => ({
            id: `grid-${v.id}`,
            type: "minigrid" as const,
            severity: v.statut === "Critique" ? "critical" as const : "high" as const,
            title: `Batterie ${v.statut.toLowerCase()} — ${v.nom_village}`,
            message: `${v.niveau_batterie_pct}% restant. ${v.recommandation}`,
            zone: v.nom_village,
            time: "Temps réel",
          })),
        ...critiques.map((z) => ({
          id: `zone-${z.zone_id}`,
          type: "outage" as const,
          severity: z.niveau_risque.toLowerCase().includes("critique") ? "critical" as const : "high" as const,
          title: `Risque ${z.niveau_risque} — ${z.nom}`,
          message: `Taux de service ${z.taux_service}%. Action : ${z.action}`,
          zone: z.nom,
          time: "Temps réel",
        })),
      ];

      // ── Recommandations depuis les zones prioritaires ──────────────────────
      const PRIORITY_TYPES: Array<"hôpital" | "école" | "santé" | "réseau"> = ["hôpital", "école", "santé", "réseau"];
      const recommendations: NetworkRecommendation[] = optimize.zones.slice(0, 4).map((z, i) => ({
        id: `rec-${z.zone_id}`,
        priority: PRIORITY_TYPES[i % 4],
        title: `${z.action} — ${z.nom}`,
        description: `Allocation actuelle : ${z.allocation_kwh} kWh (${z.taux_service}% de la demande). ${z.est_critique ? "Zone critique — alimentation prioritaire garantie." : ""}`,
        impact: z.deficit_kwh > 0 ? `Déficit à combler : ${z.deficit_kwh} kWh` : "Aucun déficit — objectif atteint",
      }));

      setData({
        keyIndicators,
        zones,
        mapZones,
        miniGrids,
        outage,
        alerts,
        recommendations,
        impact: {
          co2Avoided: Math.round(impact.co2_evite_kg),
          dieselNotBurned: Math.round(impact.litres_diesel_non_brules),
          treesPreserved: Math.round(impact.arbres_preserves),
        },
        kwhOptimises: Math.round(impact.kwh_optimises),
        raw: { optimize, maintenance, impact, miniGrid },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion au backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
