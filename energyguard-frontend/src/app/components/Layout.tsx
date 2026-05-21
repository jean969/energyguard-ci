import { lazy, Suspense, useState } from "react";
import { Sidebar } from "./Sidebar";
import { MainDashboard } from "./MainDashboard";
import { MapPage } from "../pages/MapPage";
import { MiniGridsPage } from "../pages/MiniGridsPage";
import { EnvironmentPage } from "../pages/EnvironmentPage";
import { DemoPage } from "../pages/DemoPage";
import { ReportsPage } from "../pages/ReportsPage";
import { LoginPage } from "../pages/LoginPage";
import { ConfigurationPage } from "../pages/ConfigurationPage";

const Analytics = lazy(() =>
  import("./Analytics").then((m) => ({ default: m.Analytics }))
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const Settings = () => (
  <div className="p-6">
    <h1 className="text-3xl mb-4">Paramètres et profil</h1>
    <p className="text-muted-foreground">Préférences utilisateur — à venir.</p>
  </div>
);

interface User {
  nom: string;
  role: string;
  login: string;
}

export function Layout() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);

  // ─── Auth gate ────────────────────────────────────────────────────────────
  if (!user) {
    return <LoginPage onLogin={(u) => setUser(u)} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":   return <MainDashboard />;
      case "map":         return <MapPage />;
      case "minigrids":   return <MiniGridsPage />;
      case "environment": return <EnvironmentPage />;
      case "demo":        return <DemoPage />;
      case "analytics":
        return (
          <Suspense fallback={<PageLoader />}>
            <Analytics />
          </Suspense>
        );
      case "configuration":
        return <ConfigurationPage user={user} onLogout={() => setUser(null)} />;
      case "reports":     return <ReportsPage />;
      case "settings":    return <Settings />;
      default:            return <MainDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-shrink-0">
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          user={user}
          onLogout={() => setUser(null)}
        />
      </div>
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}

export default Layout;
