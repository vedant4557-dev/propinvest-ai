"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug } from "@/data/projects";
import { useShareURL } from "@/hooks/useShareURL";

// We encode the project input as a share URL param and redirect to /app
// This gives each project its own SEO-indexable URL that auto-runs the analysis

function fmt(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(0)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

interface Props {
  params: { slug: string };
}

export default function ProjectPage({ params }: Props) {
  const project = getProjectBySlug(params.slug);
  const { getShareURL } = useShareURL();
  const router = useRouter();

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🏚️</p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Project not found</h1>
          <Link href="/projects" className="text-primary-500 hover:underline text-sm">← Back to all projects</Link>
        </div>
      </div>
    );
  }

  const analyseURL = getShareURL(project.input).replace(window?.location?.origin ?? "", "").replace("/projects/" + params.slug, "/app");

  const handleAnalyse = () => {
    const url = getShareURL(project.input);
    const appUrl = url.replace(window.location.origin, "").replace(window.location.pathname, "/app");
    router.push(appUrl);
  };

  const POSSESSION_COLORS: Record<string, string> = {
    "Ready":               "bg-emerald-100 text-emerald-700",
    "Under Construction":  "bg-amber-100 text-amber-700",
    "New Launch":          "bg-sky-100 text-sky-700",
  };

  const grossYield = ((project.avgRent * 12) / project.input.property_purchase_price * 100).toFixed(1);
  const ltv = Math.round((1 - project.input.down_payment / project.input.property_purchase_price) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur px-6 py-3 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white text-xs font-bold">P</div>
              <span className="font-bold text-slate-900 dark:text-slate-100">PropInvest AI</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/projects" className="text-slate-500 hover:text-primary-500">Projects</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{project.name}</span>
          </div>
          <button
            onClick={handleAnalyse}
            className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            Run Full Analysis →
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        {/* Project hero */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${POSSESSION_COLORS[project.possession]}`}>
                  {project.possession}
                </span>
                <span className="text-xs text-slate-400">{project.type}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{project.developer}</span>
                {" · "}{project.locality}, {project.city}, {project.state}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.tags.map(t => (
                  <span key={t} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-xs text-slate-400">Price Range</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {fmt(project.priceMin)}–{fmt(project.priceMax)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{project.bedrooms} · {project.areaMin}–{project.areaMax} sqft</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-4">
            {project.highlight}
          </p>
        </div>

        {/* Quick financials */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Avg Monthly Rent",     value: `${fmt(project.avgRent)}/mo`,        sub: `${fmt(project.avgRent * 12)}/yr` },
            { label: "Gross Rental Yield",   value: `${grossYield}%`,                    sub: "at midpoint price" },
            { label: "Appreciation Tier",    value: project.appreciationTier,            sub: `${project.input.expected_annual_appreciation}% assumed/yr` },
            { label: "Typical LTV",          value: `${ltv}%`,                           sub: `${fmt(project.input.down_payment)} down payment` },
          ].map(m => (
            <div key={m.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{m.label}</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{m.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Pre-filled analysis preview */}
        <div className="rounded-2xl border border-primary-200 dark:border-primary-800/40 bg-primary-50/50 dark:bg-primary-900/10 p-5 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">Pre-filled Investment Analysis</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Based on typical {project.bedrooms} in {project.locality}. Click below to run full analysis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 text-xs">
            {[
              { l: "Purchase Price",       v: fmt(project.input.property_purchase_price) },
              { l: "Down Payment",         v: fmt(project.input.down_payment) },
              { l: "Loan Amount",          v: fmt(project.input.property_purchase_price - project.input.down_payment) },
              { l: "Interest Rate",        v: `${project.input.loan_interest_rate}%` },
              { l: "Monthly Rent",         v: fmt(project.input.expected_monthly_rent) },
              { l: "Appreciation",         v: `${project.input.expected_annual_appreciation}%/yr` },
              { l: "Holding Period",       v: `${project.input.holding_period_years} years` },
              { l: "Vacancy Rate",         v: `${project.input.vacancy_rate}%` },
              { l: "Stamp Duty",           v: `${project.input.stamp_duty_percent}%` },
            ].map(item => (
              <div key={item.l} className="flex justify-between rounded-lg bg-white dark:bg-slate-800 px-3 py-2 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">{item.l}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.v}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyse}
            className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
          >
            <span>✦</span>
            Run Full Analysis — IRR · DSCR · Monte Carlo · Tax · Stress Tests
            <span>→</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Free · No sign-up · All 18+ metrics computed in under 3 seconds
          </p>
        </div>

        {/* Back link */}
        <div className="flex items-center justify-between">
          <Link href="/projects" className="text-sm text-primary-500 hover:text-primary-600 hover:underline">
            ← Back to all projects
          </Link>
          <Link href={`/projects?city=${encodeURIComponent(project.city)}`} className="text-sm text-slate-400 hover:text-primary-500">
            More projects in {project.city} →
          </Link>
        </div>
      </main>
    </div>
  );
}
