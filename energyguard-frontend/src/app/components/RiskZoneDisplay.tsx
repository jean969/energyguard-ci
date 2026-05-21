import { motion } from "motion/react";
import { Card } from "./ui/card";

interface Zone {
  name: string;
  risk: "Faible" | "Moyen" | "Élevé" | "Critique";
  score: number;
}

const riskColors = {
  Faible: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  Moyen: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  Élevé: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  Critique: {
    bg: "bg-neutral-900",
    text: "text-neutral-50",
    border: "border-neutral-600",
  },
};

export function RiskZoneDisplay({ zones }: { zones: Zone[] }) {
  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Score de risque par zone</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {zones.map((zone, index) => {
          const colors = riskColors[zone.risk];
          return (
            <motion.div
              key={zone.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`${colors.bg} ${colors.border} ${colors.text} border-2 rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="text-center">
                <p className="text-sm font-semibold mb-1">{zone.name}</p>
                <p className="text-2xl font-bold">{zone.score}</p>
                <p className="text-xs opacity-90 mt-1">{zone.risk}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
