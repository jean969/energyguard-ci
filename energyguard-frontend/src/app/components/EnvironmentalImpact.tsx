import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Leaf, TrendingDown, AlertTriangle, TreePine } from "lucide-react";

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

interface EnvironmentalImpactProps {
  data: AnalyticsData[];
}

export function EnvironmentalImpact({ data }: EnvironmentalImpactProps) {
  // Calculate environmental metrics
  const totalCO2 = data.reduce((sum, item) => sum + item.co2_emissions, 0);
  const averageCO2 = totalCO2 / data.length;
  const totalKWH = data.reduce((sum, item) => sum + item.kwh, 0);
  const emissionFactor = 0.82; // kg CO2 per kWh (India average)
  
  // Calculate tree equivalency (1 tree absorbs ~22 kg CO2 per year)
  const treesEquivalent = totalCO2 / 22;
  
  // Determine emission level
  const getEmissionLevel = (co2: number) => {
    if (co2 < 30) return { level: "Low", variant: "default" as const, color: "text-green-600" };
    if (co2 < 50) return { level: "Moderate", variant: "secondary" as const, color: "text-yellow-600" };
    return { level: "High", variant: "destructive" as const, color: "text-red-600" };
  };

  const emissionLevel = getEmissionLevel(averageCO2);

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Impact environnemental
        </CardTitle>
        <CardDescription>
          Émissions CO₂ et métriques environnementales basées sur la consommation énergétique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total CO2 */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">CO₂ total</span>
            </div>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {totalCO2.toFixed(1)}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">kg CO₂</div>
          </div>

          {/* Moyenne CO2 par heure */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Moy./heure</span>
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {averageCO2.toFixed(1)}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">kg CO₂/h</div>
          </div>

          {/* Arbres équivalents */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TreePine className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Arbres nécessaires</span>
            </div>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {treesEquivalent.toFixed(0)}
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400">arbres/an</div>
          </div>

          {/* Niveau d'impact */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Niveau d'impact</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={emissionLevel.variant} className="text-lg px-3 py-1">
                {emissionLevel.level === "Low" ? "Faible" : emissionLevel.level === "Moderate" ? "Modéré" : "Élevé"}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {emissionLevel.level === "Low" ? "Excellente efficacité !" :
               emissionLevel.level === "Moderate" ? "Marge d'amélioration" :
               "Optimisation énergétique requise"}
            </div>
          </div>
        </div>

        {/* Analyse environnementale */}
        <div className="mt-6 p-4 bg-accent/30 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" />
            Analyse environnementale
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                <span className="font-medium">Intensité carbone :</span> {emissionFactor} kg CO₂ par kWh
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Énergie totale :</span> {totalKWH.toFixed(1)} kWh consommés
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <span className="font-medium">Potentiel de réduction :</span> Jusqu'à 20% avec optimisation
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Objectif :</span> &lt;30 kg CO₂/h pour une efficacité optimale
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}