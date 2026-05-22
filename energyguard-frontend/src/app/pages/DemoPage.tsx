import { useState } from "react";
import { Zap, AlertTriangle, CheckCircle, Activity, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";
import type { PredictResponse } from "../services/api";

const ZONES = [
  { id: 1, nom: "Hôpital Cocody" },
  { id: 2, nom: "École Yopougon" },
  { id: 3, nom: "Quartier Abobo" },
  { id: 4, nom: "Quartier Koumassi" },
  { id: 5, nom: "Village Boundiali" },
  { id: 6, nom: "Village Korhogo" },
  { id: 7, nom: "Village Odienné" },
];

const RISK_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Critique: { bg: "bg-red-50", text: "text-red-700", border: "border-red-400" },
  Élevé:    { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-400" },
  Eleve:    { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-400" },
  Moyen:    { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-400" },
  Faible:   { bg: "bg-green-50", text: "text-green-700", border: "border-green-400" },
};

export function DemoPage() {
  const [zoneId, setZoneId] = useState(1);
  const [temperature, setTemperature] = useState(30);
  const [ensoleillement, setEnsoleillement] = useState(60);
  const [heure, setHeure] = useState(new Date().getHours());
  const [saisonPluie, setSaisonPluie] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const now = new Date();
      const res = await api.predict({
        zone_id: zoneId,
        temperature,
        ensoleillement,
        heure,
        jour_semaine: now.getDay(),
        est_saison_pluie: saisonPluie,
        nuages: 50,
        pluie: saisonPluie ? 5 : 0,
        consommation_kwh: 150,
        conso_lag1: 145,
        conso_lag24: 148,
      });
      setResult(res);
    } catch (e) {
      setError("Erreur de connexion au backend FastAPI");
    } finally {
      setLoading(false);
    }
  };

  const riskStyle = result ? (RISK_STYLES[result.niveau_risque] ?? RISK_STYLES["Faible"]) : null;
  const maxPrev = result ? Math.max(...result.prevision_24h) : 1;

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <PageHeader
        title="Démo live — Prédiction IA temps réel"
        description="Entrez des paramètres réels → le Random Forest + LSTM analysent et répondent"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Formulaire paramètres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Paramètres de simulation
            </CardTitle>
            <CardDescription>
              Modifiez les conditions — le modèle IA prédit le risque en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Zone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Zone du réseau</label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              >
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>{z.nom}</option>
                ))}
              </select>
            </div>

            {/* Heure */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex justify-between">
                <span>Heure de la journée</span>
                <span className="text-primary font-bold">{heure}h00</span>
              </label>
              <input type="range" min={0} max={23} value={heure}
                onChange={(e) => setHeure(Number(e.target.value))}
                className="w-full accent-green-700" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0h (nuit)</span><span>12h (midi)</span><span>23h (soir)</span>
              </div>
            </div>

            {/* Température */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex justify-between">
                <span>Température</span>
                <span className="text-primary font-bold">{temperature}°C</span>
              </label>
              <input type="range" min={20} max={45} value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-green-700" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20°C (frais)</span><span>45°C (canicule)</span>
              </div>
            </div>

            {/* Ensoleillement */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex justify-between">
                <span>Ensoleillement</span>
                <span className="text-primary font-bold">{ensoleillement}%</span>
              </label>
              <input type="range" min={0} max={100} value={ensoleillement}
                onChange={(e) => setEnsoleillement(Number(e.target.value))}
                className="w-full accent-green-700" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0% (nuit/nuageux)</span><span>100% (plein soleil)</span>
              </div>
            </div>

            {/* Saison */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Saison</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaisonPluie(1)}
                  className={`flex-1 py-2 rounded-lg text-sm border-2 transition-all ${saisonPluie === 1 ? "border-primary bg-primary/10 font-semibold" : "border-gray-200"}`}
                >
                  Saison des pluies
                </button>
                <button
                  onClick={() => setSaisonPluie(0)}
                  className={`flex-1 py-2 rounded-lg text-sm border-2 transition-all ${saisonPluie === 0 ? "border-primary bg-primary/10 font-semibold" : "border-gray-200"}`}
                >
                  Saison sèche
                </button>
              </div>
            </div>

            <Button
              onClick={handlePredict}
              disabled={loading}
              className="w-full gap-2 bg-gradient-to-r from-[#2c5f4e] to-[#3a6b5a]"
            >
              <Zap className="w-4 h-4" />
              {loading ? "Analyse IA en cours..." : "Lancer la prédiction IA"}
            </Button>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="space-y-4">
          {!result && !loading && (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Configurez les paramètres et lancez la prédiction</p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Random Forest + LSTM en cours d'analyse...</p>
              </div>
            </Card>
          )}

          {result && riskStyle && (
            <>
              {/* Score RF */}
              <Card className={`border-2 ${riskStyle.border} ${riskStyle.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {result.niveau_risque === "Critique" || result.niveau_risque === "Élevé" || result.niveau_risque === "Eleve"
                        ? <AlertTriangle className={`w-6 h-6 ${riskStyle.text}`} />
                        : <CheckCircle className={`w-6 h-6 ${riskStyle.text}`} />
                      }
                      <span className={`font-semibold ${riskStyle.text}`}>Résultat Random Forest</span>
                    </div>
                    <Badge className={`${riskStyle.bg} ${riskStyle.text} border ${riskStyle.border} text-sm px-3`}>
                      {result.niveau_risque}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className={`text-3xl font-bold ${riskStyle.text}`}>
                        {Math.round(result.score_risque * 100)}/100
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Score de risque RF</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-3xl font-bold text-primary">
                        {Math.round(result.consommation_prevue_kwh)} kWh
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Conso prévue LSTM</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 text-center italic">
                    {result.message}
                  </p>
                </CardContent>
              </Card>

              {/* Prévision 24h LSTM */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Prévision LSTM — 24 prochaines heures</CardTitle>
                  <CardDescription className="text-xs">Consommation kWh prévue par le modèle PyTorch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-0.5 h-24">
                    {result.prevision_24h.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: `${(val / maxPrev) * 80}px`,
                            backgroundColor: val > maxPrev * 0.8 ? "#dc2626" : val > maxPrev * 0.6 ? "#d97706" : "#16a34a",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-600 inline-block" /> Normal</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-600 inline-block" /> Élevé</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-600 inline-block" /> Critique</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
