"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
// V3.1 Task 2–10 new components
import { NegotiationPriceCard } from "@/components/NegotiationPriceCard";
import { LoanOptimizationCard } from "@/components/LoanOptimizationCard";
import { RentGrowthCard } from "@/components/RentGrowthCard";
import { VacancyShockCard } from "@/components/VacancyShockCard";
import { ExitOptimizationCard } from "@/components/ExitOptimizationCard";
import { RiskIndexCard } from "@/components/RiskIndexCard";
import { InflationReturnsCard } from "@/components/InflationReturnsCard";
import { ScenarioBuilderCard } from "@/components/ScenarioBuilderCard";
// V3.1 Task 6–15 new components
import { AdvancedMetricsCard } from "@/components/AdvancedMetricsCard";
import { RefinanceCard } from "@/components/RefinanceCard";
import { DealComparisonTable } from "@/components/DealComparisonTable";
// V3.2 — Institutional underwriting features
import { IncomeValuationCard } from "@/components/IncomeValuationCard";
import { AppreciationValidationCard } from "@/components/AppreciationValidationCard";
import { RateStressCard } from "@/components/RateStressCard";
import { YieldSpreadCard } from "@/components/YieldSpreadCard";
import { DealFailureCard } from "@/components/DealFailureCard";
// V3.2 — UX upgrades
import { SmartSummaryBanner } from "@/components/SmartSummaryBanner";
// V3.3 — New features: Renovation, Wealth Builder, AI Memo
import { RenovationValueAddCard } from "@/components/RenovationValueAddCard";
import { WealthBuilderCard } from "@/components/WealthBuilderCard";
import { AIInvestmentMemo } from "@/components/AIInvestmentMemo";
// V3.4 — Startup features: Share URL, Example Deals, Nifty Comparator
import { ShareButton } from "@/components/ShareButton";
import { ExampleDeals } from "@/components/ExampleDeals";
import { NiftyComparatorCard } from "@/components/NiftyComparatorCard";
import { useShareURL } from "@/hooks/useShareURL";
import { analyzeInvestment, analyzePortfolio } from "@/lib/api";
import { useDeals } from "@/hooks/useDeals";
import type {
  InvestmentInput,
  AnalyzeInvestmentResponse,
  AnalyzePortfolioResponse,
} from "@/types/investment";

type Mode = "single" | "portfolio" | "saved";
type Tab = "overview" | "simulation" | "tax" | "deal" | "ai" | "wealth";

const TABS: { id: Tab; label: string; short: string }[] = [
  { id: "overview",   label: "Overview",      short: "Overview" },
  { id: "simulation", label: "Simulation",    short: "Simulate" },
  { id: "deal",       label: "Deal Analysis", short: "Deal" },
  { id: "tax",        label: "Tax & Returns", short: "Tax" },
  { id: "ai",         label: "AI Insights",   short: "AI" },
  { id: "wealth",     label: "🏦 Wealth",     short: "🏦" },
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
  const [showExamples, setShowExamples]   = useState(true);
  const [sharedLoaded, setSharedLoaded]   = useState(false);
  const reportRef                         = useRef<HTMLDivElement | null>(null);
  const { deals, save, remove }           = useDeals();
  const { getSharedInput, clearSharedParam } = useShareURL();

  // Auto-load shared deal from URL on first render
  useEffect(() => {
    if (sharedLoaded) return;
    setSharedLoaded(true);
    const sharedInput = getSharedInput();
    if (sharedInput) {
      clearSharedParam();
      setShowExamples(false);
      handleAnalyze(sharedInput);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async (input: InvestmentInput) => {
    setLoading(true);
    setError(null);
    setPortfolioResult(null);
    setInputs(input);
    setActiveTab("overview");
    setShowExamples(false);
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
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur px-3 py-2.5 sm:px-6 sm:py-3 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white text-xs font-bold flex-shrink-0">P</div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 hidden sm:block">
                PropInvest <span className="text-primary-500">AI</span>
                <span className="ml-1.5 rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">V3.5</span>
              </h1>
            </Link>
            <Link href="/projects" className="hidden lg:block text-xs font-medium text-slate-400 hover:text-primary-500 transition-colors">Projects</Link>
            <Link href="/emi-calculator" className="hidden lg:block text-xs font-medium text-slate-400 hover:text-primary-500 transition-colors">EMI</Link>
          </div>
          {/* Mode switcher */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
            {(["single", "portfolio", "saved"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                title={m === "saved" ? `Saved (${deals.length})` : m}
                className={`py-1.5 text-xs font-medium capitalize transition px-2 sm:px-3 ${
                  mode === m
                    ? "bg-primary-600 text-white dark:bg-primary-500"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <span className="hidden sm:inline">{m === "saved" ? `Saved (${deals.length})` : m}</span>
                <span className="sm:hidden">{m === "single" ? "⊙" : m === "portfolio" ? "⊞" : `★${deals.length}`}</span>
              </button>
            ))}
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {result && mode === "single" && (
              <>
                <button
                  onClick={handleSave}
                  title="Save Deal"
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    saveSuccess
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <span className="hidden sm:inline">{saveSuccess ? "✓ Saved" : "Save"}</span>
                  <span className="sm:hidden">{saveSuccess ? "✓" : "💾"}</span>
                </button>
                <ShareButton inputs={inputs} />
                <span className="hidden sm:block"><ExportPDF result={result} reportRef={reportRef} /></span>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {mode === "saved" ? (
          <div className="space-y-6">
            <SavedDealsPanel deals={deals} onLoad={handleLoadDeal} onRemove={remove} />
            {/* Task 13 — Deal Comparison Table */}
            <DealComparisonTable
              deals={deals}
              onLoad={(deal) => handleLoadDeal(deal.input, deal.result)}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
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
                {/* V3.4 — Example deals (shown when no result yet) */}
                {mode === "single" && (
                  <ExampleDeals
                    isVisible={showExamples && !result && !loading}
                    onSelect={(input) => {
                      setShowExamples(false);
                      handleAnalyze(input);
                    }}
                  />
                )}
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
      {/* V3.2 — Deal-at-a-glance banner */}
      <SmartSummaryBanner
        inputs={inputs}
        metrics={result.metrics}
        taxAnalysis={result.tax_analysis}
        dealScore={result.deal_analysis?.deal_score ?? null}
      />
      <div className="overflow-x-auto -mx-1 px-1 pb-0.5">
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800 min-w-max sm:min-w-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex-shrink-0 sm:flex-1 rounded-lg py-2 px-3 sm:px-2 text-xs font-medium transition whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-primary-600 text-white shadow-sm dark:bg-primary-500"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
              }`}
            >
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          ))}
        </div>
      </div>
      <div ref={reportRef} className="space-y-4">
        {activeTab === "overview"   && <OverviewTab result={result} inputs={inputs} />}
        {activeTab === "simulation" && <SimulationTab result={result} inputs={inputs} />}
        {activeTab === "deal"       && <DealTab result={result} inputs={inputs} />}
        {activeTab === "tax"        && <TaxTab result={result} />}
        {activeTab === "ai"         && <AITab result={result} inputs={inputs} />}
        {activeTab === "wealth"     && <WealthTab result={result} inputs={inputs} />}
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
      {/* V3.2 — Floating Rate Stress (DSCR at +1/+2/+3% rate) */}
      <RateStressCard inputs={inputs} metrics={result.metrics} />
      {/* V3.1 — Vacancy Shock */}
      <VacancyShockCard inputs={inputs} metrics={result.metrics} />
      {/* V3.1 — Scenario Builder */}
      <ScenarioBuilderCard inputs={inputs} metrics={result.metrics} />
      {/* V3.1 — Rent Growth */}
      <RentGrowthCard inputs={inputs} metrics={result.metrics} />
      {/* V3.1 — Loan Optimizer */}
      <LoanOptimizationCard inputs={inputs} metrics={result.metrics} />
      <BenchmarkComparisonCard propertyIRR={result.metrics.irr} />
    </div>
  );
}

function DealTab({ result, inputs }: { result: AnalyzeInvestmentResponse; inputs: InvestmentInput }) {
  return (
    <div className="space-y-4">
      <EnhancedDealScore metrics={result.metrics} dealAnalysis={result.deal_analysis} />

      {/* V3.2 — Income Approach Valuation (cap rate, income fair value) */}
      <IncomeValuationCard inputs={inputs} metrics={result.metrics} />

      {/* V3.2 — Appreciation Assumption Validator */}
      <AppreciationValidationCard inputs={inputs} metrics={result.metrics} />

      {/* V3.2 — Yield Spread vs Market */}
      <YieldSpreadCard inputs={inputs} metrics={result.metrics} />

      {/* V3.1 Tasks 6/7/8 — Advanced Metrics */}
      <AdvancedMetricsCard
        inputs={inputs}
        metrics={result.metrics}
        cashFlowTimeline={result.cash_flow_timeline}
        taxAnalysis={result.tax_analysis}
      />

      {/* Comparable valuation */}
      <ComparableValuationCard
        propertyPrice={inputs.property_purchase_price}
        propertyAreaSqft={inputs.property_area_sqft ?? 0}
        city={inputs.city || ""}
      />

      {/* Liquidity score */}
      <LiquidityScoreCard
        city={inputs.city || ""}
        propertyPrice={inputs.property_purchase_price}
      />

      {/* V3.1 — Risk Index with improvements */}
      <RiskIndexCard inputs={inputs} metrics={result.metrics} />

      {/* V3.1 — Negotiation Price */}
      <NegotiationPriceCard inputs={inputs} metrics={result.metrics} />

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
      {/* V3.1 — Inflation-adjusted returns */}
      <InflationReturnsCard
        nominalIRR={result.metrics.irr}
        nominalROI={result.metrics.roi}
        postTaxIRR={result.tax_analysis?.post_tax_irr}
      />
    </div>
  );
}

function AITab({ result, inputs }: { result: AnalyzeInvestmentResponse; inputs: InvestmentInput }) {
  return (
    <div className="space-y-4">
      <SmartRecommendationCard result={result} input={inputs} />
      {/* V3.2 — Deal Failure Conditions */}
      <DealFailureCard
        inputs={inputs}
        metrics={result.metrics}
        cashFlowTimeline={result.cash_flow_timeline}
        targetIRR={8}
      />
      {/* V3.3 — Renovation Value-Add */}
      <RenovationValueAddCard inputs={inputs} metrics={result.metrics} />
      {/* V3.1 — Exit timing optimizer */}
      <ExitOptimizationCard inputs={inputs} metrics={result.metrics} />
      {/* V3.1 Task 9 — Refinance simulation */}
      <RefinanceCard inputs={inputs} metrics={result.metrics} />
      <AISummary analysis={result.ai_analysis} />
    </div>
  );
}

function WealthTab({ result, inputs }: { result: AnalyzeInvestmentResponse; inputs: InvestmentInput }) {
  return (
    <div className="space-y-4">
      {/* V3.3 — 20-year wealth builder + FIRE projection */}
      <WealthBuilderCard inputs={inputs} metrics={result.metrics} />
      {/* V3.4 — Real estate vs Nifty/MF/FD/Gold comparator */}
      <NiftyComparatorCard inputs={inputs} metrics={result.metrics} taxAnalysis={result.tax_analysis} />
      {/* V3.3 — AI Investment Memo */}
      <AIInvestmentMemo
        inputs={inputs}
        metrics={result.metrics}
        taxAnalysis={result.tax_analysis}
        aiAnalysis={result.ai_analysis}
      />
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
