import { PageHeader } from "../components/PageHeader";
import { RuralMiniGrids } from "../components/RuralMiniGrids";
import { Card } from "../components/ui/card";
import { MINI_GRIDS } from "../data/energyData";

/** Simulation 24h simplifiée pour un village */
function VillageTimeline({ name }: { name: string }) {
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}h`,
    battery: Math.max(10, 95 - h * 3 + (h > 12 ? 15 : 0)),
    solar: h >= 6 && h <= 18 ? 40 + Math.sin((h - 6) / 6) * 35 : 0,
    load: 25 + (h >= 18 ? 20 : 5),
  }));

  return (
    <Card className="p-4 mt-4">
      <h4 className="font-semibold text-sm mb-2">Simulation 24h — {name}</h4>
      <p className="text-xs text-muted-foreground mb-3">
        Batterie, production solaire et charge village (données simulées)
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
  const critical = MINI_GRIDS.find((g) => g.status === "critical");

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <PageHeader
        title="Mini-réseaux ruraux"
        description="Batterie, production solaire, consommation du soir et rapports village"
      />
      <RuralMiniGrids grids={MINI_GRIDS} />
      {critical && <VillageTimeline name={critical.name} />}
    </div>
  );
}
