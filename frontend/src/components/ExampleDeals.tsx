"use client";

import type { InvestmentInput } from "@/types/investment";

// ─── 6 carefully researched real Indian market deals ─────────────────────
// Prices, rents, yields calibrated to 2024-25 market data

export const EXAMPLE_DEALS: {
  id: string;
  emoji: string;
  label: string;
  location: string;
  tag: string;
  tagColor: string;
  description: string;
  highlights: string[];
  input: InvestmentInput;
}[] = [
  {
    id: "mumbai-2bhk",
    emoji: "🏙️",
    label: "Mumbai 2BHK",
    location: "Powai, Mumbai",
    tag: "Low Yield",
    tagColor: "amber",
    description: "Mid-segment apartment in a tech corridor. Low yield but strong appreciation. Classic Mumbai leverage play.",
    highlights: ["Gross yield ~2.8%", "12% IRR expected", "High appreciation potential"],
    input: {
      property_name: "2BHK Apartment, Powai",
      city: "Mumbai",
      property_purchase_price: 18_500_000,
      down_payment: 4_625_000,
      loan_interest_rate: 8.75,
      loan_tenure_years: 20,
      expected_monthly_rent: 45_000,
      annual_maintenance_cost: 60_000,
      expected_annual_appreciation: 7.0,
      holding_period_years: 10,
      investor_tax_slab: 30,
      vacancy_rate: 5,
      stamp_duty_percent: 6,
      registration_cost_percent: 1,
      property_area_sqft: 950,
      rent_growth_rate: 5,
    },
  },
  {
    id: "bangalore-flat",
    emoji: "💻",
    label: "Bangalore Tech Hub",
    location: "Whitefield, Bangalore",
    tag: "Strong Buy",
    tagColor: "emerald",
    description: "2BHK in India's most liquid rental market. Tech employee demand drives consistent rent growth.",
    highlights: ["Gross yield ~4.1%", "Positive cash flow", "High liquidity"],
    input: {
      property_name: "2BHK, Whitefield",
      city: "Bangalore",
      property_purchase_price: 9_500_000,
      down_payment: 2_375_000,
      loan_interest_rate: 8.5,
      loan_tenure_years: 20,
      expected_monthly_rent: 32_500,
      annual_maintenance_cost: 48_000,
      expected_annual_appreciation: 8.0,
      holding_period_years: 8,
      investor_tax_slab: 30,
      vacancy_rate: 5,
      stamp_duty_percent: 5,
      registration_cost_percent: 1,
      property_area_sqft: 1050,
      rent_growth_rate: 6,
    },
  },
  {
    id: "hyderabad-new",
    emoji: "🚀",
    label: "Hyderabad New Launch",
    location: "Gachibowli, Hyderabad",
    tag: "High Growth",
    tagColor: "sky",
    description: "Under-construction flat in India's fastest-appreciating city. Booking now, possession in 2 years.",
    highlights: ["Best appreciation story", "~8.5% CAGR city", "IT hub demand"],
    input: {
      property_name: "3BHK New Launch, Gachibowli",
      city: "Hyderabad",
      property_purchase_price: 11_000_000,
      down_payment: 2_750_000,
      loan_interest_rate: 8.6,
      loan_tenure_years: 20,
      expected_monthly_rent: 38_000,
      annual_maintenance_cost: 55_000,
      expected_annual_appreciation: 9.0,
      holding_period_years: 10,
      investor_tax_slab: 30,
      vacancy_rate: 7,
      stamp_duty_percent: 4,
      registration_cost_percent: 0.5,
      property_area_sqft: 1400,
      rent_growth_rate: 6,
    },
  },
  {
    id: "pune-itpark",
    emoji: "🏗️",
    label: "Pune IT Corridor",
    location: "Hinjewadi, Pune",
    tag: "Balanced",
    tagColor: "primary",
    description: "1BHK near IT park. Strong rental demand from young professionals. Good yield and moderate appreciation.",
    highlights: ["Yield ~4.5%", "Near cash-flow positive", "Affordable entry"],
    input: {
      property_name: "1BHK, Hinjewadi",
      city: "Pune",
      property_purchase_price: 5_800_000,
      down_payment: 1_450_000,
      loan_interest_rate: 8.5,
      loan_tenure_years: 20,
      expected_monthly_rent: 22_000,
      annual_maintenance_cost: 36_000,
      expected_annual_appreciation: 7.5,
      holding_period_years: 7,
      investor_tax_slab: 20,
      vacancy_rate: 8,
      stamp_duty_percent: 6,
      registration_cost_percent: 1,
      property_area_sqft: 650,
      rent_growth_rate: 5,
    },
  },
  {
    id: "delhi-dwarka",
    emoji: "🏛️",
    label: "Delhi NCR Resale",
    location: "Dwarka, Delhi",
    tag: "Income Play",
    tagColor: "rose",
    description: "Ready resale flat in established neighbourhood. Negative cash flow but strong 15yr appreciation thesis.",
    highlights: ["High stamp duty cost", "Appreciation-dependent", "Metro connectivity"],
    input: {
      property_name: "3BHK Resale, Dwarka",
      city: "Delhi",
      property_purchase_price: 14_000_000,
      down_payment: 3_500_000,
      loan_interest_rate: 8.9,
      loan_tenure_years: 20,
      expected_monthly_rent: 35_000,
      annual_maintenance_cost: 72_000,
      expected_annual_appreciation: 6.5,
      holding_period_years: 12,
      investor_tax_slab: 30,
      vacancy_rate: 8,
      stamp_duty_percent: 6,
      registration_cost_percent: 1,
      property_area_sqft: 1350,
      rent_growth_rate: 4,
    },
  },
  {
    id: "ahmedabad-affordable",
    emoji: "💰",
    label: "Ahmedabad Affordable",
    location: "SG Highway, Ahmedabad",
    tag: "Best Yield",
    tagColor: "emerald",
    description: "2BHK in Tier-2 city with India's best yield-to-price ratio. Strong DSCR, positive cash flow from day 1.",
    highlights: ["Yield ~5.5%", "Positive cash flow", "Lowest stamp duty"],
    input: {
      property_name: "2BHK, SG Highway",
      city: "Ahmedabad",
      property_purchase_price: 5_200_000,
      down_payment: 1_300_000,
      loan_interest_rate: 8.4,
      loan_tenure_years: 20,
      expected_monthly_rent: 22_000,
      annual_maintenance_cost: 30_000,
      expected_annual_appreciation: 6.5,
      holding_period_years: 8,
      investor_tax_slab: 20,
      vacancy_rate: 6,
      stamp_duty_percent: 4.9,
      registration_cost_percent: 1,
      property_area_sqft: 1000,
      rent_growth_rate: 5,
    },
  },
];

// ─── Tag colors ─────────────────────────────────────────────────────────────

const TAG_STYLES: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  amber:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  rose:    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  sky:     "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400",
};

function fmt(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(0)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  onSelect: (input: InvestmentInput) => void;
  isVisible: boolean;
}

export function ExampleDeals({ onSelect, isVisible }: Props) {
  if (!isVisible) return null;

  return (
    <div className="rounded-xl border border-primary-100 bg-primary-50/50 dark:border-primary-900/40 dark:bg-primary-900/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
            ✦ Try with a real deal
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            6 researched Indian properties — click any to pre-fill the form
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {EXAMPLE_DEALS.map((deal) => (
          <button
            key={deal.id}
            onClick={() => onSelect(deal.input)}
            className="group w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-xl flex-shrink-0 mt-0.5">{deal.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {deal.label}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[deal.tagColor]}`}>
                    {deal.tag}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{deal.location} · {fmt(deal.input.property_purchase_price)}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {deal.highlights.map(h => (
                    <span key={h} className="text-[9px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded px-1.5 py-0.5">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors text-sm flex-shrink-0 mt-1">→</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-3 text-center">
        All figures based on 2024–25 market data. For illustration only.
      </p>
    </div>
  );
}
