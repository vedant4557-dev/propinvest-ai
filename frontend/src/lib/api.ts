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
