import { PageHeader } from "../components/PageHeader";
import { InteractiveMap } from "../components/InteractiveMap";
import { LoadingScreen, ErrorScreen } from "../components/DataLoader";
import { useBackendData } from "../hooks/useBackendData";

export function MapPage() {
  const { data, loading, error, refetch } = useBackendData();

  if (loading) return <LoadingScreen message="Chargement de la carte des risques…" />;
  if (error || !data) return <ErrorScreen error={error ?? "Données indisponibles"} onRetry={refetch} />;

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <PageHeader
        title="Carte interactive"
        description="Abidjan et zones rurales — risques temps réel, flux énergétiques et mini-réseaux"
      />
      <InteractiveMap zones={data.mapZones} miniGrids={data.miniGrids} showEnergyFlows />
    </div>
  );
}
