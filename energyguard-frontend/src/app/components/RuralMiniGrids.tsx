import { motion } from "motion/react";
import { Battery, Sun, TrendingDown, AlertCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

interface MiniGrid {
  name: string;
  batteryLevel: number;
  solarProduction: number;
  eveningForecast: number;
  villageConsumption: number;
  status: "good" | "warning" | "critical";
}

export function RuralMiniGrids({ grids }: { grids: MiniGrid[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mini-réseaux ruraux</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grids.map((grid, index) => {
          const batteryColor = grid.batteryLevel > 60 ? "bg-green-500" : grid.batteryLevel > 30 ? "bg-orange-500" : "bg-red-500";
          const hasAlert = grid.batteryLevel < 30 || grid.solarProduction < grid.eveningForecast;
          
          return (
            <motion.div
              key={grid.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 border-2 ${hasAlert ? 'border-orange-400 bg-orange-50/50' : 'border-border'}`}>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold">{grid.name}</h4>
                  {hasAlert && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Alerte
                    </Badge>
                  )}
                </div>

                {/* Battery Level */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Battery className="w-4 h-4" />
                      <span>Niveau batterie</span>
                    </div>
                    <span className="text-sm font-semibold">{grid.batteryLevel}%</span>
                  </div>
                  <Progress value={grid.batteryLevel} className="h-2" />
                </div>

                {/* Solar Production */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <span>Production solaire</span>
                  </div>
                  <span className="text-sm font-semibold">{grid.solarProduction} kWh</span>
                </div>

                {/* Evening Forecast */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingDown className="w-4 h-4" />
                    <span>Prévision soir</span>
                  </div>
                  <span className="text-sm font-semibold">{grid.eveningForecast} kWh</span>
                </div>

                {/* Village Consumption Report */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Consommation village (24h)</p>
                  <p className="text-lg font-semibold text-primary mt-1">{grid.villageConsumption} kWh</p>
                </div>

                {/* Alerts */}
                {grid.batteryLevel < 30 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg text-xs text-red-700"
                  >
                    ⚠️ Batterie faible - Rechargement recommandé
                  </motion.div>
                )}
                {grid.solarProduction < grid.eveningForecast && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded-lg text-xs text-orange-700"
                  >
                    ⚠️ Production insuffisante pour la soirée
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
