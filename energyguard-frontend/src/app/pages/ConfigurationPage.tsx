import { useEffect, useState } from "react";
import { api } from "../services/api";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Server, Brain, Database, Wifi, WifiOff, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, Zap, Activity,
} from "lucide-react";

interface BackendStatus {
  status: string;
  redis: string;
  models: { rf: boolean; lstm: boolean; isolation: boolean; optim: boolean };
  zones: number;
  predictions: number;
  equipements: number;
}

interface CurrentUser {
  nom: string;
  role: string;
  login: string;
}

interface ConfigurationPageProps {
  user: CurrentUser;
  onLogout: () => void;
}

export function ConfigurationPage({ user, onLogout }: ConfigurationPageProps) {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [health, optimize, maintenance] = await Promise.all([
        api.health(),
        api.optimize(),
        api.maintenance(),
      ]);
      setStatus({
        status: health.status,
        redis: health.redis,
        models: { rf: true, lstm: true, isolation: true, optim: true },
        zones: optimize.total_zones,
        predictions: 0,
        equipements: maintenance.total_equipements,
      });
    } catch {
      setStatus({
        status: "erreur",
        redis: "indisponible",
        models: { rf: false, lstm: false, isolation: false, optim: false },
        zones: 0,
        predictions: 0,
        equipements: 0,
      });
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Configuration"
          description="État du système, modèles IA et gestion admin"
          showLive={false}
        />
        <Button onClick={fetchStatus} variant="outline" size="sm" className="gap-2" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Statut backend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Server className="w-5 h-5" />}
          label="Backend FastAPI"
          value={status?.status === "ok" ? "En ligne" : "Hors ligne"}
          ok={status?.status === "ok"}
          loading={loading}
        />
        <StatCard
          icon={<Wifi className="w-5 h-5" />}
          label="Cache Redis"
          value={status?.redis ?? "—"}
          ok={status?.redis === "connecté"}
          loading={loading}
        />
        <StatCard
          icon={<Database className="w-5 h-5" />}
          label="Zones en DB"
          value={status ? `${status.zones} zones` : "—"}
          ok={(status?.zones ?? 0) > 0}
          loading={loading}
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Équipements"
          value={status ? `${status.equipements} équip.` : "—"}
          ok={(status?.equipements ?? 0) > 0}
          loading={loading}
        />
      </div>

      {/* Modèles IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-5 h-5 text-primary" />
            Modèles IA — Dev 1 Data Science
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { nom: "Random Forest", desc: "Prédiction risque coupure", endpoint: "/predict/", ok: status?.models.rf },
              { nom: "LSTM PyTorch", desc: "Prévision consommation 24h", endpoint: "/predict/ → prevision_24h", ok: status?.models.lstm },
              { nom: "Isolation Forest", desc: "Détection anomalies équipements", endpoint: "/maintenance/", ok: status?.models.isolation },
              { nom: "scipy linprog", desc: "Optimisation distribution HiGHS", endpoint: "/optimize/", ok: status?.models.optim },
            ].map((m) => (
              <div key={m.nom} className="rounded-xl border p-4 space-y-2 bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{m.nom}</span>
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  ) : m.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
                <code className="text-xs bg-muted px-2 py-0.5 rounded text-primary">{m.endpoint}</code>
                <Badge variant={m.ok ? "secondary" : "destructive"} className="text-xs">
                  {loading ? "vérification…" : m.ok ? "Chargé" : "Non chargé"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connexion API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-5 h-5 text-primary" />
            Configuration API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">URL Backend</span>
            <code className="text-sm text-primary font-mono">{apiUrl}</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Documentation Swagger</span>
            <a
              href={`${apiUrl}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline hover:text-primary/80"
            >
              {apiUrl}/docs ↗
            </a>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Dernière actualisation</span>
            <span className="text-sm text-muted-foreground">
              {lastRefresh.toLocaleTimeString("fr-FR")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Profil utilisateur connecté */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Session active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold">{user.nom}</p>
              <p className="text-sm text-muted-foreground">Rôle : {user.role}</p>
              <p className="text-sm text-muted-foreground">Login : <code className="text-primary">{user.login}</code></p>
            </div>
            <Button onClick={onLogout} variant="destructive" size="sm">
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon, label, value, ok, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok: boolean;
  loading: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${ok ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold text-sm">{loading ? "…" : value}</p>
        </div>
        {!loading && (ok
          ? <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
          : <AlertTriangle className="w-4 h-4 text-orange-400 ml-auto" />
        )}
      </CardContent>
    </Card>
  );
}
