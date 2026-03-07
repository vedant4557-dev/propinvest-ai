"use client";

import { useState, useRef } from "react";
import { InputForm } from "@/components/InputForm";
import { PortfolioForm } from "@/components/PortfolioForm";
import { SavedDealsPanel } from "@/components/SavedDealsPanel";
import { KPICards } from "@/components/KPICards";
import { RiskBadge } from "@/components/RiskBadge";
import { AISummary } from "@/components/AISummary";
import { CashFlowChart } from "@/components/CashFlowChart";
import { PropertyGrowthChart } from "@/components/PropertyGrowthChart";
import { MonteCarloCard } from "@/components/MonteCarloCard";
import { IRRDistributionChart } from "@/components/IRRDistributionChart";
import { ScenarioOutcomeChart } from "@/components/ScenarioOutcomeChart";
import { ProbabilityGauge } from "@/components/ProbabilityGauge";
import { SensitivityTable } from "@/components/SensitivityTable";
import { TaxAnalysisCard } from "@/components/TaxAnalysisCard";
import { DealScoreBadge } from "@/components/DealScoreBadge";
import { NegotiationCard } from "@/components/NegotiationCard";
import { RedFlagsList } from "@/components/RedFlagsList";
import { FairValueChart } from "@/components/FairValueChart";
import { StressTestCard } from "@/components/StressTestCard";
import { CashFlowTimeline } from "@/components/CashFlowTimeline";
import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportPDF } from "@/components/ExportPDF";
import { MarketBenchmarkCard } from "@/components/MarketBenchmarkCard";
import { ValidationWarnings } from "@/components/ValidationWarnings";
import { LocationScoreCard } from "@/components/LocationScoreCard";
import { BenchmarkComparisonCard } from "@/components/BenchmarkComparisonCard";
import { EnhancedDealScore } from "@/components/EnhancedDealScore";
import { SmartRecommendationCard } from "@/components/SmartRecommendationCard";
// V3.1 new components
import { MarketIntelligenceExtended } from "@/components/MarketIntelligenceExtended";
import { ComparableValuationCard } from "@/components/ComparableValuationCard";
import { LiquidityScoreCard } from "@/components/LiquidityScoreCard";
import { analyzeInvestment, analyzePortfolio } from "@/lib/api";
import { useDeals } from "@/hooks/useDeals";
import type {
  InvestmentInput,
  AnalyzeInvestmentResponse,
  AnalyzePortfolioResponse,
} from "@/types/investment";

type Mode = "single" | "portfolio" | "saved";
type Tab = "overview" | "simulation" | "tax" | "deal" | "ai";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "simulation", label: "Simulation" },
  { id: "deal",       label: "Deal Analysis" },
  { id: "tax",        label: "Tax & Returns" },
  { id: "ai",         label: "AI Insights" },
];

export default function Home() {
  const [mode, setMode]                   = useState<Mode>("single");
  const [activeTab, setActiveTab]         = useState<Tab>("overview");
  const [result, setResult]               = useState<AnalyzeInvestmentResponse | null>(null);
  const [portfolioResult, setPortfolioResult] = useState<AnalyzePortfolioResponse | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [inputs, setInputs]               = useState<InvestmentInput | null>(null);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const reportRef                         = useRef<HTMLDivElement | null>(null);
  const { deals, save, remove }           = useDeals();

  const handleAnalyze = async (input: InvestmentInput) => {
    setLoading(true);
    setError(null);
    setPortfolioResult(null);
    setInputs(input);
    setActiveTab("overview");
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
      const data = await analyzePortfolio({ investments });
      setPortfolioResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portfolio analysis failed");
      setPortfolioResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (result && inputs) {
      save(inputs, result);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleLoadDeal = (input: InvestmentInput, res: AnalyzeInvestmentResponse) => {
    setInputs(input);
    setResult(res);
    setMode("single");
    setActiveTab("overview");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    if (m === "single")    { setPortfolioResult(null); }
    else if (m === "portfolio") { setResult(null); setInputs(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur px-6 py-3 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">P</div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              PropInvest <span className="text-primary-500">AI</span>
              <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">V3.1</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {(["single", "portfolio", "saved"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition ${
                    mode === m
                      ? "bg-primary-600 text-white dark:bg-primary-500"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  {m === "saved" ? `Saved (${deals.length})` : m}
                </button>
              ))}
            </div>
            {result && mode === "single" && (
              <>
                <button
                  onClick={handleSave}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    saveSuccess
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {saveSuccess ? "✓ Saved" : "Save Deal"}
                </button>
                <ExportPDF result={result} reportRef={reportRef} />
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {mode === "saved" ? (
          <SavedDealsPanel deals={deals} onLoad={handleLoadDeal} onRemove={remove} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                      {mode === "single" ? "Investment Parameters" : "Portfolio Properties"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">India market defaults applied</p>
                  </div>
                  <div className="p-5">
                    {mode === "single" ? (
                      <InputForm onAnalyze={handleAnalyze} isLoading={loading} />
                    ) : (
                      <PortfolioForm onAnalyze={handlePortfolioAnalyze} isLoading={loading} />
                    )}
                  </div>
                </div>
                {inputs && mode === "single" && (
                  <ValidationWarnings input={inputs} result={result} />
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              {error && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
                  {error}
                </div>
              )}
              {loading && <LoadingState />}
              {!loading && mode === "single" && result && inputs && (
                <SingleResultView
                  result={result}
                  inputs={inputs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  reportRef={reportRef}
                />
              )}
              {!loading && mode === "portfolio" && portfolioResult && (
                <PortfolioResultView data={portfolioResult} />
              )}
              {!loading && !result && !portfolioResult && !error && (
                <EmptyState mode={mode} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SingleResultView({
  result, inputs, activeTab, onTabChange, reportRef,
}: {
  result: AnalyzeInvestmentResponse;
  inputs: InvestmentInput;
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  reportRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
              activeTab === t.id
                ? "bg-primary-600 text-white shadow-sm dark:bg-primary-500"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div ref={reportRef} className="space-y-4">
        {activeTab === "overview"   && <OverviewTab result={result} inputs={inputs} />}
        {activeTab === "simulation" && <SimulationTab result={result} inputs={inputs} />}
        {activeTab === "deal"       && <DealTab result={result} inputs={inputs} />}
        {activeTab === "tax"        && <TaxTab result={result} />}
        {activeTab === "ai"         && <AITab result={result} inputs={inputs} />}
      </div>
    </div>
  );
}

function OverviewTab({ result, inputs }: { result: AnalyzeInvestmentResponse; inputs: InvestmentInput }) {
  return (
    <div className="space-y-4">
      {/* IRR extreme warning */}
      {result.metrics.irr > 50 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 px-4 py-3 flex items-start gap-2">
          <span className="text-amber-500 text-lg shrink-0">⚡</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Extreme Return — Verify Inputs
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              IRR of {result.metrics.irr.toFixed(1)}% is very high for real estate. Indian property IRR is typically 8–20%. Check rent and appreciation assumptions.
            </p>
          </div>
        </div>
      )}
      <KPICards metrics={result.metrics} taxAnalysis={result.tax_analysis} />
      <RiskBadge risk={result.risk} />
      <MarketBenchmarkCard
        city={inputs.city || ""}
        propertyPrice={inputs.property_purchase_price}
        userRent={inputs.expected_monthly_rent}
        userAppreciation={inputs.expected_annual_appreciation}
      />
      {/* Extended market intelligence: supply/demand, cycle, rental benchmark */}
      <MarketIntelligenceExtended
        city={inputs.city || ""}
        propertyAreaSqft={inputs.property_area_sqft ?? 0}
        monthlyRent={inputs.expected_monthly_rent}
      />
      <LocationScoreCard
        city={inputs.city || "India"}
        rentalYield={result.metrics.net_rental_yield}
        appreciation={inputs.expected_annual_appreciation}
        dscr={result.metrics.dscr}
        irr={result.metrics.irr}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Annual Cash Flow</h3>
          <CashFlowChart
            annualCashFlow={result.metrics.annual_cash_flow}
            emi={result.metrics.emi}
            annualRent={result.metrics.annual_rental_income}
            annualMaintenance={inputs.annual_maintenance_cost}
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Property Growth</h3>
          <PropertyGrowthChart
            purchasePrice={inputs.property_purchase_price}
            futureValue={result.metrics.future_property_value}
            holdingPeriodYears={inputs.holding_period_years}
            appreciationRate={inputs.expected_annual_appreciation}
          />
        </div>
      </div>
      {result.cash_flow_timeline.length > 0 && (
        <CashFlowTimeline data={result.cash_flow_timeline} />
      )}
    </div>
  );
}

function SimulationTab({ result, inputs }: { result: AnalyzeInvestmentResponse; inputs: InvestmentInput }) {
  return (
    <div className="space-y-4">
      {result.monte_carlo && (
        <>
          <MonteCarloCard data={result.monte_carlo} />
          <div className="grid gap-4 sm:grid-cols-2">
            <IRRDistributionChart data={result.monte_carlo} />
            <ScenarioOutcomeChart data={result.monte_carlo} />
          </div>
          <div className="flex justify-around rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <ProbabilityGauge value={result.monte_carlo.probability_beating_fd} label="Beats 7% FD" subtitle="probability" />
            <ProbabilityGauge value={result.monte_carlo.probability_negative_cashflow} label="Negative CF" subtitle="probability" />
          </div>
        </>
      )}
      {result.sensitivity && <SensitivityTable data={result.sensitivity} />}
      {result.stress_test && <StressTestCard data={result.stress_test} />}
      <BenchmarkComparisonCard propertyIRR={result.metrics.irr} />
    </div>
  );
}

function DealTab({ result, inputs }: { result: AnalyzeInvestmentResponse; inputs: InvestmentInput }) {
  return (
    <div className="space-y-4">
      <EnhancedDealScore metrics={result.metrics} dealAnalysis={result.deal_analysis} />

      {/* Comparable valuation — new */}
      <ComparableValuationCard
        propertyPrice={inputs.property_purchase_price}
        propertyAreaSqft={inputs.property_area_sqft ?? 0}
        city={inputs.city || ""}
      />

      {/* Liquidity score — new */}
      <LiquidityScoreCard
        city={inputs.city || ""}
        propertyPrice={inputs.property_purchase_price}
      />

      {result.deal_analysis && (
        <>
          <DealScoreBadge deal={result.deal_analysis} />
          <FairValueChart deal={result.deal_analysis} askingPrice={inputs.property_purchase_price} />
          <NegotiationCard deal={result.deal_analysis} />
          <RedFlagsList flags={result.deal_analysis.red_flags} greenFlags={result.deal_analysis.green_flags} />
        </>
      )}
    </div>
  );
}

function TaxTab({ result }: { result: AnalyzeInvestmentResponse }) {
  return (
    <div className="space-y-4">
      {result.tax_analysis && <TaxAnalysisCard data={result.tax_analysis} />}
    </div>
  );
}

function AITab({ result, inputs }: { result: AnalyzeInvestmentResponse; inputs: InvestmentInput }) {
  return (
    <div className="space-y-4">
      <SmartRecommendationCard result={result} input={inputs} />
      <AISummary analysis={result.ai_analysis} />
    </div>
  );
}

function PortfolioResultView({ data }: { data: AnalyzePortfolioResponse }) {
  return <PortfolioDashboard data={data} />;
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-32 dark:border-slate-700 dark:bg-slate-800">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
        <p className="mt-4 font-medium text-slate-700 dark:text-slate-300">Analyzing investment…</p>
        <p className="mt-1 text-sm text-slate-500">Running Monte Carlo & AI analysis</p>
      </div>
    </div>
  );
}

function EmptyState({ mode }: { mode: Mode }) {
  return (
    <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-24 dark:border-slate-700 dark:bg-slate-800">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30">
          <span className="text-3xl">🏠</span>
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
          {mode === "single" ? "Enter property details to begin" : "Add properties to analyze portfolio"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">Full analysis with AI insights, Monte Carlo & India tax treatment</p>
      </div>
    </div>
  );
}
