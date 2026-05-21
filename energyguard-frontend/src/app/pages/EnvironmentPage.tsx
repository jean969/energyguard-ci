import { PageHeader } from "../components/PageHeader";
import { EnvironmentalImpactModule } from "../components/EnvironmentalImpactModule";
import { Card } from "../components/ui/card";
import { LoadingScreen, ErrorScreen } from "../components/DataLoader";
import { useBackendData } from "../hooks/useBackendData";

export function EnvironmentPage() {
  const { data, loading, error, refetch } = useBackendData();

  if (loading) return <LoadingScreen message="Calcul de l'impact environnemental…" />;
  if (error || !data) return <ErrorScreen error={error ?? "Données indisponibles"} onRetry={refetch} />;

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <PageHeader
        title="Impact environnemental"
        description="CO₂ évité, diesel non brûlé, arbres préservés — données temps réel backend"
      />
      <Card className="p-4 border-0 shadow-sm bg-green-50/50">
        <div className="flex flex-wrap gap-6 text-sm">
          <span>
            <strong className="text-foreground">
              {data.kwhOptimises.toLocaleString("fr-FR")} kWh
            </strong>{" "}
            <span className="text-muted-foreground">optimisés sur le réseau</span>
          </span>
          <span>
            <strong className="text-foreground">
              {data.raw.impact?.coupures_evitees ?? 0}
            </strong>{" "}
            <span className="text-muted-foreground">coupures évitées grâce aux prédictions IA</span>
          </span>
          <span>
            <strong className="text-foreground">
              {data.raw.impact?.total_predictions ?? 0}
            </strong>{" "}
            <span className="text-muted-foreground">prédictions effectuées</span>
          </span>
        </div>
      </Card>
      <EnvironmentalImpactModule
        co2Avoided={data.impact.co2Avoided}
        dieselNotBurned={data.impact.dieselNotBurned}
        treesPreserved={data.impact.treesPreserved}
      />
    </div>
  );
}
