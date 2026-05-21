import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "./ui/button";

export function LoadingScreen({ message = "Chargement des données en temps réel…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
      <WifiOff className="w-10 h-10 text-red-400" />
      <p className="text-base font-medium text-foreground">Connexion au backend impossible</p>
      <p className="text-sm text-red-400 max-w-sm text-center">{error}</p>
      <p className="text-xs text-muted-foreground">Vérifiez que FastAPI tourne sur http://localhost:8000</p>
      <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 mt-2">
        <RefreshCw className="w-4 h-4" />
        Réessayer
      </Button>
    </div>
  );
}
