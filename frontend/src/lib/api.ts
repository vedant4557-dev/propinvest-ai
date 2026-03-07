const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://propinvest-ai-production.up.railway.app";

async function apiFetch(endpoint: string, body: unknown) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `API error ${res.status}`);
  }
  return res.json();
}

export const analyzeInvestment = (data: unknown) => apiFetch("/analyze-investment", data);
export const analyzePortfolio = (data: unknown) => apiFetch("/analyze-portfolio", data);
