import type { SheetData } from "../services/excelExport";
import {
  KEY_INDICATORS,
  ZONES,
  MINI_GRIDS,
  ENVIRONMENTAL_IMPACT,
  OUTAGE_PREDICTION,
  SYSTEM_ALERTS,
  NETWORK_RECOMMENDATIONS,
} from "./energyData";

export type ReportPeriod = "jour" | "semaine" | "mois";

const WEEKLY_IMPACT = [
  { jour: "Lun", co2_kg: 1240, diesel_L: 512, kwh: 4200 },
  { jour: "Mar", co2_kg: 1380, diesel_L: 570, kwh: 4650 },
  { jour: "Mer", co2_kg: 1190, diesel_L: 491, kwh: 4010 },
  { jour: "Jeu", co2_kg: 1520, diesel_L: 627, kwh: 5120 },
  { jour: "Ven", co2_kg: 1640, diesel_L: 677, kwh: 5530 },
  { jour: "Sam", co2_kg: 980, diesel_L: 404, kwh: 3310 },
  { jour: "Dim", co2_kg: 870, diesel_L: 359, kwh: 2940 },
];

const MONTHLY_IMPACT = [
  { mois: "Jan", co2_kg: 34200, kwh: 115400, arbres: 34 },
  { mois: "Fév", co2_kg: 31800, kwh: 107200, arbres: 32 },
  { mois: "Mar", co2_kg: 38900, kwh: 131100, arbres: 39 },
  { mois: "Avr", co2_kg: 36400, kwh: 122800, arbres: 36 },
  { mois: "Mai", co2_kg: 41200, kwh: 138900, arbres: 41 },
];

function periodLabel(period: ReportPeriod): string {
  const d = new Date();
  if (period === "jour") return d.toLocaleDateString("fr-FR");
  if (period === "semaine") return `Semaine du ${d.toLocaleDateString("fr-FR")}`;
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function buildFullReportWorkbook(period: ReportPeriod): SheetData[] {
  const mult = period === "jour" ? 1 : period === "semaine" ? 7 : 30;

  return [
    {
      name: "Synthèse",
      rows: [
        { Indicateur: "Période", Valeur: periodLabel(period) },
        { Indicateur: "Score risque global", Valeur: KEY_INDICATORS.riskScore },
        { Indicateur: "kWh optimisés", Valeur: Math.round(KEY_INDICATORS.kwhOptimized * (period === "mois" ? 1 : mult / 30)) },
        { Indicateur: "CO₂ évité (kg)", Valeur: Math.round(KEY_INDICATORS.co2Avoided * (period === "mois" ? 1 : mult / 30)) },
        { Indicateur: "Équipements à risque", Valeur: KEY_INDICATORS.equipmentAtRisk },
        { Indicateur: "Prédiction horizon (h)", Valeur: OUTAGE_PREDICTION.horizonHours },
        { Indicateur: "Probabilité coupure (%)", Valeur: OUTAGE_PREDICTION.probability },
        { Indicateur: "Zone concernée", Valeur: OUTAGE_PREDICTION.affectedZone },
      ],
    },
    {
      name: "Zones Abidjan",
      rows: ZONES.map((z) => ({
        Commune: z.name,
        "Niveau de risque": z.risk,
        "Score /100": z.score,
        "Charge estimée (MW)": Math.round(z.score * 0.8 + 20),
      })),
    },
    {
      name: "Mini-réseaux",
      rows: MINI_GRIDS.map((g) => ({
        Village: g.name,
        "Batterie (%)": g.batteryLevel,
        "Production solaire (kWh)": g.solarProduction,
        "Prévision soir (kWh)": g.eveningForecast,
        "Conso. village 24h (kWh)": g.villageConsumption,
        Statut: g.status,
        Latitude: g.lat,
        Longitude: g.lng,
      })),
    },
    {
      name: "Impact environnemental",
      rows: [
        {
          Indicateur: "CO₂ évité (kg)",
          Valeur: Math.round(ENVIRONMENTAL_IMPACT.co2Avoided * (period === "mois" ? 1 : mult / 30)),
        },
        {
          Indicateur: "Diesel non brûlé (L)",
          Valeur: Math.round(ENVIRONMENTAL_IMPACT.dieselNotBurned * (period === "mois" ? 1 : mult / 30)),
        },
        {
          Indicateur: "Arbres préservés",
          Valeur: ENVIRONMENTAL_IMPACT.treesPreserved,
        },
      ],
    },
    {
      name: "Hebdomadaire",
      rows: WEEKLY_IMPACT.map((r) => ({
        Jour: r.jour,
        "CO₂ évité (kg)": r.co2_kg,
        "Diesel évité (L)": r.diesel_L,
        "kWh optimisés": r.kwh,
      })),
    },
    {
      name: "Mensuel",
      rows: MONTHLY_IMPACT.map((r) => ({
        Mois: r.mois,
        "CO₂ évité (kg)": r.co2_kg,
        "kWh optimisés": r.kwh,
        "Arbres préservés": r.arbres,
      })),
    },
    {
      name: "Alertes",
      rows: SYSTEM_ALERTS.map((a) => ({
        Type: a.type,
        Gravité: a.severity,
        Titre: a.title,
        Message: a.message,
        Zone: a.zone ?? "—",
        Horodatage: a.time,
      })),
    },
    {
      name: "Recommandations",
      rows: NETWORK_RECOMMENDATIONS.map((r) => ({
        Priorité: r.priority,
        Titre: r.title,
        Description: r.description,
        Impact: r.impact,
      })),
    },
  ];
}

export function reportFilename(period: ReportPeriod): string {
  const date = new Date().toISOString().slice(0, 10);
  return `EnergyGuard_CI_rapport_${period}_${date}.xlsx`;
}
