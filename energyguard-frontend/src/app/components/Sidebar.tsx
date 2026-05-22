import { useState } from "react";
import { cn } from "./ui/utils";
import {
  LayoutDashboard, BarChart3, Settings, FileText, User,
  Zap, X, Map, Sun, Leaf, PlayCircle, LogOut,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  user: { nom: string; role: string; login: string };
  onLogout: () => void;
}

export function Sidebar({ currentPage, onPageChange, user, onLogout }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNavigationClick = (pageId: string) => {
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => onPageChange(pageId), 150);
    } else {
      onPageChange(pageId);
    }
  };

  const navigationItems = [
    { id: "dashboard",     name: "Tableau de bord", icon: LayoutDashboard, description: "Vue d'ensemble" },
    { id: "map",           name: "Carte",            icon: Map,             description: "Risques & flux" },
    { id: "minigrids",     name: "Mini-réseaux",     icon: Sun,             description: "Zones rurales" },
    { id: "environment",   name: "Impact",           icon: Leaf,            description: "CO₂ & environnement" },
    { id: "demo",          name: "Démo live",        icon: PlayCircle,      description: "Coupure évitée" },
    { id: "reports",       name: "Rapports",         icon: FileText,        description: "Export Excel" },
    { id: "configuration", name: "Configuration",    icon: Settings,        description: "Paramètres système" },
    { id: "settings",      name: "Profil",           icon: User,            description: "Préférences" },
  ];

  // Initiales depuis le nom
  const initials = user.nom
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="ml-6 my-6">
      <div
        className={cn(
          "flex flex-col h-[calc(100vh-3rem)] transition-all duration-300 ease-in-out rounded-3xl",
          "bg-gradient-to-b from-sidebar via-sidebar to-sidebar-accent shadow-2xl border border-sidebar-border/20 overflow-hidden",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        {/* Header */}
        <div className="p-6 flex flex-col items-center relative flex-shrink-0">
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X className="w-4 h-4 text-sidebar-foreground" />
            </button>
          )}
          <div className="w-12 h-12 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {isExpanded && (
            <div className="mt-3 text-center">
              <h2 className="text-sidebar-foreground font-semibold text-base whitespace-nowrap">EnergyGuard CI</h2>
              <p className="text-sidebar-foreground/70 text-xs whitespace-nowrap mt-1">Prédire · Optimiser · Protéger</p>
            </div>
          )}
        </div>

        {/* Navigation — scrollable pour que tous les items soient accessibles */}
        <nav className="flex-1 px-4 overflow-y-auto scrollbar-none">
          <div className="space-y-3 py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavigationClick(item.id)}
                    className={cn(
                      "transition-all duration-300 flex items-center relative overflow-hidden",
                      "hover:scale-110 hover:shadow-lg",
                      isExpanded
                        ? "w-full px-4 py-3 justify-start rounded-xl"
                        : "w-12 h-12 justify-center mx-auto rounded-full",
                      isActive
                        ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/30 scale-105"
                        : "bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 hover:from-sidebar-primary/80 hover:to-sidebar-primary/60"
                    )}
                  >
                    <Icon className={cn(
                      "transition-colors duration-300 flex-shrink-0 w-5 h-5",
                      isActive ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground"
                    )} />
                    {isExpanded && (
                      <div className="ml-3 overflow-hidden">
                        <div className={cn(
                          "font-medium text-sm whitespace-nowrap transition-colors duration-300",
                          isActive ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground"
                        )}>
                          {item.name}
                        </div>
                        {isActive && (
                          <div className="text-xs text-sidebar-primary-foreground/70 mt-0.5 whitespace-nowrap">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}
                    {isActive && !isExpanded && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-sidebar-primary opacity-20 animate-pulse" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-l-full" />
                      </>
                    )}
                    {isActive && isExpanded && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-sidebar-primary-foreground rounded-full animate-pulse" />
                    )}
                  </button>
                  {!isExpanded && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg transform translate-x-2 group-hover:translate-x-0">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs opacity-75 mt-1">{item.description}</div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-sidebar-primary rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Profil utilisateur connecté */}
        <div className="p-4 flex-shrink-0 border-t border-sidebar-border/20">
          <div className="relative group">
            {isExpanded ? (
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent/50">
                <div className="w-9 h-9 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-sidebar-primary-foreground font-semibold text-sm">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sidebar-foreground font-medium text-sm truncate">{user.nom}</p>
                  <p className="text-sidebar-foreground/60 text-xs truncate">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Se déconnecter"
                  className="text-sidebar-foreground/50 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className="w-12 h-12 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer mx-auto"
                onClick={() => setIsExpanded(true)}
              >
                <span className="text-sidebar-primary-foreground font-semibold text-sm">{initials}</span>
              </div>
            )}
            {!isExpanded && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                <div className="font-medium text-sm">{user.nom}</div>
                <div className="text-xs opacity-75 mt-1">{user.role}</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-sidebar-primary rotate-45" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
