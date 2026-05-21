import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Thermometer } from "lucide-react";
import { Card } from "./ui/card";
import { fetchAbidjanWeather, type WeatherSnapshot } from "../services/weatherService";

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAbidjanWeather()
      .then(setWeather)
      .catch(() => setError("Données météo simulées"));
  }, []);

  const w = weather ?? {
    temperature: 28,
    cloudCover: 45,
    precipitation: 0.2,
    solarRadiation: 520,
    updatedAt: new Date().toISOString(),
  };

  return (
    <Card className="p-4 border-0 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Météo — Abidjan</h3>
        <span className="text-xs text-muted-foreground">Open-Meteo</span>
      </div>
      {error && (
        <p className="text-xs text-amber-600 mb-2">{error}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <span>{w.temperature} °C</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Cloud className="w-4 h-4 text-slate-500" />
          <span>Nuages {w.cloudCover} %</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CloudRain className="w-4 h-4 text-blue-500" />
          <span>Pluie {w.precipitation} mm</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Sun className="w-4 h-4 text-yellow-500" />
          <span>{w.solarRadiation} W/m²</span>
        </div>
      </div>
    </Card>
  );
}
