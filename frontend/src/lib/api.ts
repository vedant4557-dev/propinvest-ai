const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://propinvest-ai-production.up.railway.app";

// BUG FIX: Accept any object so caller controls the shape.
// For single investment, pass the InvestmentInput directly.
// For portfolio, pass { investments: InvestmentInput[] }.
async function apiFetch(endpoint: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // BUG FIX: Surface the actual API error message instead of a generic string
    let message = `API error ${res.status}`;
    try {
      const err = await res.json();
      // FastAPI returns { detail: "..." } for validation/server errors
      if (err?.detail) {
        message =
          typeof err.detail === "string"
            ? err.detail
            : JSON.stringify(err.detail);
      }
    } catch {
      // response body wasn't JSON, keep the status-based message
    }
    throw new Error(message);
  }

  return res.json();
}

export async function analyzeInvestment(data: unknown) {
  return apiFetch("/analyze-investment", data);
}

export async function analyzePortfolio(data: unknown) {
  // Caller must pass { investments: InvestmentInput[] }
  // This is enforced in page.tsx: analyzePortfolio({ investments })
  return apiFetch("/analyze-portfolio", data);
}
