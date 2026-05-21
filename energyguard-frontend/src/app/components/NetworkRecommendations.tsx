import { Building2, GraduationCap, HeartPulse, Zap } from "lucide-react";
import { Card } from "./ui/card";
import type { NetworkRecommendation } from "../data/energyData";

const priorityMeta = {
  hôpital: { icon: HeartPulse, label: "Santé / Hôpital" },
  école: { icon: GraduationCap, label: "Éducation" },
  santé: { icon: Building2, label: "Centre de santé" },
  réseau: { icon: Zap, label: "Réseau" },
};

interface NetworkRecommendationsProps {
  recommendations: NetworkRecommendation[];
}

export function NetworkRecommendations({ recommendations }: NetworkRecommendationsProps) {
  return (
    <Card className="p-5 border-0 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        Recommandations d&apos;optimisation
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const meta = priorityMeta[rec.priority];
          const Icon = meta.icon;
          return (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">{meta.label}</span>
              </div>
              <h4 className="font-semibold text-sm">{rec.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
              <p className="text-xs text-green-700 font-medium mt-2">{rec.impact}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
