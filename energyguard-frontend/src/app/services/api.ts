/**
 * Point d'entrée API — à brancher sur FastAPI plus tard.
 * Frontend uniquement : retourne des mocks pour l'instant.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchDashboard() {
  if (!API_BASE) {
    return null;
  }
  const res = await fetch(`${API_BASE}/api/dashboard`);
  if (!res.ok) throw new Error("API dashboard");
  return res.json();
}
