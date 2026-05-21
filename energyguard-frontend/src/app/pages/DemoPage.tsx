import { PageHeader } from "../components/PageHeader";
import { OutagePreventionDemo } from "../components/OutagePreventionDemo";

export function DemoPage() {
  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <PageHeader
        title="Démo live — Coupure évitée"
        description="Scénario : détection IA → alerte → rééquilibrage → coupure évitée"
      />
      <OutagePreventionDemo />
    </div>
  );
}
