import { PageHeader } from "../components/PageHeader";
import { InteractiveMap } from "../components/InteractiveMap";
import { MAP_ZONES, MINI_GRIDS } from "../data/energyData";

export function MapPage() {
  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <PageHeader
        title="Carte interactive"
        description="Abidjan et zones rurales — risques, flux énergétiques et mini-réseaux"
      />
      <InteractiveMap zones={MAP_ZONES} miniGrids={MINI_GRIDS} showEnergyFlows />
    </div>
  );
}
