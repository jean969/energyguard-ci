import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Leaf, Droplets, Trees } from "lucide-react";
import { Card } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface EnvironmentalImpactModuleProps {
  co2Avoided: number;
  dieselNotBurned: number;
  treesPreserved: number;
}

export function EnvironmentalImpactModule({
  co2Avoided,
  dieselNotBurned,
  treesPreserved
}: EnvironmentalImpactModuleProps) {
  const [animatedCO2, setAnimatedCO2] = useState(0);
  const [animatedDiesel, setAnimatedDiesel] = useState(0);
  const [animatedTrees, setAnimatedTrees] = useState(0);

  // Weekly data
  const weeklyData = [
    { id: 1, day: "Lun", co2: 145, diesel: 58 },
    { id: 2, day: "Mar", co2: 167, diesel: 67 },
    { id: 3, day: "Mer", co2: 152, diesel: 61 },
    { id: 4, day: "Jeu", co2: 178, diesel: 71 },
    { id: 5, day: "Ven", co2: 189, diesel: 76 },
    { id: 6, day: "Sam", co2: 134, diesel: 54 },
    { id: 7, day: "Dim", co2: 123, diesel: 49 }
  ];

  // Monthly data
  const monthlyData = [
    { id: 1, month: "Jan", co2: 4500, diesel: 1800, trees: 45 },
    { id: 2, month: "Fév", co2: 4800, diesel: 1920, trees: 48 },
    { id: 3, month: "Mar", co2: 5200, diesel: 2080, trees: 52 },
    { id: 4, month: "Avr", co2: 5600, diesel: 2240, trees: 56 },
    { id: 5, month: "Mai", co2: 6100, diesel: 2440, trees: 61 }
  ];

  // Animate counters on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedCO2(Math.floor(co2Avoided * progress));
      setAnimatedDiesel(Math.floor(dieselNotBurned * progress));
      setAnimatedTrees(Math.floor(treesPreserved * progress));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedCO2(co2Avoided);
        setAnimatedDiesel(dieselNotBurned);
        setAnimatedTrees(treesPreserved);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [co2Avoided, dieselNotBurned, treesPreserved]);

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="text-lg font-semibold mb-6">Impact environnemental</h3>

      {/* Animated Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center"
        >
          <Leaf className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-green-700 mb-1">
            {animatedCO2.toLocaleString()}
          </div>
          <p className="text-sm text-green-600">kg de CO₂ évités</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center"
        >
          <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {animatedDiesel.toLocaleString()}
          </div>
          <p className="text-sm text-blue-600">litres de diesel non brûlés</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center"
        >
          <Trees className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-emerald-700 mb-1">
            {animatedTrees.toLocaleString()}
          </div>
          <p className="text-sm text-emerald-600">arbres préservés</p>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      <div className="mb-8">
        <h4 className="font-semibold mb-4">Évolution hebdomadaire</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyData}>
            <CartesianGrid key="weekly-grid" strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis key="weekly-xaxis" dataKey="day" stroke="#6b7280" />
            <YAxis key="weekly-yaxis" stroke="#6b7280" />
            <Tooltip
              key="weekly-tooltip"
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend key="weekly-legend" />
            <Line
              key="weekly-co2"
              type="monotone"
              dataKey="co2"
              stroke="#22c55e"
              strokeWidth={2}
              name="CO₂ évité (kg)"
              dot={{ fill: '#22c55e', r: 4 }}
            />
            <Line
              key="weekly-diesel"
              type="monotone"
              dataKey="diesel"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Diesel non brûlé (L)"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Chart */}
      <div>
        <h4 className="font-semibold mb-4">Évolution mensuelle</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid key="monthly-grid" strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis key="monthly-xaxis" dataKey="month" stroke="#6b7280" />
            <YAxis key="monthly-yaxis" stroke="#6b7280" />
            <Tooltip
              key="monthly-tooltip"
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend key="monthly-legend" />
            <Line
              key="monthly-co2"
              type="monotone"
              dataKey="co2"
              stroke="#22c55e"
              strokeWidth={2}
              name="CO₂ évité (kg)"
              dot={{ fill: '#22c55e', r: 5 }}
            />
            <Line
              key="monthly-diesel"
              type="monotone"
              dataKey="diesel"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Diesel non brûlé (L)"
              dot={{ fill: '#3b82f6', r: 5 }}
            />
            <Line
              key="monthly-trees"
              type="monotone"
              dataKey="trees"
              stroke="#10b981"
              strokeWidth={2}
              name="Arbres préservés"
              dot={{ fill: '#10b981', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
