import { useState } from "react";
import {
  Download, FileSpreadsheet, FileText, MapPin,
  Sun, Leaf, AlertTriangle, BarChart3,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { LoadingScreen, ErrorScreen } from "../components/DataLoader";
import { useBackendData } from "../hooks/useBackendData";
import { buildFullReportWorkbook, reportFilename, type ReportPeriod } from "../data/reportData";
import { downloadExcelWorkbook, downloadExcelSheet } from "../services/excelExport";

export function ReportsPage() {
  const { data, loading, error, refetch } = useBackendData();
  const [period, setPeriod] = useState<ReportPeriod>("mois");
  const [exporting, setExporting] = useState(false);

  if (loading) return <LoadingScreen message="Chargement des rapports…" />;
  if (error || !data) return <ErrorScreen error={error ?? "Données indisponibles"} onRetry={refetch} />;

  const handleExportFull = async () => {
    setExporting(true);
    try {
      const sheets = buildFullReportWorkbook(period);
      downloadExcelWorkbook(sheets, reportFilename(period));
    } finally {
      setExporting(false);
    }
  };

  const handleExportSheet = (sheetName: string, rows: Record<string, string | number>[]) => {
    downloadExcelSheet(rows, sheetName, reportFilename(period).replace(".xlsx", `_${sheetName}.xlsx`));
  };

  const zoneRows = data.zones.map((z) => ({ Commune: z.name, Risque: z.risk, Score: z.score }));

  const miniGridRows = (data.raw.miniGrid?.villages ?? []).map((v) => ({
    Village: v.nom_village,
    Batterie: `${v.niveau_batterie_pct}%`,
    "Solaire (kWh)": v.production_solaire_kwh,
    "Conso prévue soir": v.consommation_prevue_soir_kwh,
    "Autonomie (h)": v.autonomie_estimee_heures,
    Statut: v.statut,
  }));

  const impact = data.raw.impact;

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title="Rapports énergétiques"
          description="Synthèse réseau, mini-réseaux, impact et alertes — données temps réel"
          showLive={false}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jour">Rapport journalier</SelectItem>
              <SelectItem value="semaine">Rapport hebdomadaire</SelectItem>
              <SelectItem value="mois">Rapport mensuel</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportFull} disabled={exporting} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            {exporting ? "Export en cours…" : "Télécharger tout (Excel)"}
          </Button>
        </div>
      </div>

      {/* KPIs temps réel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Score risque global", value: `${data.keyIndicators.riskScore}/100`, icon: BarChart3 },
          { label: "kWh optimisés", value: (impact?.kwh_optimises ?? 0).toLocaleString("fr-FR"), icon: FileText },
          { label: "CO₂ évité", value: `${(impact?.co2_evite_kg ?? 0).toLocaleString("fr-FR")} kg`, icon: Leaf },
          { label: "Alertes actives", value: data.alerts.length, icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="w-8 h-8 text-primary opacity-80" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="zones" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="zones" className="gap-1"><MapPin className="w-4 h-4" />Zones</TabsTrigger>
          <TabsTrigger value="minigrids" className="gap-1"><Sun className="w-4 h-4" />Mini-réseaux</TabsTrigger>
          <TabsTrigger value="impact" className="gap-1"><Leaf className="w-4 h-4" />Impact</TabsTrigger>
          <TabsTrigger value="alertes" className="gap-1"><AlertTriangle className="w-4 h-4" />Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="zones">
          <ReportSection
            title="Risque par zone"
            description="Scores et niveaux de risque — modèle Random Forest temps réel"
            onExport={() => handleExportSheet("Zones", zoneRows)}
          >
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Niveau (RF)</TableHead>
                  <TableHead>Score RF</TableHead>
                  <TableHead>Demande kWh</TableHead>
                  <TableHead>Allocation kWh</TableHead>
                  <TableHead>Déficit kWh</TableHead>
                  <TableHead>Taux service</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.raw.optimize?.zones ?? []).map((z) => (
                  <TableRow key={z.zone_id}>
                    <TableCell className="font-medium whitespace-nowrap">{z.nom}</TableCell>
                    <TableCell><RiskBadge risk={z.niveau_risque} /></TableCell>
                    <TableCell className="font-bold">{data.zones.find(dz => dz.name === z.nom)?.score ?? "—"}/100</TableCell>
                    <TableCell>{z.demande_kwh} kWh</TableCell>
                    <TableCell className="text-green-700 font-medium">{z.allocation_kwh} kWh</TableCell>
                    <TableCell className={z.deficit_kwh > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                      {z.deficit_kwh > 0 ? `-${z.deficit_kwh} kWh` : "0 kWh"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${Math.min(z.taux_service, 100)}%`, backgroundColor: z.taux_service >= 90 ? "#16a34a" : z.taux_service >= 70 ? "#d97706" : "#dc2626" }} />
                        </div>
                        <span className="text-sm">{z.taux_service}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px]">{z.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </ReportSection>
        </TabsContent>

        <TabsContent value="minigrids">
          <ReportSection
            title="Mini-réseaux ruraux"
            description="État en temps réel depuis la base de données"
            onExport={() => handleExportSheet("Mini-réseaux", miniGridRows)}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Village</TableHead>
                  <TableHead>Batterie</TableHead>
                  <TableHead>Solaire (kWh)</TableHead>
                  <TableHead>Conso soir (kWh)</TableHead>
                  <TableHead>Autonomie (h)</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.raw.miniGrid?.villages ?? []).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.nom_village}</TableCell>
                    <TableCell>{v.niveau_batterie_pct}%</TableCell>
                    <TableCell>{v.production_solaire_kwh}</TableCell>
                    <TableCell>{v.consommation_prevue_soir_kwh}</TableCell>
                    <TableCell>{v.autonomie_estimee_heures}</TableCell>
                    <TableCell>
                      <Badge variant={v.statut === "Critique" ? "destructive" : v.statut === "Faible" ? "outline" : "secondary"}>
                        {v.statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportSection>
        </TabsContent>

        <TabsContent value="impact">
          <ReportSection
            title="Impact environnemental"
            description="CO₂ évité, diesel et arbres préservés — calculés par le backend"
            onExport={() =>
              handleExportSheet("Impact", [
                { Indicateur: "Coupures évitées", Valeur: impact?.coupures_evitees ?? 0 },
                { Indicateur: "CO₂ évité (kg)", Valeur: impact?.co2_evite_kg ?? 0 },
                { Indicateur: "Diesel non brûlé (L)", Valeur: impact?.litres_diesel_non_brules ?? 0 },
                { Indicateur: "Arbres préservés", Valeur: impact?.arbres_preserves ?? 0 },
                { Indicateur: "kWh optimisés", Valeur: impact?.kwh_optimises ?? 0 },
                { Indicateur: "Total prédictions", Valeur: impact?.total_predictions ?? 0 },
              ])
            }
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ImpactStat label="Coupures évitées" value={String(impact?.coupures_evitees ?? 0)} />
              <ImpactStat label="CO₂ évité" value={`${(impact?.co2_evite_kg ?? 0).toLocaleString("fr-FR")} kg`} />
              <ImpactStat label="Diesel non brûlé" value={`${(impact?.litres_diesel_non_brules ?? 0).toLocaleString("fr-FR")} L`} />
              <ImpactStat label="Arbres préservés" value={String(Math.round(impact?.arbres_preserves ?? 0))} />
              <ImpactStat label="kWh optimisés" value={`${Math.round(impact?.kwh_optimises ?? 0).toLocaleString("fr-FR")}`} />
              <ImpactStat label="Prédictions IA" value={String(impact?.total_predictions ?? 0)} />
            </div>
          </ReportSection>
        </TabsContent>

        <TabsContent value="alertes">
          <ReportSection
            title="Alertes actives"
            description="Générées en temps réel depuis le backend (maintenance + mini-réseaux + zones)"
            onExport={() =>
              handleExportSheet("Alertes", data.alerts.map((a) => ({
                Type: a.type, Gravité: a.severity, Titre: a.title,
                Zone: a.zone ?? "—", Heure: a.time,
              })))
            }
          >
            <div className="space-y-3">
              {data.alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune alerte active</p>
              ) : data.alerts.map((a) => (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.zone && <Badge variant="outline">{a.zone}</Badge>}
                    <Badge variant={a.severity === "critical" ? "destructive" : "secondary"}>{a.severity}</Badge>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </ReportSection>
        </TabsContent>
      </Tabs>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export complet EnergyGuard CI
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              8 feuilles Excel : Synthèse, Zones, Mini-réseaux, Impact, Alertes, Recommandations…
            </p>
          </div>
          <Button variant="outline" onClick={handleExportFull} disabled={exporting} className="gap-2 shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
            Télécharger .xlsx
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportSection({ title, description, onExport, children }: {
  title: string; description: string; onExport: () => void; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2 w-fit">
            <FileSpreadsheet className="w-4 h-4" />Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const styles: Record<string, string> = {
    Faible: "bg-green-100 text-green-800", Moyen: "bg-orange-100 text-orange-800",
    Élevé: "bg-red-100 text-red-800", Critique: "bg-neutral-900 text-neutral-100",
    Eleve: "bg-red-100 text-red-800",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[risk] ?? "bg-gray-100 text-gray-800"}`}>
      {risk}
    </span>
  );
}

function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
      <p className="text-xs text-green-700">{label}</p>
      <p className="text-xl font-bold text-green-900 mt-1">{value}</p>
    </div>
  );
}
