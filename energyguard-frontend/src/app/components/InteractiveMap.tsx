import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { ENERGY_FLOWS } from "../data/energyData";
import {
  normalizeZone,
  riskToColor,
  riskToLabel,
  type MapZoneInput,
  type MiniGridInput,
} from "./mapUtils";

const LEGEND_ITEMS = {
  zones: [
    ["Faible", "#22c55e"],
    ["Moyen", "#f59e0b"],
    ["Élevé", "#ef4444"],
    ["Critique", "#171717"],
  ] as const,
  miniGrids: [
    ["Bon état", "#22c55e"],
    ["Attention", "#f59e0b"],
    ["Critique", "#ef4444"],
  ] as const,
};

function miniGridMarkerColor(status: string): string {
  if (status === "good") return "#22c55e";
  if (status === "warning") return "#f59e0b";
  return "#ef4444";
}

export interface InteractiveMapProps {
  zones?: MapZoneInput[];
  miniGrids?: MiniGridInput[];
  showEnergyFlows?: boolean;
}

/**
 * Carte interactive Abidjan — Leaflet + OpenStreetMap (sans token Mapbox).
 */
export function InteractiveMap({
  zones = [],
  miniGrids = [],
  showEnergyFlows = false,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const zonesKey = useMemo(() => JSON.stringify(zones), [zones]);
  const miniGridsKey = useMemo(() => JSON.stringify(miniGrids), [miniGrids]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([5.36, -4.008], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    zones.map(normalizeZone).forEach((zone) => {
      if (!zone.coords?.length) return;

      const color = riskToColor(zone.risk);
      const polygon = L.polygon(zone.coords, {
        color,
        fillColor: color,
        fillOpacity: 0.25,
        weight: 2,
      }).addTo(map);

      polygon.bindPopup(`
        <div style="font-family:sans-serif;min-width:160px;">
          <strong style="font-size:14px;">${zone.name}</strong>
          <div style="margin-top:6px;font-size:12px;color:#555;">
            Risque : <span style="color:${color};font-weight:600;">${riskToLabel(zone.risk)}</span><br/>
            ${zone.score != null ? `Score : ${zone.score} / 100<br/>` : ""}
            Charge : ${Math.round((zone.score ?? 50) * 0.8 + 20)} MW
          </div>
        </div>
      `);
    });

    if (showEnergyFlows) {
      ENERGY_FLOWS.forEach((flow) => {
        L.polyline([flow.from, flow.to], {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.75,
          dashArray: "8 6",
        })
          .addTo(map)
          .bindPopup(flow.label ?? "Flux énergétique");
      });
    }

    miniGrids.forEach((grid) => {
      const color = miniGridMarkerColor(grid.status);
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background:${color};width:22px;height:22px;border-radius:50%;
          border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
          font-size:10px;color:white;font-weight:bold;">☀</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker([grid.lat, grid.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;">
            <strong style="font-size:13px;">☀ ${grid.name}</strong>
            <div style="margin-top:8px;font-size:12px;color:#555;line-height:1.7;">
              🔋 Batterie : <strong style="color:${grid.batteryLevel < 20 ? "#ef4444" : grid.batteryLevel < 50 ? "#f59e0b" : "#22c55e"}">${grid.batteryLevel}%</strong><br/>
              ⚡ Production : ${grid.solarProduction} kWh
            </div>
          </div>
        `);
    });

    mapRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [zonesKey, miniGridsKey, showEnergyFlows, zones, miniGrids]);

  return (
    <div>
      <div
        ref={containerRef}
        className="w-full rounded-[14px] overflow-hidden border border-white/10"
        style={{ height: 500 }}
      />

      <div className="mt-3 flex flex-wrap gap-5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground/70">Zones :</span>
        {LEGEND_ITEMS.zones.map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm opacity-80"
              style={{ background: color }}
            />
            {label}
          </span>
        ))}
        {showEnergyFlows && (
          <>
            <span className="ml-2 font-semibold text-foreground/70">Flux :</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5 border-t-2 border-dashed border-blue-500" />
              Rééquilibrage
            </span>
          </>
        )}
        <span className="ml-2 font-semibold text-foreground/70">Mini-réseaux :</span>
        {LEGEND_ITEMS.miniGrids.map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
