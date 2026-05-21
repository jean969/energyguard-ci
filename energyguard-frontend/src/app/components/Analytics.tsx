import { useEffect, useMemo, useState } from "react";
import { Download, TrendingUp, Activity, BarChart3, Waves } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { AnalyticsChart } from "./AnalyticsChart";
import { RealtimeDataPanel } from "./RealtimeDataPanel";
import { SummaryReportTable } from "./SummaryReportTable";
import { EnvironmentalImpact } from "./EnvironmentalImpact";
import {
  type Perimeter,
  PERIMETER_OPTIONS,
  getZoneLabel,
  getZonesForPerimeter,
} from "../data/analyticsLocations";
import { filterDevices } from "../data/analyticsDevices";

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

const ALL_ZONES = "all";

export function Analytics() {
  const [perimeter, setPerimeter] = useState<Perimeter>("abidjan");
  const [selectedZone, setSelectedZone] = useState<string>(ALL_ZONES);
  const [selectedDevice, setSelectedDevice] = useState("device-001");
  const [selectedShift, setSelectedShift] = useState("all");
  const [selectedGraphType, setSelectedGraphType] = useState("consumption");

  const zoneOptions = useMemo(() => getZonesForPerimeter(perimeter), [perimeter]);
  const zoneLabel = getZoneLabel(perimeter);

  const filteredDevices = useMemo(
    () => filterDevices(perimeter, selectedZone),
    [perimeter, selectedZone]
  );

  // Réinitialiser commune/ville et appareil quand le périmètre change
  useEffect(() => {
    setSelectedZone(ALL_ZONES);
  }, [perimeter]);

  // Garder un appareil valide dans la zone filtrée
  useEffect(() => {
    const stillValid = filteredDevices.some((d) => d.id === selectedDevice);
    if (!stillValid && filteredDevices.length > 0) {
      setSelectedDevice(filteredDevices[0].id);
    }
  }, [filteredDevices, selectedDevice]);

  const shifts = [
    { id: "all", name: "Tous les quarts" },
    { id: "morning", name: "Quart du matin (6h - 14h)" },
    { id: "afternoon", name: "Quart de l'après-midi (14h - 22h)" },
    { id: "night", name: "Quart de nuit (22h - 6h)" },
  ];

  const graphTypes = [
    { id: "consumption", name: "Consommation", icon: TrendingUp },
    { id: "parameterized", name: "Vue paramétrée", icon: BarChart3 },
    { id: "harmonic", name: "Analyse harmonique", icon: Waves },
  ];

  const mockData: AnalyticsData[] = Array.from({ length: 24 }, (_, i) => ({
    deviceId: selectedDevice,
    timestamp: `${String(i).padStart(2, "0")}:00`,
    kvah: 45 + Math.random() * 20,
    billing: (45 + Math.random() * 20) * 8.5,
    kva: 42 + Math.random() * 18,
    kw: 38 + Math.random() * 15,
    kwh: 35 + Math.random() * 25,
    pf: 0.85 + Math.random() * 0.1,
    kvarh_lag: 12 + Math.random() * 8,
    kvarh_lead: 8 + Math.random() * 5,
    co2_emissions: (35 + Math.random() * 25) * 0.82,
  }));

  const selectedDeviceInfo = filteredDevices.find((d) => d.id === selectedDevice)
    ?? filteredDevices[0];

  const zoneDisplayName =
    selectedZone === ALL_ZONES
      ? perimeter === "abidjan"
        ? "Toutes les communes"
        : "Toutes les villes"
      : selectedZone;

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Analytique</h1>
          <p className="text-muted-foreground mt-1">
            Analyse énergétique par zone géographique, appareil et type de vue
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exporter toutes les données
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Filtres d'analyse
          </CardTitle>
          <CardDescription>
            Abidjan par commune, intérieur par ville — puis appareil, quart et graphique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ligne 1 : géographie + appareil */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Périmètre</label>
              <Select
                value={perimeter}
                onValueChange={(v) => setPerimeter(v as Perimeter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le périmètre" />
                </SelectTrigger>
                <SelectContent>
                  {PERIMETER_OPTIONS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{zoneLabel}</label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choisir une ${zoneLabel.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ZONES}>
                    {perimeter === "abidjan"
                      ? "Toutes les communes"
                      : "Toutes les villes"}
                  </SelectItem>
                  {zoneOptions.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Appareil</label>
              <Select
                value={selectedDevice}
                onValueChange={setSelectedDevice}
                disabled={filteredDevices.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un appareil" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {device.zone} — {device.location}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ligne 2 : quart + type de graphique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtre par quart</label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un quart" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type de graphique</label>
              <Select
                value={selectedGraphType}
                onValueChange={setSelectedGraphType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de graphique" />
                </SelectTrigger>
                <SelectContent>
                  {graphTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedDeviceInfo && (
            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="flex-1 min-w-[200px]">
                  <h4 className="font-medium">{selectedDeviceInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {zoneLabel} : {selectedDeviceInfo.zone} · {selectedDeviceInfo.location}
                  </p>
                </div>
                <Badge variant="outline">{zoneDisplayName}</Badge>
                <Badge variant="secondary">Actif</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EnvironmentalImpact data={mockData} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AnalyticsChart
            data={mockData}
            graphType={selectedGraphType}
            deviceName={selectedDeviceInfo?.name ?? "Appareil inconnu"}
          />
        </div>
        <div className="space-y-6">
          <RealtimeDataPanel data={mockData[mockData.length - 1]} />
        </div>
      </div>

      <SummaryReportTable
        data={mockData}
        deviceName={selectedDeviceInfo?.name ?? "Appareil inconnu"}
      />
    </div>
  );
}
