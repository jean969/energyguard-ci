import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  Sun,
  Leaf,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  KEY_INDICATORS,
  ZONES,
  MINI_GRIDS,
  ENVIRONMENTAL_IMPACT,
  SYSTEM_ALERTS,
} from "../data/energyData";
import {
  buildFullReportWorkbook,
  reportFilename,
  type ReportPeriod,
} from "../data/reportData";
import { downloadExcelWorkbook, downloadExcelSheet } from "../services/excelExport";

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("mois");
  const [exporting, setExporting] = useState(false);

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
    const safe = reportFilename(period).replace(".xlsx", `_${sheetName}.xlsx`);
    downloadExcelSheet(rows, sheetName, safe);
  };

  const zoneRows = ZONES.map((z) => ({
    Commune: z.name,
    Risque: z.risk,
    Score: z.score,
  }));

  const miniGridRows = MINI_GRIDS.map((g) => ({
    Village: g.name,
    Batterie: `${g.batteryLevel}%`,
    Solaire: g.solarProduction,
    Statut: g.status,
  }));

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title="Rapports énergétiques"
          description="Synthèse réseau, mini-réseaux, impact et alertes — export Excel"
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
          <Button
            onClick={handleExportFull}
            disabled={exporting}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting ? "Export en cours…" : "Télécharger tout (Excel)"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Score risque", value: `${KEY_INDICATORS.riskScore}/100`, icon: BarChart3 },
          { label: "kWh optimisés", value: KEY_INDICATORS.kwhOptimized.toLocaleString("fr-FR"), icon: FileText },
          { label: "CO₂ évité", value: `${KEY_INDICATORS.co2Avoided.toLocaleString("fr-FR")} kg`, icon: Leaf },
          { label: "Alertes actives", value: SYSTEM_ALERTS.length, icon: AlertTriangle },
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
          <TabsTrigger value="zones" className="gap-1">
            <MapPin className="w-4 h-4" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="minigrids" className="gap-1">
            <Sun className="w-4 h-4" />
            Mini-réseaux
          </TabsTrigger>
          <TabsTrigger value="impact" className="gap-1">
            <Leaf className="w-4 h-4" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="alertes" className="gap-1">
            <AlertTriangle className="w-4 h-4" />
            Alertes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones">
          <ReportSection
            title="Risque par commune — Abidjan"
            description="Scores et niveaux de risque pour la période sélectionnée"
            onExport={() => handleExportSheet("Zones", zoneRows)}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commune</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ZONES.map((z) => (
                  <TableRow key={z.name}>
                    <TableCell className="font-medium">{z.name}</TableCell>
                    <TableCell>
                      <RiskBadge risk={z.risk} />
                    </TableCell>
                    <TableCell>{z.score}/100</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportSection>
        </TabsContent>

        <TabsContent value="minigrids">
          <ReportSection
            title="Mini-réseaux ruraux"
            description="État des villages et rapports de consommation"
            onExport={() => handleExportSheet("Mini-réseaux", miniGridRows)}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Village</TableHead>
                  <TableHead>Batterie</TableHead>
                  <TableHead>Production (kWh)</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MINI_GRIDS.map((g) => (
                  <TableRow key={g.name}>
                    <TableCell className="font-medium">{g.name}</TableCell>
                    <TableCell>{g.batteryLevel}%</TableCell>
                    <TableCell>{g.solarProduction}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          g.status === "good"
                            ? "secondary"
                            : g.status === "warning"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {g.status}
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
            description="CO₂ évité, diesel et arbres préservés"
            onExport={() =>
              handleExportSheet("Impact", [
                { Indicateur: "CO₂ évité (kg)", Valeur: ENVIRONMENTAL_IMPACT.co2Avoided },
                { Indicateur: "Diesel non brûlé (L)", Valeur: ENVIRONMENTAL_IMPACT.dieselNotBurned },
                { Indicateur: "Arbres préservés", Valeur: ENVIRONMENTAL_IMPACT.treesPreserved },
              ])
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImpactStat label="CO₂ évité" value={`${ENVIRONMENTAL_IMPACT.co2Avoided.toLocaleString("fr-FR")} kg`} />
              <ImpactStat label="Diesel non brûlé" value={`${ENVIRONMENTAL_IMPACT.dieselNotBurned.toLocaleString("fr-FR")} L`} />
              <ImpactStat label="Arbres préservés" value={String(ENVIRONMENTAL_IMPACT.treesPreserved)} />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Le fichier Excel complet inclut aussi les onglets <strong>Hebdomadaire</strong> et{" "}
              <strong>Mensuel</strong> avec l&apos;historique détaillé.
            </p>
          </ReportSection>
        </TabsContent>

        <TabsContent value="alertes">
          <ReportSection
            title="Journal des alertes"
            description="Coupures, maintenance et mini-réseaux"
            onExport={() =>
              handleExportSheet(
                "Alertes",
                SYSTEM_ALERTS.map((a) => ({
                  Type: a.type,
                  Gravité: a.severity,
                  Titre: a.title,
                  Zone: a.zone ?? "—",
                  Date: a.time,
                }))
              )
            }
          >
            <div className="space-y-3">
              {SYSTEM_ALERTS.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.zone && <Badge variant="outline">{a.zone}</Badge>}
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
              8 feuilles Excel : Synthèse, Zones, Mini-réseaux, Impact, Hebdomadaire, Mensuel, Alertes, Recommandations
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

function ReportSection({
  title,
  description,
  onExport,
  children,
}: {
  title: string;
  description: string;
  onExport: () => void;
  children: React.ReactNode;
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
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const styles: Record<string, string> = {
    Faible: "bg-green-100 text-green-800",
    Moyen: "bg-orange-100 text-orange-800",
    Élevé: "bg-red-100 text-red-800",
    Critique: "bg-neutral-900 text-neutral-100",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[risk] ?? ""}`}>
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
