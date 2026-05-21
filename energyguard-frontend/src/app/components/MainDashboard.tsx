import { motion } from "motion/react";
import { KeyIndicators } from "./KeyIndicators";
import { RiskZoneDisplay } from "./RiskZoneDisplay";
import { WeatherWidget } from "./WeatherWidget";
import { PredictionPanel } from "./PredictionPanel";
import { AlertsPanel } from "./AlertsPanel";
import { NetworkRecommendations } from "./NetworkRecommendations";
import { PageHeader } from "./PageHeader";
import { LoadingScreen, ErrorScreen } from "./DataLoader";
import { useBackendData } from "../hooks/useBackendData";

export function MainDashboard() {
  const { data, loading, error, refetch } = useBackendData();

  if (loading) return <LoadingScreen message="Chargement du tableau de bord — modèles IA en cours…" />;
  if (error || !data) return <ErrorScreen error={error ?? "Données indisponibles"} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title="Tableau de bord"
            description="Prédiction, optimisation et impact — Côte d'Ivoire"
          />
        </motion.div>

        <KeyIndicators {...data.keyIndicators} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <PredictionPanel prediction={data.outage} />
            <WeatherWidget />
            <RiskZoneDisplay zones={data.zones} />
          </div>
          <AlertsPanel alerts={data.alerts} compact />
        </div>

        <NetworkRecommendations recommendations={data.recommendations} />
      </div>
    </div>
  );
}
