import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle, Activity, Zap } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type DemoStage = "idle" | "detecting" | "alerting" | "rebalancing" | "prevented";

export function OutagePreventionDemo() {
  const [stage, setStage] = useState<DemoStage>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage === "idle") {
      setProgress(0);
      return;
    }

    let interval: number;
    
    if (stage === "detecting") {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage("alerting"), 500);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    } else if (stage === "alerting") {
      setProgress(0);
      setTimeout(() => setStage("rebalancing"), 2000);
    } else if (stage === "rebalancing") {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage("prevented"), 500);
            return 100;
          }
          return prev + 3;
        });
      }, 100);
    } else if (stage === "prevented") {
      setProgress(100);
      setTimeout(() => setStage("idle"), 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage]);

  const startDemo = () => {
    setStage("detecting");
  };

  const stages = {
    idle: {
      icon: Activity,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      title: "Prêt pour la démonstration",
      description: "Cliquez sur 'Démarrer la démo' pour voir le système en action"
    },
    detecting: {
      icon: Activity,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      title: "Détection du risque en cours...",
      description: "Le modèle IA analyse les patterns de consommation"
    },
    alerting: {
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      title: "⚠️ Alerte déclenchée !",
      description: "Risque de coupure détecté - Zone Plateau à 18h30"
    },
    rebalancing: {
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      title: "Rééquilibrage en cours...",
      description: "Redistribution automatique de la charge vers d'autres zones"
    },
    prevented: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      title: "✅ Coupure évitée avec succès !",
      description: "Distribution optimisée - Tous les équipements fonctionnent normalement"
    }
  };

  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  return (
    <Card className="p-6 border-0 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Démo live - Prévention de coupure</h3>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`${currentStage.bgColor} ${currentStage.borderColor} border-2 rounded-xl p-6 mb-4`}
        >
          <div className="flex items-start gap-4">
            <div className={`${currentStage.color} p-3 bg-white rounded-lg`}>
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${currentStage.color}`}>
                {currentStage.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {currentStage.description}
              </p>
              {(stage === "detecting" || stage === "rebalancing") && (
                <Progress value={progress} className="h-2" />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Timeline Visualization */}
      <div className="mb-6">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: stage === "idle" ? "0%" :
                       stage === "detecting" ? "25%" :
                       stage === "alerting" ? "50%" :
                       stage === "rebalancing" ? "75%" :
                       "100%"
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Timeline steps */}
          {["Détection", "Alerte", "Rééquilibrage", "Évitée"].map((step, index) => {
            const isActive = 
              (stage === "detecting" && index === 0) ||
              (stage === "alerting" && index === 1) ||
              (stage === "rebalancing" && index === 2) ||
              (stage === "prevented" && index === 3);
            
            const isCompleted =
              (stage === "alerting" && index === 0) ||
              (stage === "rebalancing" && index <= 1) ||
              (stage === "prevented" && index <= 2);

            return (
              <div key={step} className="flex flex-col items-center z-10 relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isActive ? "bg-primary border-primary text-white scale-110" :
                    isCompleted ? "bg-primary border-primary text-white" :
                    "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted || isActive ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-2 text-center">{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        <Button 
          onClick={startDemo}
          disabled={stage !== "idle"}
          className="bg-gradient-to-r from-[#2c5f4e] to-[#3a6b5a] hover:from-[#3a6b5a] hover:to-[#2c5f4e]"
        >
          {stage === "idle" ? "Démarrer la démo" : "Démo en cours..."}
        </Button>
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">234</p>
            <p className="text-xs text-muted-foreground">Coupures évitées</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">98.7%</p>
            <p className="text-xs text-muted-foreground">Taux de réussite</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">&lt; 2s</p>
            <p className="text-xs text-muted-foreground">Temps de réponse</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
