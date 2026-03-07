"use client";

import { useMemo } from "react";
import type { AnalyzeInvestmentResponse, InvestmentInput } from "@/types/investment";
import { compareToBenchmarks } from "@/lib/benchmarkEngine";

interface Props {
  result: AnalyzeInvestmentResponse;
  input: InvestmentInput;
}

type Decision = "Buy" | "Buy with Caution" | "Hold / Negotiate" | "Avoid";

interface SmartRecommendation {
  decision: Decision;
  decisionColor: string;
  decisionBg: string;
  emoji: string;
  investmentVerdict: string;
  cashFlowEval: string;
  yieldEval: string;
  riskEval: string;
  benchmarkEval: string;
  keyRisks: string[];
  optimizations: string[];
}

function buildRecommendation(
  result: AnalyzeInvestmentResponse,
  input: InvestmentInput
): SmartRecommendation {
  const m = result.metrics;
  const risk = result.risk;
  const bc = compareToBenchmarks(m.irr);

  // Decision logic
  let score = 0;
  if (m.irr >= 12) score += 3;
  else if (m.irr >= 8) score += 2;
  else if (m.irr >= 5) score += 1;

  if (m.monthly_cash_flow >= 5000) score += 2;
  else if (m.monthly_cash_flow >= 0) score += 1;

  if (m.dscr >= 1.25) score += 2;
  else if (m.dscr >= 1) score += 1;

  if (bc.beatenCount >= 4) score += 2;
  else if (bc.beatenCount >= 2) score += 1;

  if (risk.score >= 65) score += 1;

  let decision: Decision;
  let decisionColor: string;
  let decisionBg: string;
  let emoji: string;

  if (score >= 9) {
    decision = "Buy"; decisionColor = "text-emerald-700 dark:text-emerald-400";
    decisionBg = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    emoji = "✅";
  } else if (score >= 6) {
    decision = "Buy with Caution"; decisionColor = "text-sky-700 dark:text-sky-400";
    decisionBg = "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800";
    emoji = "🔵";
  } else if (score >= 3) {
    decision = "Hold / Negotiate"; decisionColor = "text-amber-700 dark:text-amber-400";
    decisionBg = "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
    emoji = "⚠️";
  } else {
    decision = "Avoid"; decisionColor = "text-rose-700 dark:text-rose-400";
    decisionBg = "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800";
    emoji = "🚫";
  }

  const cashFlowEval = m.monthly_cash_flow >= 10000
    ? `Strong positive cash flow of ₹${Math.round(m.monthly_cash_flow / 1000)}K/month — excellent income property.`
    : m.monthly_cash_flow >= 0
    ? `Marginally cash flow positive (₹${Math.round(m.monthly_cash_flow / 1000)}K/mo) — manageable but tight.`
    : `Negative cash flow of ₹${Math.round(Math.abs(m.monthly_cash_flow) / 1000)}K/month — you will need to top up from savings.`;

  const yieldEval = m.net_rental_yield >= 4
    ? `Net yield of ${m.net_rental_yield.toFixed(1)}% is above market average — good rental return.`
    : m.net_rental_yield >= 3
    ? `Net yield of ${m.net_rental_yield.toFixed(1)}% is near market average — acceptable.`
    : `Net yield of ${m.net_rental_yield.toFixed(1)}% is below typical benchmarks. Negotiate rent-up or price-down.`;

  const riskEval = risk.score >= 70
    ? `Risk score of ${risk.score}/100 — ${risk.label}. Well-structured investment.`
    : risk.score >= 50
    ? `Risk score of ${risk.score}/100 — ${risk.label}. Monitor key risk factors.`
    : `Risk score of ${risk.score}/100 — ${risk.label}. Significant risks present — proceed carefully.`;

  const benchmarkEval = `IRR of ${m.irr.toFixed(1)}% beats ${bc.beatenCount}/${bc.totalBenchmarks} benchmarks. ${bc.verdict}`;

  const investmentVerdict = `${decision}: ${
    decision === "Buy"
      ? "This property shows strong fundamentals across IRR, cash flow, yield, and risk metrics."
      : decision === "Buy with Caution"
      ? "Solid deal but some metrics need monitoring. Ensure you have buffer for cash flow gaps."
      : decision === "Hold / Negotiate"
      ? "Current deal terms need improvement. Try to negotiate price down or increase rent."
      : "This deal underperforms across multiple dimensions. Better alternatives likely exist."
  }`;

  // Key risks
  const keyRisks: string[] = [];
  if (m.monthly_cash_flow < 0) keyRisks.push("Negative cash flow requires monthly top-up from savings");
  if (m.dscr < 1.1) keyRisks.push("Low DSCR — rental income barely covers loan EMI");
  if (m.ltv_ratio > 80) keyRisks.push("High LTV of " + m.ltv_ratio.toFixed(0) + "% increases financial leverage risk");
  if (input.expected_annual_appreciation > 10) keyRisks.push("Appreciation assumption may be optimistic");
  if (bc.beatenCount <= 1) keyRisks.push("Returns are below most investment alternatives");
  if (risk.score < 50) keyRisks.push(risk.explanation);

  // Optimizations
  const optimizations: string[] = [];
  if (m.net_rental_yield < 3.5) optimizations.push("Negotiate property price down by 10–15% to improve yield");
  if (m.monthly_cash_flow < 0) optimizations.push("Increase rent or reduce loan tenure to improve cash flow");
  if (m.dscr < 1.2) optimizations.push("Increase down payment to reduce EMI and improve DSCR");
  if (input.holding_period_years < 5) optimizations.push("Hold for at least 5 years to benefit from appreciation and reduce tax");
  if (m.irr < 10) optimizations.push("Consider REITs or mutual funds for better risk-adjusted returns");
  if (optimizations.length === 0) optimizations.push("Maintain rental income and re-evaluate after 2 years of appreciation");

  return {
    decision,
    decisionColor,
    decisionBg,
    emoji,
    investmentVerdict,
    cashFlowEval,
    yieldEval,
    riskEval,
    benchmarkEval,
    keyRisks: keyRisks.length > 0 ? keyRisks : ["No major risks identified — maintain due diligence"],
    optimizations,
  };
}

export function SmartRecommendationCard({ result, input }: Props) {
  const rec = useMemo(() => buildRecommendation(result, input), [result, input]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 space-y-5">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">🤖 Smart Recommendation</h3>

      {/* Decision verdict */}
      <div className={`rounded-xl border p-4 ${rec.decisionBg}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{rec.emoji}</span>
          <span className={`text-xl font-black ${rec.decisionColor}`}>{rec.decision}</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">{rec.investmentVerdict}</p>
      </div>

      {/* 4-factor evaluation */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Investment Verdict</h4>
        <div className="space-y-2">
          {[
            { icon: "💰", label: "Cash Flow", text: rec.cashFlowEval },
            { icon: "📈", label: "Yield", text: rec.yieldEval },
            { icon: "🛡️", label: "Risk", text: rec.riskEval },
            { icon: "📊", label: "Benchmarks", text: rec.benchmarkEval },
          ].map(item => (
            <div key={item.label} className="flex gap-2 text-sm">
              <span>{item.icon}</span>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}: </span>
                <span className="text-slate-600 dark:text-slate-400">{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Risks */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">⚠️ Key Risks</h4>
        <ul className="space-y-1.5">
          {rec.keyRisks.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="text-rose-400 shrink-0">•</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Optimizations */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">💡 Optimization Suggestions</h4>
        <ul className="space-y-1.5">
          {rec.optimizations.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="text-emerald-400 shrink-0">→</span>
              {o}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
