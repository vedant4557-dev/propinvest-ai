"use client";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Listing {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms: string;
  locality: string;
  city: string;
  developer?: string;
  source: "99acres" | "magicbricks" | "housing";
  sourceUrl: string;
  possession?: string;
  avgRent?: number;
  pricePerSqft?: number;
  imageUrl?: string;
}

interface ListingSearchProps {
  onAnalyze: (inputs: Record<string, number | string>) => void;
}

// ─── City options ─────────────────────────────────────────────────────────────
const CITIES = [
  "Bangalore", "Mumbai", "Hyderabad", "Pune", "Delhi NCR",
  "Chennai", "Kolkata", "Ahmedabad", "Kochi", "Navi Mumbai",
  "Indore", "Jaipur", "Chandigarh", "Surat", "Coimbatore",
  "Nagpur", "Lucknow", "Visakhapatnam", "Mysore", "Nashik",
];

const BHK_OPTIONS = ["Any", "1BHK", "2BHK", "3BHK", "4BHK+"];
const BUDGET_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Under ₹30L", value: "0-3000000" },
  { label: "₹30L–₹60L", value: "3000000-6000000" },
  { label: "₹60L–₹1Cr", value: "6000000-10000000" },
  { label: "₹1Cr–₹2Cr", value: "10000000-20000000" },
  { label: "₹2Cr–₹5Cr", value: "20000000-50000000" },
  { label: "₹5Cr+", value: "50000000-999999999" },
];

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://propinvest-ai-production.up.railway.app";

// ─── Rent estimate by city + BHK ─────────────────────────────────────────────
function estimateRent(city: string, bedrooms: string, area: number): number {
  const base: Record<string, number> = {
    "Mumbai": 55, "Delhi NCR": 40, "Bangalore": 45, "Hyderabad": 38,
    "Pune": 35, "Chennai": 30, "Kolkata": 25, "Ahmedabad": 22,
    "Kochi": 28, "Navi Mumbai": 35, "Indore": 18, "Jaipur": 20,
    "Surat": 22, "Chandigarh": 25, "Coimbatore": 18, "Nagpur": 18,
    "Lucknow": 18, "Visakhapatnam": 22, "Mysore": 18, "Nashik": 18,
  };
  const perSqft = base[city] || 25;
  const bhkMult = bedrooms.includes("1") ? 0.8 : bedrooms.includes("3") ? 1.2 : bedrooms.includes("4") ? 1.5 : 1.0;
  return Math.round((perSqft * area * bhkMult) / 100) * 100;
}

function estimateAppreciation(city: string): number {
  const map: Record<string, number> = {
    "Hyderabad": 10.5, "Bangalore": 9.0, "Pune": 8.5, "Mumbai": 7.5,
    "Delhi NCR": 8.0, "Chennai": 8.0, "Kolkata": 7.0, "Ahmedabad": 7.5,
    "Kochi": 8.0, "Navi Mumbai": 9.0, "Indore": 8.5, "Jaipur": 7.5,
    "Surat": 8.0, "Coimbatore": 7.5,
  };
  return map[city] || 7.5;
}

function stampDuty(city: string): number {
  const map: Record<string, number> = {
    "Mumbai": 6, "Navi Mumbai": 6, "Pune": 6, "Nashik": 6, "Nagpur": 6,
    "Bangalore": 5, "Mysore": 5, "Hyderabad": 4, "Visakhapatnam": 4,
    "Delhi NCR": 6, "Chandigarh": 6, "Lucknow": 6, "Jaipur": 5,
    "Ahmedabad": 4.9, "Surat": 4.9, "Vadodara": 4.9,
    "Chennai": 7, "Coimbatore": 7, "Kolkata": 6, "Kochi": 4, "Guwahati": 5,
  };
  return map[city] || 6;
}

// ─── Source badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: Listing["source"] }) {
  const cfg = {
    "99acres": { bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", label: "99acres" },
    "magicbricks": { bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", label: "MagicBricks" },
    "housing": { bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "Housing.com" },
  }[source];
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg}`}>{cfg.label}</span>;
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ListingSearch({ onAnalyze }: ListingSearchProps) {
  const [city, setCity] = useState("Bangalore");
  const [bhk, setBhk] = useState("Any");
  const [budget, setBudget] = useState("");
  const [keyword, setKeyword] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const params = new URLSearchParams({ city });
      if (bhk !== "Any") params.set("bhk", bhk.replace("BHK", "").replace("+", ""));
      if (budget) { const [min, max] = budget.split("-"); params.set("min_price", min); params.set("max_price", max); }
      if (keyword.trim()) params.set("keyword", keyword.trim());

      const res = await fetch(`${BACKEND}/listings/search?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  function handleAnalyze(l: Listing) {
    setAnalyzingId(l.id);
    const rent = l.avgRent ?? estimateRent(l.city, l.bedrooms, l.area);
    const apprec = estimateAppreciation(l.city);
    const dp = Math.round(l.price * 0.25);
    onAnalyze({
      property_name: l.title,
      city: l.city,
      property_purchase_price: l.price,
      down_payment: dp,
      loan_interest_rate: 8.5,
      loan_tenure_years: 20,
      expected_monthly_rent: rent,
      annual_maintenance_cost: Math.round(l.price * 0.004),
      expected_annual_appreciation: apprec,
      holding_period_years: 8,
      investor_tax_slab: 30,
      vacancy_rate: 5,
      stamp_duty_percent: stampDuty(l.city),
      registration_cost_percent: 1,
      property_area_sqft: l.area,
      rent_growth_rate: 5,
    });
    setTimeout(() => setAnalyzingId(null), 1000);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🔍</span>
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Real Listing Search</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Search live listings from 99acres & MagicBricks · One-click investment analysis</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-sm">
        {/* Row 1 */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="flex-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            value={bhk}
            onChange={e => setBhk(e.target.value)}
            className="w-full sm:w-32 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {BHK_OPTIONS.map(b => <option key={b}>{b}</option>)}
          </select>
          <select
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="w-full sm:w-44 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {BUDGET_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        {/* Row 2 */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Builder / locality / project name (optional)"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="flex-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
          >
            {loading ? (
              <><span className="animate-spin text-base">⟳</span> Searching…</>
            ) : (
              <><span>🔍</span> Search</>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 flex gap-2">
          <span>⚠️</span>
          <div>
            <p className="font-medium">Search failed</p>
            <p className="text-xs opacity-80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
              <div className="h-36 bg-slate-100 dark:bg-slate-700 rounded-xl mb-3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && listings.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🏘️</div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">No listings found</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try different filters or a broader budget range</p>
        </div>
      )}

      {/* Empty state (before search) */}
      {!loading && !searched && (
        <div className="text-center py-14 space-y-3">
          <div className="text-5xl">🏠</div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Search any city for live listings</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mx-auto">
            We pull real listings from 99acres &amp; MagicBricks and auto-populate investment inputs — rent estimate, appreciation, stamp duty, all pre-filled.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {["Prestige Group", "Godrej Properties", "Lodha", "Brigade Group", "Sobha", "Tata Housing"].map(d => (
              <button
                key={d}
                onClick={() => { setKeyword(d); }}
                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results grid */}
      {!loading && listings.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="text-slate-900 dark:text-white font-bold">{listings.length}</span> listings found in {city}
            </p>
            <div className="flex gap-1.5">
              {(["99acres", "magicbricks", "housing"] as const).filter(s => listings.some(l => l.source === s)).map(s => (
                <SourceBadge key={s} source={s} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {listings.map(l => (
              <div
                key={l.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition group flex flex-col"
              >
                {/* Image / placeholder */}
                <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                  {l.imageUrl ? (
                    <img src={l.imageUrl} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl opacity-30">🏢</div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <SourceBadge source={l.source} />
                    {l.possession && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        l.possession === "Ready" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}>
                        {l.possession}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {fmt(l.price)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">{l.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">📍 {l.locality}, {l.city}</p>
                    {l.developer && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">🏗️ {l.developer}</p>}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "BHK", value: l.bedrooms },
                      { label: "Area", value: `${l.area.toLocaleString("en-IN")} sqft` },
                      { label: "₹/sqft", value: l.pricePerSqft ? `₹${l.pricePerSqft.toLocaleString("en-IN")}` : `₹${Math.round(l.price / l.area).toLocaleString("en-IN")}` },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{s.label}</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rent estimate */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400">Est. monthly rent</span>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      {fmt(l.avgRent ?? estimateRent(l.city, l.bedrooms, l.area))}/mo
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleAnalyze(l)}
                      disabled={analyzingId === l.id}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold py-2.5 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {analyzingId === l.id ? (
                        <><span className="animate-spin">⟳</span> Loading…</>
                      ) : (
                        <><span>📊</span> Analyze Investment</>
                      )}
                    </button>
                    <a
                      href={l.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-xs flex items-center gap-1"
                      title="View on source"
                    >
                      🔗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attribution */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
            Listings sourced from 99acres, MagicBricks &amp; Housing.com · Rent estimates are AI-generated · Always verify with the developer
          </p>
        </>
      )}
    </div>
  );
}
