import { useState } from "react";
import { Zap, Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const ADMIN_CREDENTIALS = [
  { login: "groupe-energyguard", password: "energygroupe-ci@2026", nom: "Administrateur", role: "Système" },
  { login: "dev1", password: "ia2026", nom: "Dev 1 — IA", role: "Data Science" },
  { login: "operateur", password: "cie2026", nom: "Opérateur CIE", role: "Opérations" },
];

interface LoginPageProps {
  onLogin: (user: { nom: string; role: string; login: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const found = ADMIN_CREDENTIALS.find(
        (c) => c.login === login.trim() && c.password === password
      );
      if (found) {
        onLogin({ nom: found.nom, role: found.role, login: found.login });
      } else {
        setError("Identifiants incorrects. Vérifiez votre login et mot de passe.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-green-800">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">EnergyGuard CI</h1>
          <p className="text-green-300 text-sm mt-1">Prédire · Optimiser · Protéger</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-1">Connexion administrateur</h2>
          <p className="text-green-300 text-sm mb-6">Accès réservé au personnel autorisé</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-300" />
              <Input
                type="text"
                placeholder="Login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-green-300/60 focus:border-green-400"
                autoComplete="username"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-300" />
              <Input
                type={showPwd ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-green-300/60 focus:border-green-400"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300 hover:text-white transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2 text-red-200 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-2.5 rounded-xl transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion…
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Hint discret pour la démo */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-green-400/40 text-xs text-center">
              Contactez votre administrateur système pour vos identifiants.
            </p>
          </div>
        </div>

        <p className="text-center text-green-400/40 text-xs mt-6">
          CoSTIC 2026 · ESATIC Abidjan · EnergyGuard CI v1.0
        </p>
      </div>
    </div>
  );
}
