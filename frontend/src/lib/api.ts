/**
 * API client for PropInvest AI backend.
 */

import type {
  InvestmentInput,
  AnalyzeInvestmentResponse,
  AnalyzePortfolioResponse,
} from "@/types/investment";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      (err as { detail?: string })?.detail ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export async function analyzeInvestment(
  input: InvestmentInput
): Promise<AnalyzeInvestmentResponse> {
  const res = await fetch(`${API_BASE}/analyze-investment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<AnalyzeInvestmentResponse>(res);
}

export async function analyzePortfolio(
  investments: InvestmentInput[]
): Promise<AnalyzePortfolioResponse> {
  const res = await fetch(`${API_BASE}/analyze-portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ investments }),
  });
  return handleResponse<AnalyzePortfolioResponse>(res);
}
