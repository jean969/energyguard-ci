import { AlertTriangle, Wrench, Sun, Network } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import type { SystemAlert } from "../data/energyData";

const iconByType = {
  outage: AlertTriangle,
  maintenance: Wrench,
  minigrid: Sun,
  network: Network,
};

const severityClass = {
  low: "border-border",
  medium: "border-orange-300 bg-orange-50/50",
  high: "border-red-300 bg-red-50/50",
  critical: "border-neutral-800 bg-neutral-100",
};

interface AlertsPanelProps {
  alerts: SystemAlert[];
  compact?: boolean;
}

export function AlertsPanel({ alerts, compact = false }: AlertsPanelProps) {
  const list = compact ? alerts.slice(0, 4) : alerts;

  return (
    <Card className="p-5 border-0 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Alertes & notifications</h3>
      <div className="space-y-3">
        {list.map((alert) => {
          const Icon = iconByType[alert.type];
          return (
            <div
              key={alert.id}
              className={`flex gap-3 p-3 rounded-lg border ${severityClass[alert.severity]}`}
            >
              <Icon className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-sm">{alert.title}</p>
                  {alert.zone && (
                    <Badge variant="outline" className="text-xs">
                      {alert.zone}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                <p className="text-xs text-muted-foreground/80 mt-1">{alert.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
