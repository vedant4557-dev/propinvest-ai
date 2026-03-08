// Benchmark Engine — PropInvest AI
// Compares property IRR against standard investment alternatives

export interface BenchmarkData {
  name: string;
  expectedReturn: number;   // annual % return
  riskLevel: "Low" | "Medium" | "High";
  liquidity: "High" | "Medium" | "Low";
  taxEfficiency: "High" | "Medium" | "Low";
  color: string;
  description: string;
}

export interface BenchmarkComparison {
  propertyIRR: number;
  benchmarks: BenchmarkData[];
  chartData: { name: string; return: number; color: string }[];
  verdict: string;
  beatenCount: number;
  totalBenchmarks: number;
}

export const BENCHMARKS: BenchmarkData[] = [
  {
    name: "Fixed Deposit",
    expectedReturn: 7.0,
    riskLevel: "Low",
    liquidity: "Medium",
    taxEfficiency: "Low",
    color: "#94a3b8",
    description: "Bank FD @ 7% p.a. — safe but fully taxable",
  },
  {
    name: "PPF",
    expectedReturn: 7.1,
    riskLevel: "Low",
    liquidity: "Low",
    taxEfficiency: "High",
    color: "#64748b",
    description: "Public Provident Fund — tax-free but 15-yr lock-in",
  },
  {
    name: "REITs",
    expectedReturn: 8.5,
    riskLevel: "Medium",
    liquidity: "High",
    taxEfficiency: "Medium",
    color: "#f59e0b",
    description: "Real Estate Investment Trusts — liquid real estate exposure",
  },
  {
    name: "Mutual Funds",
    expectedReturn: 10.0,
    riskLevel: "Medium",
    liquidity: "High",
    taxEfficiency: "Medium",
    color: "#8b5cf6",
    description: "Diversified equity mutual funds — market-linked",
  },
  {
    name: "Nifty 50",
    expectedReturn: 12.0,
    riskLevel: "High",
    liquidity: "High",
    taxEfficiency: "Medium",
    color: "#06b6d4",
    description: "Nifty 50 index — long-term equity returns",
  },
  {
    name: "Gold",
    expectedReturn: 8.0,
    riskLevel: "Medium",
    liquidity: "High",
    taxEfficiency: "Low",
    color: "#f97316",
    description: "Physical gold / Sovereign Gold Bonds",
  },
];

export function compareToBenchmarks(propertyIRR: number): BenchmarkComparison {
  const beaten = BENCHMARKS.filter(b => propertyIRR > b.expectedReturn);

  const chartData = [
    { name: "Your Property", return: Math.round(propertyIRR * 10) / 10, color: "#10b981" },
    ...BENCHMARKS.map(b => ({ name: b.name, return: b.expectedReturn, color: b.color })),
  ];

  let verdict: string;
  if (beaten.length === BENCHMARKS.length) {
    verdict = "Exceptional — beats all benchmarks including Nifty 50.";
  } else if (beaten.length >= 4) {
    verdict = "Strong — outperforms most investment alternatives.";
  } else if (beaten.length >= 2) {
    verdict = "Moderate — beats some benchmarks but lags equity markets.";
  } else if (beaten.length === 1) {
    verdict = "Weak — only beats Fixed Deposit. Consider alternatives.";
  } else {
    verdict = "Poor — underperforms even Fixed Deposits. Re-evaluate the deal.";
  }

  return {
    propertyIRR,
    benchmarks: BENCHMARKS,
    chartData,
    verdict,
    beatenCount: beaten.length,
    totalBenchmarks: BENCHMARKS.length,
  };
}
