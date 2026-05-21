import { motion } from "motion/react";
import { KeyIndicators } from "./KeyIndicators";
import { RiskZoneDisplay } from "./RiskZoneDisplay";
import { WeatherWidget } from "./WeatherWidget";
import { PredictionPanel } from "./PredictionPanel";
import { AlertsPanel } from "./AlertsPanel";
import { NetworkRecommendations } from "./NetworkRecommendations";
import { PageHeader } from "./PageHeader";
import {
  KEY_INDICATORS,
  ZONES,
  OUTAGE_PREDICTION,
  SYSTEM_ALERTS,
  NETWORK_RECOMMENDATIONS,
} from "../data/energyData";

/** Vue synthèse — détail par module dans la sidebar */
export function MainDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader
            title="Tableau de bord"
            description="Prédiction, optimisation et impact — Côte d'Ivoire"
          />
        </motion.div>

        <KeyIndicators {...KEY_INDICATORS} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <PredictionPanel prediction={OUTAGE_PREDICTION} />
            <WeatherWidget />
            <RiskZoneDisplay zones={ZONES} />
          </div>
          <AlertsPanel alerts={SYSTEM_ALERTS} compact />
        </div>

        <NetworkRecommendations recommendations={NETWORK_RECOMMENDATIONS} />
      </div>
    </div>
  );
}
