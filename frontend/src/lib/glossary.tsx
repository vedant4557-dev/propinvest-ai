"use client";

import { useState, useRef, useEffect } from "react";

// ─── Reusable Tooltip Component ──────────────────────────────────────────────

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  /** Show the ⓘ icon automatically when no children are passed */
  icon?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  maxWidth?: number;
}

export function Tooltip({ content, children, icon = true, position = "top", maxWidth = 280 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 100);
  };
  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), 80);
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <span className="relative inline-flex items-center" ref={ref}
      onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children ?? (
        <span className="inline-flex items-center justify-center ml-1 cursor-help text-slate-300 hover:text-primary-400 dark:text-slate-600 dark:hover:text-primary-400 transition-colors text-[11px] align-middle leading-none select-none" aria-label="More info">
          ⓘ
        </span>
      )}

      {visible && (
        <span
          role="tooltip"
          style={{ maxWidth }}
          className={`
            absolute z-50 pointer-events-none
            px-3 py-2 rounded-xl text-xs leading-relaxed font-normal
            bg-slate-900 text-slate-100 dark:bg-slate-700 dark:text-slate-100
            shadow-xl border border-slate-700/50 dark:border-slate-600/50
            whitespace-normal text-left
            ${position === "top"    ? "bottom-full left-1/2 -translate-x-1/2 mb-2"  : ""}
            ${position === "bottom" ? "top-full left-1/2 -translate-x-1/2 mt-2"     : ""}
            ${position === "left"   ? "right-full top-1/2 -translate-y-1/2 mr-2"    : ""}
            ${position === "right"  ? "left-full top-1/2 -translate-y-1/2 ml-2"     : ""}
            animate-in fade-in zoom-in-95 duration-100
          `}
        >
          {/* Arrow */}
          <span className={`
            absolute w-0 h-0 border-solid
            ${position === "top"    ? "top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900 dark:border-t-slate-700" : ""}
            ${position === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-slate-900 dark:border-b-slate-700" : ""}
            ${position === "left"   ? "left-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-slate-900 dark:border-l-slate-700" : ""}
            ${position === "right"  ? "right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-slate-700" : ""}
          `} />
          {content}
        </span>
      )}
    </span>
  );
}

// ─── Label + Tooltip composite ───────────────────────────────────────────────

export function LabelWithTip({ label, tip, className = "" }: { label: string; tip: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {label}
      <Tooltip content={tip} />
    </span>
  );
}

// ─── Master Glossary ─────────────────────────────────────────────────────────
// Single source of truth for all financial term definitions used across the app.

export const GLOSSARY: Record<string, string> = {

  // ── Core Returns ────────────────────────────────────────────────────────────
  IRR: "Internal Rate of Return — the annualised growth rate of your investment including rental income and property appreciation. Higher is better. Indian real estate typically delivers 8–18% IRR.",

  "Pre-Tax IRR": "IRR calculated before deducting income tax on rent and capital gains tax on sale. This is the gross return before India's tax treatment is applied.",

  "Post-Tax IRR": "IRR after deducting income tax on rental income and LTCG tax on the sale profit. This is your real, take-home return. Always compare this with FD rates.",

  ROI: "Return on Investment — total profit as a percentage of total money invested (down payment + acquisition costs). Measures overall profitability across the full holding period.",

  NPV: "Net Present Value — today's worth of all future cash flows from this property, discounted at 10%. If NPV > 0, this investment creates wealth over a 10% hurdle rate. If NPV < 0, you'd do better putting the money in a 10% investment.",

  "Cash-on-Cash Return": "Annual rental cash flow divided by your equity invested (down payment + costs). Tells you how much cash income you earn per rupee of cash you put in — before property appreciation. A 4% CoC means ₹4 income per ₹100 invested.",

  "Equity Multiple": "Total cash returned to you ÷ equity invested. An equity multiple of 2.5x means you got back ₹2.50 for every ₹1.00 you put in over the holding period, including rent and sale proceeds.",

  // ── Yield Metrics ───────────────────────────────────────────────────────────
  "Gross Yield": "Annual rent ÷ property price, as a percentage. This is the raw rental income return before deducting vacancy, maintenance, or taxes. E.g. ₹4.2L rent on a ₹1Cr property = 4.2% gross yield.",

  "Net Yield": "Annual rent minus vacancy and maintenance costs, divided by property price. This is the actual income return after operational costs — more accurate than gross yield.",

  "Cap Rate": "Capitalisation Rate = Net Operating Income ÷ Property Price. The income return you'd earn if you bought the property entirely in cash (no loan). Higher cap rate = better income value. Indian residential benchmark: 3–5%.",

  "Yield Spread": "The difference between your property's yield and a benchmark rate (market average, G-Sec, or FD). A positive spread means the property out-yields the benchmark.",

  "Market Yield": "The typical rental yield for similar properties in your city. Used as a benchmark to assess if your property is priced attractively or expensively relative to its income.",

  // ── Debt & Cash Flow ────────────────────────────────────────────────────────
  EMI: "Equated Monthly Instalment — your fixed monthly loan repayment, covering both principal (loan reduction) and interest. Indian home loans are typically floating-rate, so EMI can change when RBI adjusts rates.",

  DSCR: "Debt Service Coverage Ratio = Annual Rental Income ÷ Annual EMI. A DSCR of 1.2x means your rent is 1.2× your loan payment — you have 20% buffer. Below 1.0x means rent doesn't fully cover the EMI.",

  "Annual Cash Flow": "Rental income minus EMI and maintenance costs for the full year. Positive = the property puts money in your pocket. Negative = you need to top up from your savings each year.",

  "Monthly Cash Flow": "The same as Annual Cash Flow but per month. Negative monthly cash flow is common at high LTV — the property is appreciating but costing you money monthly.",

  NOI: "Net Operating Income = Annual Rent × (1 − Vacancy Rate) − Annual Maintenance. This is the income the property generates from operations, before loan payments. Used in cap rate calculations.",

  LTV: "Loan-to-Value ratio = Loan Amount ÷ Property Price. An LTV of 80% means you borrowed 80% and paid 20% yourself. Higher LTV = more leverage = higher equity return but also higher risk.",

  "Loan Amount": "The total amount borrowed from the bank. Calculated as Property Price minus Down Payment.",

  // ── Valuation ───────────────────────────────────────────────────────────────
  "Income Fair Value": "What this property would be worth if it were priced at the market cap rate — based purely on its income. Formula: NOI ÷ Market Cap Rate. If the asking price is above this, you're paying a premium for expected appreciation.",

  "Entry Cap Rate": "The cap rate implied by the price you're paying: NOI ÷ Purchase Price. If your entry cap rate is 2.5% and the market cap rate is 4.5%, you're buying at a significant income premium — returns must come from appreciation.",

  "Market Cap Rate": "The average cap rate for similar properties in your city. Derived from reported transaction data and rental surveys. Tier 1 cities: 3–4.5%. Tier 2: 4–5.5%. Tier 3: 5–6.5%.",

  "Price per Sqft": "Property price divided by area in square feet. Used to compare similar properties. Check this against city benchmarks — a large deviation suggests over- or under-pricing.",

  "Comparable Valuation": "An estimate of fair value based on recent sale prices of similar properties (comps) in the same area. Used alongside income valuation to triangulate a reasonable price range.",

  "Underpriced": "The property's asking price is significantly below what comparable sales or income analysis suggests it's worth. This may represent a buying opportunity.",

  "Overpriced": "The asking price is above income-derived value or comparable sales, meaning you're paying a premium. Returns will depend heavily on continued appreciation.",

  // ── Risk Metrics ────────────────────────────────────────────────────────────
  "Break-Even Occupancy": "The minimum percentage of time the property must be rented to cover EMI and maintenance. If break-even is 85%, the property must be occupied 85% of the year (≈10.2 months) to avoid cash shortfall.",

  Vacancy: "The percentage of time a property sits empty with no rent. Indian residential average: 5–10%. High vacancy (>15%) significantly damages returns.",

  "Vacancy Rate": "Same as Vacancy — the assumed percentage of the year the property will not be rented out.",

  "Risk Score": "A composite score (0–100) measuring how risky this investment is based on DSCR, cash flow, LTV, appreciation assumptions, yield, and vacancy. Higher score = lower risk.",

  "Fragility Score": "How close each key assumption is to its failure threshold. A fragile deal fails if even one assumption (appreciation, rate, vacancy) moves modestly against you.",

  "Stress Test": "What happens to your IRR if one thing goes badly wrong — rates rise, rents fall, or the property doesn't appreciate. Shows downside resilience.",

  "Sensitivity Analysis": "How much your IRR changes when key inputs change by a fixed amount. A 1% change in appreciation causing a 3pp IRR swing means the deal is highly sensitive to that variable.",

  // ── Market & Macro ──────────────────────────────────────────────────────────
  "Monte Carlo": "A simulation that runs thousands of random scenarios (different appreciation rates, rent growth, vacancies) to show the full distribution of possible outcomes — not just one projection.",

  "VaR (5%)": "Value at Risk — the IRR you'd expect in the worst 5% of scenarios from the Monte Carlo simulation. If VaR is −2%, there's a 5% chance your IRR is worse than −2%.",

  "Market Cycle": "Real estate moves in cycles: Recovery → Growth → Peak → Correction. Buying at the right cycle stage can add or subtract 3–5pp from your IRR. This tool estimates where your city is today.",

  "G-Sec Rate": "Government Securities yield — the return on 10-year Indian government bonds (~7.1%). This is the risk-free rate: the minimum return a rational investor should demand before taking on property risk.",

  Appreciation: "The annual increase in property value, expressed as a percentage. Indian residential property historically appreciates 5–8%/year in Tier 1 cities, but varies significantly by location and market cycle.",

  // ── Tax ─────────────────────────────────────────────────────────────────────
  "Sec 24(b)": "Section 24(b) of the Income Tax Act allows deduction of home loan interest from taxable income — up to ₹2L/year for self-occupied, fully deductible for let-out property.",

  "LTCG": "Long-Term Capital Gains tax on property sold after 2+ years. As of FY2024, LTCG on property is taxed at 12.5% without indexation benefit, or 20% with indexation (whichever is lower). This applies to the profit on sale.",

  Indexation: "A tax benefit that adjusts the original property cost for inflation (using the Cost Inflation Index). This reduces your taxable capital gains, lowering your LTCG tax bill.",

  "Indexed Cost": "Purchase price adjusted for inflation using government indexation tables. Used to compute real capital gains for LTCG tax purposes.",

  "Stamp Duty": "A state tax paid when buying property, typically 5–8% of property value in India. It is paid to the state government and must be registered. This is a sunk cost — not recoverable.",

  "Registration Cost": "Fee paid to register the property sale in your name at the Sub-Registrar's office. Typically 1% of property value. Legally required to establish ownership.",

  "Total Acquisition Cost": "Full amount spent to acquire the property: Purchase Price + Stamp Duty + Registration + any other charges. This is your true entry cost, not just the sale price.",

  "Tax Slab": "Your income tax bracket under India's income tax system. Rental income is added to your total income and taxed at your applicable slab rate (5%, 20%, or 30% + cess).",

  // ── Advanced ────────────────────────────────────────────────────────────────
  "Levered IRR": "IRR calculated using your actual equity invested (with the loan). The loan amplifies returns through leverage — you control a larger asset with less capital. This is the standard IRR shown in the product.",

  "Unlevered IRR": "IRR if you had bought the property entirely in cash with no loan. Shows the property's underlying return independent of financing. If levered IRR > unlevered IRR, leverage is working in your favour.",

  "Leverage Effect": "The difference between levered and unlevered IRR. Positive leverage effect means taking a loan improved your return. Negative means the loan's interest cost exceeds the property's income return.",

  "Payback Period": "The number of years until your cumulative rental cash flows recover your initial equity investment. Does not count appreciation — only income. A payback of 12 years means income alone takes 12 years to return your down payment.",

  "Equity Built": "The portion of the property you own outright — property value minus remaining loan balance. Grows over time as the loan is repaid and the property appreciates.",

  "Capital Gains": "The profit made when you sell the property: Sale Price minus Original Purchase Price (and in some calculations, minus acquisition costs).",

  "Future Value": "The estimated property value at your planned exit date, based on the appreciation rate you entered.",

  "Holding Period": "The number of years you plan to own the property before selling. Longer holding periods typically improve returns by compounding appreciation.",

  "Exit Costs": "Costs incurred when selling the property — brokerage (typically 2%) and legal/registration fees (1%). These reduce your net sale proceeds and are included in IRR calculations.",

  "Refinancing": "Replacing your existing home loan with a new loan — typically at a lower rate or to extract equity (cash-out). Cash-out refinancing lets you withdraw appreciation gains without selling.",

  "Cash-Out Refinance": "Taking a new, larger loan against your appreciated property to receive cash. E.g. property appreciated from ₹1Cr to ₹1.5Cr — you can refinance at 70% LTV to receive ₹1.05Cr vs original ₹80L loan, getting ₹25L cash.",

  "Liquidity Score": "How easily this property can be converted to cash (sold). High liquidity = sells quickly with minimal price discount. Affected by city, price tier, and market conditions.",

  "Deal Score": "A composite score (0–100) rating overall investment quality. Combines IRR, yield, DSCR, location, risk, and market factors. 70+ = good deal, 85+ = excellent.",

  "Negotiation Buffer": "The gap between asking price and estimated fair value — how much you could potentially negotiate the price down based on comparable sales and income analysis.",

  "Inflation-Adjusted Return": "Your real IRR after stripping out the effect of inflation. If nominal IRR is 12% and inflation is 5%, real IRR ≈ 7%. This is what your investment actually earns in purchasing power.",

  "CAGR": "Compound Annual Growth Rate — the year-over-year growth rate that, if applied consistently, produces the total return over a period. Appreciation CAGR is the annualised price growth.",

  "LTV Ratio": "Loan-to-Value = Loan ÷ Property Value. Banks typically lend up to 75–80% LTV for residential property. Higher LTV = more leverage, more risk.",

  // ── Input-specific ─────────────────────────────────────────────────────────
  "Down Payment": "The portion of the property price you pay upfront from your own funds. Minimum 20% for most Indian banks. A larger down payment reduces EMI but also reduces leverage.",

  "Loan Tenure": "The duration of your home loan in years. Longer tenure = lower EMI but more total interest paid. Typical Indian home loans: 15–25 years.",

  "Interest Rate": "The annual rate charged by your bank on the home loan. Most Indian home loans are floating-rate — they can rise or fall with RBI repo rate changes.",

  "Rent Growth Rate": "The annual percentage increase in rental income. Over time, rent typically grows with inflation and local market demand. Indian residential rents historically grow 4–7% per year.",

  "Annual Maintenance": "Yearly costs to maintain the property: society maintenance charges, repair fund, property tax. Typically ₹1,000–2,500/sqft/year for apartment buildings.",
};

// ─── Term lookup helper ───────────────────────────────────────────────────────

export function getTooltip(term: string): string | undefined {
  return GLOSSARY[term] ?? GLOSSARY[term.replace(/-/g, " ")] ?? undefined;
}
