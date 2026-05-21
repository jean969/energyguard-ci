import type { Perimeter } from "./analyticsLocations";

export interface AnalyticsDevice {
  id: string;
  name: string;
  perimeter: Perimeter;
  zone: string;
  location: string;
}

export const ANALYTICS_DEVICES: AnalyticsDevice[] = [
  // Abidjan — Plateau
  { id: "device-001", name: "Panneau principal — Plateau", perimeter: "abidjan", zone: "Plateau", location: "Tour administrative" },
  { id: "device-002", name: "Compteur district — Plateau", perimeter: "abidjan", zone: "Plateau", location: "Zone commerciale" },
  // Cocody
  { id: "device-003", name: "Unité CVC — Cocody", perimeter: "abidjan", zone: "Cocody", location: "Riviera Palmeraie" },
  { id: "device-004", name: "Ligne résidentielle — Cocody", perimeter: "abidjan", zone: "Cocody", location: "Angré" },
  // Yopougon
  { id: "device-005", name: "Transformateur — Yopougon", perimeter: "abidjan", zone: "Yopougon", location: "Siporex" },
  // Abobo
  { id: "device-006", name: "Poste source — Abobo", perimeter: "abidjan", zone: "Abobo", location: "Avocatier" },
  { id: "device-007", name: "Délestage secteur — Abobo", perimeter: "abidjan", zone: "Abobo", location: "Abobo Baoulé" },
  // Adjamé
  { id: "device-008", name: "Hub énergétique — Adjamé", perimeter: "abidjan", zone: "Adjamé", location: "Gare du Nord" },
  // Treichville
  { id: "device-009", name: "Circuit industriel — Treichville", perimeter: "abidjan", zone: "Treichville", location: "Zone portuaire" },
  // Marcory
  { id: "device-010", name: "Ligne critique — Marcory", perimeter: "abidjan", zone: "Marcory", location: "Zone 4" },
  { id: "device-011", name: "UPS data center — Marcory", perimeter: "abidjan", zone: "Marcory", location: "Résidentiel" },
  // Port-Bouët
  { id: "device-012", name: "Alimentation aéroport — Port-Bouët", perimeter: "abidjan", zone: "Port-Bouët", location: "Aéroport FHB" },
  // Intérieur
  { id: "device-013", name: "Mini-réseau — Bouaké", perimeter: "interior", zone: "Bouaké", location: "Centre-ville" },
  { id: "device-014", name: "Poste rural — Yamoussoukro", perimeter: "interior", zone: "Yamoussoukro", location: "Quartier administratif" },
  { id: "device-015", name: "Capteur solaire — San-Pédro", perimeter: "interior", zone: "San-Pédro", location: "Zone portuaire" },
  { id: "device-016", name: "Réseau village — Korhogo", perimeter: "interior", zone: "Korhogo", location: "Périphérie nord" },
  { id: "device-017", name: "Compteur agricole — Daloa", perimeter: "interior", zone: "Daloa", location: "Zone cacao" },
  { id: "device-018", name: "Transformateur — Gagnoa", perimeter: "interior", zone: "Gagnoa", location: "Marché central" },
  { id: "device-019", name: "Ligne montagne — Man", perimeter: "interior", zone: "Man", location: "Ouest montagneux" },
  { id: "device-020", name: "Poste frontière — Bondoukou", perimeter: "interior", zone: "Bondoukou", location: "Est" },
];

export function filterDevices(
  perimeter: Perimeter,
  zone: string,
  devices = ANALYTICS_DEVICES
): AnalyticsDevice[] {
  return devices.filter(
    (d) => d.perimeter === perimeter && (zone === "all" || d.zone === zone)
  );
}
