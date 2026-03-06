import type {
  AnalyzeInvestmentResponse,
  AnalyzePortfolioResponse,
  InvestmentInput,
  AnalyzePortfolioRequest,
} from "@/types/investment";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://propinvest-ai-production.up.railway.app";

async function apiFetch<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const err = await res.json();
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

  return res.json() as Promise<T>;
}

export async function analyzeInvestment(
  data: InvestmentInput
): Promise<AnalyzeInvestmentResponse> {
  return apiFetch<AnalyzeInvestmentResponse>("/analyze-investment", data);
}

export async function analyzePortfolio(
  data: AnalyzePortfolioRequest
): Promise<AnalyzePortfolioResponse> {
  return apiFetch<AnalyzePortfolioResponse>("/analyze-portfolio", data);
}
