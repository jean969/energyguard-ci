import { PageHeader } from "../components/PageHeader";
import { EnvironmentalImpactModule } from "../components/EnvironmentalImpactModule";
import { ENVIRONMENTAL_IMPACT, KEY_INDICATORS } from "../data/energyData";
import { Card } from "../components/ui/card";

export function EnvironmentPage() {
  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <PageHeader
        title="Impact environnemental"
        description="CO₂ évité, diesel non brûlé, arbres préservés — évolution hebdomadaire et mensuelle"
      />
      <Card className="p-4 border-0 shadow-sm bg-green-50/50">
        <p className="text-sm text-muted-foreground">
          Aujourd&apos;hui :{" "}
          <strong className="text-foreground">
            {KEY_INDICATORS.kwhOptimized.toLocaleString()} kWh
          </strong>{" "}
          optimisés sur le réseau
        </p>
      </Card>
      <EnvironmentalImpactModule {...ENVIRONMENTAL_IMPACT} />
    </div>
  );
}
