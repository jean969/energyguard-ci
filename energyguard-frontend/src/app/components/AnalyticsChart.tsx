import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TrendingUp, BarChart3, Waves } from "lucide-react";

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

interface AnalyticsChartProps {
  data: AnalyticsData[];
  graphType: string;
  deviceName: string;
}

export function AnalyticsChart({ data, graphType, deviceName }: AnalyticsChartProps) {
  const renderConsumptionChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid key="consumption-grid" strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          key="consumption-xaxis"
          dataKey="timestamp"
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <YAxis key="consumption-yaxis" className="text-xs" tick={{ fontSize: 12 }} />
        <Tooltip
          key="consumption-tooltip"
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--card-foreground))'
          }}
          labelFormatter={(value) => `Heure: ${value}`}
          formatter={(value: number, name: string) => [
            `${value.toFixed(2)} ${name === 'kwh' ? 'kWh' : name === 'kw' ? 'kW' : name === 'billing' ? '₹' : name.toUpperCase()}`,
            name === 'kwh' ? 'Consommation d\'énergie' :
            name === 'kw' ? 'Puissance active' :
            name === 'billing' ? 'Montant de facturation' : name.toUpperCase()
          ]}
        />
        <Legend key="consumption-legend" />
        <Area
          key="consumption-area-kwh"
          type="monotone"
          dataKey="kwh"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#consumptionGradient)"
          name="Énergie (kWh)"
        />
        <Line
          key="consumption-line-kw"
          type="monotone"
          dataKey="kw"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          name="Puissance (kW)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderParameterizedChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid key="param-grid" strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          key="param-xaxis"
          dataKey="timestamp"
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <YAxis key="param-yaxis" className="text-xs" tick={{ fontSize: 12 }} />
        <Tooltip
          key="param-tooltip"
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--card-foreground))'
          }}
          labelFormatter={(value) => `Heure: ${value}`}
          formatter={(value: number, name: string) => [
            `${value.toFixed(2)} ${
              name === 'kvah' ? 'KVAH' :
              name === 'kva' ? 'KVA' :
              name === 'kw' ? 'KW' :
              name === 'pf' ? '' :
              name === 'kvarh_lag' ? 'KVARh' :
              name === 'kvarh_lead' ? 'KVARh' : ''
            }`,
            name === 'kvah' ? 'Énergie apparente' :
            name === 'kva' ? 'Puissance apparente' :
            name === 'kw' ? 'Puissance active' :
            name === 'pf' ? 'Facteur de puissance' :
            name === 'kvarh_lag' ? 'Énergie réactive (retard)' :
            name === 'kvarh_lead' ? 'Énergie réactive (avance)' : name
          ]}
        />
        <Legend key="param-legend" />
        <Line
          key="param-line-kvah"
          type="monotone"
          dataKey="kvah"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="KVAH"
          dot={false}
        />
        <Line
          key="param-line-kva"
          type="monotone"
          dataKey="kva"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          name="KVA"
          dot={false}
        />
        <Line
          key="param-line-kw"
          type="monotone"
          dataKey="kw"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          name="KW"
          dot={false}
        />
        <Line
          key="param-line-pf"
          type="monotone"
          dataKey="pf"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          name="Power Factor"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderHarmonicChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid key="harmonic-grid" strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          key="harmonic-xaxis"
          dataKey="timestamp"
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <YAxis key="harmonic-yaxis" className="text-xs" tick={{ fontSize: 12 }} />
        <Tooltip
          key="harmonic-tooltip"
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--card-foreground))'
          }}
          labelFormatter={(value) => `Heure: ${value}`}
          formatter={(value: number, name: string) => [
            `${value.toFixed(2)} KVARh`,
            name === 'kvarh_lag' ? 'Énergie réactive (retard)' : 'Énergie réactive (avance)'
          ]}
        />
        <Legend key="harmonic-legend" />
        <Bar
          key="harmonic-bar-lag"
          dataKey="kvarh_lag"
          fill="hsl(var(--chart-4))"
          name="KVARh (retard)"
          radius={[2, 2, 0, 0]}
        />
        <Bar
          key="harmonic-bar-lead"
          dataKey="kvarh_lead"
          fill="hsl(var(--chart-5))"
          name="KVARh (avance)"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const getChartTitle = () => {
    switch (graphType) {
      case "consumption":
        return "Tendances de consommation d'énergie";
      case "parameterized":
        return "Analyse de puissance paramétrée";
      case "harmonic":
        return "Analyse harmonique - Puissance réactive";
      default:
        return "Analyse énergétique";
    }
  };

  const getChartDescription = () => {
    switch (graphType) {
      case "consumption":
        return "Surveillance en temps réel de la consommation d'énergie et de la puissance active";
      case "parameterized":
        return "Paramètres de puissance complets incluant KVAH, KVA, KW et facteur de puissance";
      case "harmonic":
        return "Analyse de puissance réactive montrant les composants en retard et en avance";
      default:
        return "Analyse du système énergétique";
    }
  };

  const getChartIcon = () => {
    switch (graphType) {
      case "consumption":
        return TrendingUp;
      case "parameterized":
        return BarChart3;
      case "harmonic":
        return Waves;
      default:
        return TrendingUp;
    }
  };

  const ChartIcon = getChartIcon();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartIcon className="w-5 h-5 text-primary" />
          {getChartTitle()}
        </CardTitle>
        <CardDescription>
          {getChartDescription()} for {deviceName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Controls */}
          <Tabs value={graphType} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="consumption" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Consommation
              </TabsTrigger>
              <TabsTrigger value="parameterized" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Paramètres
              </TabsTrigger>
              <TabsTrigger value="harmonic" className="flex items-center gap-2">
                <Waves className="w-4 h-4" />
                Harmonique
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Chart Display */}
          <div className="w-full">
            {graphType === "consumption" && renderConsumptionChart()}
            {graphType === "parameterized" && renderParameterizedChart()}
            {graphType === "harmonic" && renderHarmonicChart()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}