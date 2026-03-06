<<<<<<< HEAD
import type {
  InvestmentInput,
  AnalyzeInvestmentResponse,
  AnalyzePortfolioRequest,
  AnalyzePortfolioResponse,
} from "@/types/investment";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://propinvest-ai-production.up.railway.app";

async function apiFetch<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const err = await res.json();
      if (err?.detail) {
        message = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
      }
    } catch { /* keep status message */ }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function analyzeInvestment(data: InvestmentInput): Promise<AnalyzeInvestmentResponse> {
  return apiFetch<AnalyzeInvestmentResponse>("/analyze-investment", data);
}

export function analyzePortfolio(data: AnalyzePortfolioRequest): Promise<AnalyzePortfolioResponse> {
  return apiFetch<AnalyzePortfolioResponse>("/analyze-portfolio", data);
}
=======
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://propinvest-ai-production.up.railway.app";

export async function analyzeInvestment(data: any) {
  const res = await fetch(`${API_URL}/analyze-investment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}

export async function analyzePortfolio(data: any) {
  const res = await fetch(`${API_URL}/analyze-portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}
>>>>>>> faddc4e (Fix API URL)
