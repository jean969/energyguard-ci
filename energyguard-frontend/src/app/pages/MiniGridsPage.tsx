import { PageHeader } from "../components/PageHeader";
import { RuralMiniGrids } from "../components/RuralMiniGrids";
import { Card } from "../components/ui/card";
import { LoadingScreen, ErrorScreen } from "../components/DataLoader";
import { useBackendData } from "../hooks/useBackendData";

function VillageTimeline({ name }: { name: string }) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}h`,
    battery: Math.max(10, 95 - h * 3 + (h > 12 ? 15 : 0)),
  }));

  return (
    <Card className="p-4 mt-4">
      <h4 className="font-semibold text-sm mb-2">Simulation 24h — {name}</h4>
      <p className="text-xs text-muted-foreground mb-3">
        Niveau batterie estimé sur 24h (projection LSTM)
      </p>
      <div className="flex gap-0.5 h-16 items-end">
        {hours.map((row) => (
          <div
            key={row.hour}
            className="flex-1 bg-primary/20 rounded-t min-h-[4px]"
            style={{ height: `${row.battery}%` }}
            title={`${row.hour}: batterie ${Math.round(row.battery)}%`}
          />
        ))}
      </div>
    </Card>
  );
}

export function MiniGridsPage() {
  const { data, loading, error, refetch } = useBackendData();

  if (loading) return <LoadingScreen message="Chargement des mini-réseaux ruraux…" />;
  if (error || !data) return <ErrorScreen error={error ?? "Données indisponibles"} onRetry={refetch} />;

  const critical = data.miniGrids.find((g) => g.status === "critical");

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <PageHeader
        title="Mini-réseaux ruraux"
        description="Batterie, production solaire et consommation en temps réel — backend FastAPI"
      />

      {/* Résumé depuis la DB */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Villages connectés", value: data.raw.miniGrid?.total_villages ?? 0 },
          { label: "En alerte", value: data.raw.miniGrid?.villages_en_alerte ?? 0 },
          { label: "Autonomie moy. (h)", value: data.miniGrids.length > 0
            ? (data.raw.miniGrid?.villages.reduce((s, v) => s + v.autonomie_estimee_heures, 0) ?? 0 /
              data.miniGrids.length).toFixed(1)
            : "—" },
        ].map((s) => (
          <Card key={s.label} className="p-4 border-0 shadow-sm text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-primary mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <RuralMiniGrids grids={data.miniGrids} />
      {critical && <VillageTimeline name={critical.name} />}
    </div>
  );
}
