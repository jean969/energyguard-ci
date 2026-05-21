import { motion } from "motion/react";
import { TrendingUp, Zap, Leaf, AlertTriangle } from "lucide-react";
import { Card } from "./ui/card";

interface KeyIndicatorsProps {
  riskScore: number;
  kwhOptimized: number;
  co2Avoided: number;
  equipmentAtRisk: number;
}

export function KeyIndicators({ 
  riskScore, 
  kwhOptimized, 
  co2Avoided, 
  equipmentAtRisk 
}: KeyIndicatorsProps) {
  const indicators = [
    {
      title: "Score de risque global",
      value: riskScore,
      unit: "/100",
      icon: AlertTriangle,
      color: riskScore < 30 ? "#22c55e" : riskScore < 60 ? "#f59e0b" : "#ef4444",
      bgColor: riskScore < 30 ? "bg-green-50" : riskScore < 60 ? "bg-orange-50" : "bg-red-50"
    },
    {
      title: "kWh optimisés",
      value: kwhOptimized,
      unit: " kWh",
      icon: Zap,
      color: "#3b82f6",
      bgColor: "bg-blue-50"
    },
    {
      title: "CO₂ évité",
      value: co2Avoided,
      unit: " kg",
      icon: Leaf,
      color: "#22c55e",
      bgColor: "bg-green-50"
    },
    {
      title: "Équipements à risque",
      value: equipmentAtRisk,
      unit: "",
      icon: TrendingUp,
      color: "#f59e0b",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {indicators.map((indicator, index) => {
        const Icon = indicator.icon;
        return (
          <motion.div
            key={indicator.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">{indicator.title}</p>
                  <motion.div 
                    className="flex items-baseline gap-1"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                  >
                    <span className="text-3xl font-semibold" style={{ color: indicator.color }}>
                      {indicator.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">{indicator.unit}</span>
                  </motion.div>
                </div>
                <div className={`${indicator.bgColor} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6" style={{ color: indicator.color }} />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
