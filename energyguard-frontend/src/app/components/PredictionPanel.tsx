import { Brain, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import type { OutagePrediction } from "../data/energyData";

const riskBadgeClass: Record<string, string> = {
  Faible: "bg-green-100 text-green-800",
  Moyen: "bg-orange-100 text-orange-800",
  Élevé: "bg-red-100 text-red-800",
  Critique: "bg-neutral-900 text-neutral-100",
};

interface PredictionPanelProps {
  prediction: OutagePrediction;
}

export function PredictionPanel({ prediction }: PredictionPanelProps) {
  return (
    <Card className="p-5 border-2 border-primary/20 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Brain className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold">Prédiction IA — coupure électrique</h3>
            <Badge className={riskBadgeClass[prediction.riskLevel] ?? ""}>
              {prediction.riskLevel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{prediction.summary}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-4 h-4 text-primary" />
              Horizon : {prediction.horizonHours} h
            </span>
            <span>
              Probabilité :{" "}
              <strong className="text-primary">{prediction.probability} %</strong>
            </span>
            <span>
              Zone concernée : <strong>{prediction.affectedZone}</strong>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
