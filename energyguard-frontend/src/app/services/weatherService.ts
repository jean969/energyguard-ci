export interface WeatherSnapshot {
  temperature: number;
  cloudCover: number;
  precipitation: number;
  solarRadiation: number;
  updatedAt: string;
}

const ABIDJAN_LAT = 5.36;
const ABIDJAN_LNG = -4.0083;

export async function fetchAbidjanWeather(): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(ABIDJAN_LAT));
  url.searchParams.set("longitude", String(ABIDJAN_LNG));
  url.searchParams.set(
    "current",
    "temperature_2m,cloud_cover,precipitation,shortwave_radiation"
  );
  url.searchParams.set("timezone", "Africa/Abidjan");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Météo indisponible");

  const data = await res.json();
  const c = data.current;

  return {
    temperature: Math.round(c.temperature_2m),
    cloudCover: Math.round(c.cloud_cover),
    precipitation: c.precipitation ?? 0,
    solarRadiation: Math.round(c.shortwave_radiation ?? 0),
    updatedAt: c.time ?? new Date().toISOString(),
  };
}
