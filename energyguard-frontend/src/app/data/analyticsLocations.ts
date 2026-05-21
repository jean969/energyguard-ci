/** Communes d'Abidjan (alignées sur le tableau de bord) */
export const ABIDJAN_COMMUNES = [
  "Plateau",
  "Cocody",
  "Yopougon",
  "Abobo",
  "Adjamé",
  "Treichville",
  "Marcory",
  "Port-Bouët",
] as const;

/** Villes hors Abidjan */
export const INTERIOR_CITIES = [
  "Bouaké",
  "Yamoussoukro",
  "San-Pédro",
  "Korhogo",
  "Daloa",
  "Gagnoa",
  "Man",
  "Bondoukou",
] as const;

export type Perimeter = "abidjan" | "interior";

export const PERIMETER_OPTIONS: { id: Perimeter; name: string }[] = [
  { id: "abidjan", name: "Abidjan" },
  { id: "interior", name: "Hors Abidjan" },
];

export function getZonesForPerimeter(perimeter: Perimeter): readonly string[] {
  return perimeter === "abidjan" ? ABIDJAN_COMMUNES : INTERIOR_CITIES;
}

export function getZoneLabel(perimeter: Perimeter): string {
  return perimeter === "abidjan" ? "Commune" : "Ville";
}
