import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Activity, Zap, TrendingUp, BarChart } from "lucide-react";

interface AnalyticsData {
  deviceId: string;
  timestamp: string;
  kvah: number;
  billing: number;
  kva: number;
  kw: number;
  kwh: number;
  pf: number;
  kvarh_lag: number;
  kvarh_lead: number;
  co2_emissions: number;
}

interface RealtimeDataPanelProps {
  data: AnalyticsData;
}

export function RealtimeDataPanel({ data }: RealtimeDataPanelProps) {
  const parameters = [
    {
      id: "kvah",
      label: "KVAH",
      value: data.kvah,
      unit: "KVAH",
      description: "Énergie apparente",
      icon: BarChart,
      color: "text-primary"
    },
    {
      id: "billing",
      label: "Facturation",
      value: data.billing,
      unit: "₹",
      description: "Facturation actuelle",
      icon: TrendingUp,
      color: "text-chart-3"
    },
    {
      id: "kva",
      label: "KVA",
      value: data.kva,
      unit: "KVA",
      description: "Puissance apparente",
      icon: Zap,
      color: "text-chart-2"
    },
    {
      id: "kw",
      label: "KW",
      value: data.kw,
      unit: "KW",
      description: "Puissance active",
      icon: Activity,
      color: "text-primary"
    },
    {
      id: "kwh",
      label: "KWH",
      value: data.kwh,
      unit: "KWH",
      description: "Consommation d'énergie",
      icon: TrendingUp,
      color: "text-chart-1"
    },
    {
      id: "pf",
      label: "Facteur de puissance",
      value: data.pf,
      unit: "",
      description: "Facteur de puissance",
      icon: BarChart,
      color: "text-chart-4"
    },
    {
      id: "kvarh_lag",
      label: "KVARh (retard)",
      value: data.kvarh_lag,
      unit: "KVARh",
      description: "Énergie réactive en retard",
      icon: Activity,
      color: "text-chart-4"
    },
    {
      id: "kvarh_lead",
      label: "KVARh (avance)",
      value: data.kvarh_lead,
      unit: "KVARh",
      description: "Énergie réactive en avance",
      icon: Activity,
      color: "text-chart-5"
    }
  ];

  const getPowerFactorStatus = (pf: number) => {
    if (pf >= 0.95) return { status: "Excellent", variant: "default" as const, color: "bg-green-500" };
    if (pf >= 0.85) return { status: "Bon", variant: "secondary" as const, color: "bg-yellow-500" };
    return { status: "Faible", variant: "destructive" as const, color: "bg-red-500" };
  };

  const pfStatus = getPowerFactorStatus(data.pf);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Données d'appareil en temps réel
        </CardTitle>
        <CardDescription>
          Lectures de paramètres en direct - Dernière mise à jour : {data.timestamp}
        </CardDescription>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">En direct</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Power Factor Status */}
        <div className="p-4 bg-accent/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">État du facteur de puissance</h4>
              <p className="text-sm text-muted-foreground">Indicateur d'efficacité du système</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{data.pf.toFixed(3)}</div>
              <Badge variant={pfStatus.variant}>{pfStatus.status}</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Parameters Grid */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">PARAMÈTRES ÉNERGÉTIQUES</h4>
          {parameters.map((param, index) => {
            const Icon = param.icon;
            return (
              <div key={param.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-accent/50 ${param.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{param.label}</div>
                    <div className="text-xs text-muted-foreground">{param.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {param.id === 'pf' 
                      ? param.value.toFixed(3) 
                      : param.value.toFixed(2)
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">{param.unit}</div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-accent/30 rounded-lg">
            <div className="text-xs text-muted-foreground">Demande de pointe</div>
            <div className="font-semibold">{Math.max(...[data.kw, data.kva]).toFixed(1)} KW</div>
          </div>
          <div className="p-3 bg-accent/30 rounded-lg">
            <div className="text-xs text-muted-foreground">Efficacité</div>
            <div className="font-semibold">{((data.kw / data.kva) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}