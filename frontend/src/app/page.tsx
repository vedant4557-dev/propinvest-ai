"use client";

import { useState, useRef } from "react";
import { InputForm } from "@/components/InputForm";
import { PortfolioForm } from "@/components/PortfolioForm";
import { KPICards } from "@/components/KPICards";
import { RiskBadge } from "@/components/RiskBadge";
import { AISummary } from "@/components/AISummary";
import { CashFlowChart } from "@/components/CashFlowChart";
import { PropertyGrowthChart } from "@/components/PropertyGrowthChart";
import { MonteCarloCard } from "@/components/MonteCarloCard";
import { ProbabilityGauge } from "@/components/ProbabilityGauge";
import { SensitivityTable } from "@/components/SensitivityTable";
import { TaxAnalysisCard } from "@/components/TaxAnalysisCard";
import { IRRDistributionChart } from "@/components/IRRDistributionChart";
import { ScenarioOutcomeChart } from "@/components/ScenarioOutcomeChart";
import { DealScoreBadge } from "@/components/DealScoreBadge";
import { NegotiationCard } from "@/components/NegotiationCard";
import { RedFlagsList } from "@/components/RedFlagsList";
import { FairValueChart } from "@/components/FairValueChart";
import { StressTestCard } from "@/components/StressTestCard";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportPDF } from "@/components/ExportPDF";
import { analyzeInvestment, analyzePortfolio } from "@/lib/api";
import type {
  InvestmentInput,
  AnalyzeInvestmentResponse,
  AnalyzePortfolioResponse,
} from "@/types/investment";

type Mode = "single" | "portfolio";

export default function Home() {
  const [mode, setMode] = useState<Mode>("single");
  const [result, setResult] = useState<AnalyzeInvestmentResponse | null>(null);
  const [portfolioResult, setPortfolioResult] =
    useState<AnalyzePortfolioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<InvestmentInput | null>(null);

  const reportRef = useRef<HTMLDivElement | null>(null);

  const handleAnalyze = async (input: InvestmentInput) => {
    setLoading(true);
    setError(null);
    setPortfolioResult(null);
    setInputs(input);
    try {
      const data = await analyzeInvestment(input);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioAnalyze = async (investments: InvestmentInput[]) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // BUG FIX: backend expects { investments: [...] }, not a bare array
      const data = await analyzePortfolio({ investments });
      setPortfolioResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portfolio analysis failed");
      setPortfolioResult(null);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    if (m === "single") {
      setPortfolioResult(null);
    } else {
      setResult(null);
      setInputs(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            PropInvest <span className="text-primary-500">AI</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => switchMode("single")}
                className={`rounded-l-lg px-3 py-2 text-sm font-medium ${
                  mode === "single"
                    ? "bg-primary-600 text-white dark:bg-primary-500"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                Single
              </button>
              <button
                onClick={() => switchMode("portfolio")}
                className={`rounded-r-lg px-3 py-2 text-sm font-medium ${
                  mode === "portfolio"
                    ? "bg-primary-600 text-white dark:bg-primary-500"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                Portfolio
              </button>
            </div>

            {result && mode === "single" && (
              <ExportPDF result={result} reportRef={reportRef} />
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {mode === "single"
                  ? "Investment Parameters"
                  : "Portfolio Properties"}
              </h2>

              {mode === "single" ? (
                <InputForm onAnalyze={handleAnalyze} isLoading={loading} />
              ) : (
                <PortfolioForm
                  onAnalyze={handlePortfolioAnalyze}
                  isLoading={loading}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-24 dark:border-slate-700 dark:bg-slate-800">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
                  <p className="mt-4 text-slate-600 dark:text-slate-400">
                    Analyzing…
                  </p>
                </div>
              </div>
            )}

            {!loading && mode === "single" && result && inputs && (
              <SingleResultView
                result={result}
                inputs={inputs}
                reportRef={reportRef}
              />
            )}

            {!loading && mode === "portfolio" && portfolioResult && (
              <PortfolioResultView data={portfolioResult} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SingleResultView({
  result,
  inputs,
  reportRef,
}: {
  result: AnalyzeInvestmentResponse;
  inputs: InvestmentInput;
  reportRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={reportRef} className="space-y-6">
      {/* KPIs */}
      <KPICards metrics={result.metrics} taxAnalysis={result.tax_analysis} />

      {/* Risk */}
      <RiskBadge risk={result.risk} />

      {/* Deal Analysis (V3 - optional) */}
      {result.deal_analysis && (
        <div className="space-y-4">
          <DealScoreBadge deal={result.deal_analysis} />
          <FairValueChart
            deal={result.deal_analysis}
            askingPrice={inputs.property_purchase_price}
          />
          <NegotiationCard deal={result.deal_analysis} />
          <RedFlagsList flags={result.deal_analysis.red_flags} />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Annual Cash Flow Breakdown
          </h3>
          <CashFlowChart
            annualCashFlow={result.metrics.annual_cash_flow}
            emi={result.metrics.emi}
            annualRent={inputs.expected_monthly_rent * 12}
            annualMaintenance={inputs.annual_maintenance_cost}
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Property Growth
          </h3>
          <PropertyGrowthChart
            purchasePrice={inputs.property_purchase_price}
            futureValue={result.metrics.future_property_value}
            holdingPeriodYears={inputs.holding_period_years}
            appreciationRate={inputs.expected_annual_appreciation}
          />
        </div>
      </div>

      {/* Monte Carlo */}
      {result.monte_carlo && (
        <div className="space-y-4">
          <MonteCarloCard data={result.monte_carlo} />
          <div className="grid gap-4 sm:grid-cols-2">
            <IRRDistributionChart data={result.monte_carlo} />
            <ScenarioOutcomeChart data={result.monte_carlo} />
          </div>
          <div className="flex justify-around rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <ProbabilityGauge
              value={result.monte_carlo.probability_beating_fd}
              label="Beats 7% FD"
              subtitle="probability"
            />
            <ProbabilityGauge
              value={result.monte_carlo.probability_negative_cashflow}
              label="Negative Cash Flow"
              subtitle="probability"
            />
          </div>
        </div>
      )}

      {/* Sensitivity */}
      {result.sensitivity && <SensitivityTable data={result.sensitivity} />}

      {/* Stress Test */}
      {result.stress_test && <StressTestCard data={result.stress_test} />}

      {/* Tax Analysis */}
      {result.tax_analysis && <TaxAnalysisCard data={result.tax_analysis} />}

      {/* AI Summary */}
      <AISummary analysis={result.ai_analysis} />
    </div>
  );
}

function PortfolioResultView({ data }: { data: AnalyzePortfolioResponse }) {
  return (
    <div className="space-y-6">
      <PortfolioDashboard data={data} />
    </div>
  );
}
