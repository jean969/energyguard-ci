import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ConsumptionChartProps {
  selectedDay: string;
  selectedDevice: string;
}

export function ConsumptionChart({ selectedDay, selectedDevice }: ConsumptionChartProps) {
  // Mock data - in real app this would come from API based on filters
  const consumptionData = [
    { name: "Appareil 1 - Bâtiment principal", value: 2400, color: "#22c55e" },
    { name: "Appareil 2 - Fabrication", value: 4567, color: "#16a34a" },
    { name: "Appareil 3 - Bloc bureaux", value: 1890, color: "#15803d" },
    { name: "Systèmes CVC", value: 3210, color: "#166534" },
    { name: "Éclairage", value: 1250, color: "#14532d" },
    { name: "Équipements", value: 2100, color: "#052e16" },
  ];

  const totalConsumption = consumptionData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalConsumption) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString()} kWh ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-border/30 shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-card-foreground">Aperçu de la consommation d'énergie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Répartition de la consommation d'énergie sur tous les appareils actifs pour {selectedDay}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Consumption Summary */}
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-foreground">
              {totalConsumption.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Consommation totale en kWh
            </div>
          </div>

          {/* Pie Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  key="consumption-pie"
                  data={consumptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {consumptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="consumption-tooltip" content={<CustomTooltip />} />
                <Legend key="consumption-legend" content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Device Status List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">État des appareils</h4>
            <div className="grid grid-cols-1 gap-2">
              {consumptionData.slice(0, 3).map((device, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: device.color }}
                    />
                    <span className="text-sm">{device.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{device.value.toLocaleString()} kWh</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Actif" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}