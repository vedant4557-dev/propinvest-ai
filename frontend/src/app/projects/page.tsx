"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import projects, { CITIES, DEVELOPERS, filterProjects } from "@/data/projects";
import type { PossessionStatus, AppreciationTier } from "@/data/projects";

function fmt(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(0)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

const POSSESSION_COLORS: Record<PossessionStatus, string> = {
  "Ready":               "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Under Construction":  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "New Launch":          "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

const TIER_COLORS: Record<AppreciationTier, string> = {
  "High":   "text-emerald-600 dark:text-emerald-400",
  "Medium": "text-amber-600 dark:text-amber-400",
  "Low":    "text-rose-600 dark:text-rose-400",
};

const CITY_EMOJIS: Record<string, string> = {
  "Mumbai": "🏙️", "Bangalore": "💻", "Hyderabad": "🚀",
  "Pune": "🏗️", "Delhi NCR": "🏛️", "Ahmedabad": "💰",
};

export default function ProjectsPage() {
  const [query, setQuery]         = useState("");
  const [city, setCity]           = useState("");
  const [developer, setDeveloper] = useState("");
  const [possession, setPossession] = useState<PossessionStatus | "">("");
  const [tier, setTier]           = useState<AppreciationTier | "">("");
  const [sort, setSort]           = useState<"price-asc" | "price-desc" | "name">("name");

  const filtered = useMemo(() => {
    let results = filterProjects({ city: city || undefined, developer: developer || undefined, query: query || undefined, possession: (possession as PossessionStatus) || undefined, appreciationTier: (tier as AppreciationTier) || undefined });
    if (sort === "price-asc")  results = [...results].sort((a, b) => a.priceMin - b.priceMin);
    if (sort === "price-desc") results = [...results].sort((a, b) => b.priceMax - a.priceMax);
    if (sort === "name")       results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    return results;
  }, [query, city, developer, possession, tier, sort]);

  const cityGroups = useMemo(() =>
    CITIES.map(c => ({ city: c, count: projects.filter(p => p.city === c).length })),
  []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur px-6 py-3 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">P</div>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">PropInvest <span className="text-primary-500">AI</span></span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-sm font-medium text-slate-500">Project Database</span>
          </div>
          <Link href="/app" className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 transition-colors">
            Analyse a Property →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Indian Real Estate Project Database
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {projects.length} projects · {CITIES.length} cities · {DEVELOPERS.length} developers — click any project to run a full investment analysis
          </p>
        </div>

        {/* City quick filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCity("")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              city === ""
                ? "bg-primary-600 text-white"
                : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            All Cities <span className="opacity-70 text-xs">{projects.length}</span>
          </button>
          {cityGroups.map(g => (
            <button
              key={g.city}
              onClick={() => setCity(city === g.city ? "" : g.city)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                city === g.city
                  ? "bg-primary-600 text-white"
                  : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {CITY_EMOJIS[g.city]} {g.city} <span className="opacity-70 text-xs">{g.count}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4 sticky top-20">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Filters</h2>

              {/* Search */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Search</label>
                <input
                  type="text"
                  placeholder="Project, developer, locality…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              {/* Developer */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Developer</label>
                <select value={developer} onChange={e => setDeveloper(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                  <option value="">All Developers</option>
                  {DEVELOPERS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Possession */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                <select value={possession} onChange={e => setPossession(e.target.value as PossessionStatus | "")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                  <option value="">Any Status</option>
                  <option value="Ready">Ready to Move</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="New Launch">New Launch</option>
                </select>
              </div>

              {/* Appreciation tier */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Growth Potential</label>
                <select value={tier} onChange={e => setTier(e.target.value as AppreciationTier | "")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                  <option value="">Any Tier</option>
                  <option value="High">High Growth</option>
                  <option value="Medium">Medium Growth</option>
                  <option value="Low">Low Growth</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Sort By</label>
                <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                  <option value="name">Name</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Reset */}
              {(city || developer || query || possession || tier) && (
                <button
                  onClick={() => { setCity(""); setDeveloper(""); setQuery(""); setPossession(""); setTier(""); }}
                  className="w-full rounded-lg border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 py-2 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Project grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span> projects
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-16 text-center">
                <p className="text-slate-500">No projects match your filters.</p>
                <button onClick={() => { setCity(""); setDeveloper(""); setQuery(""); setPossession(""); setTier(""); }}
                  className="mt-3 text-sm text-primary-500 hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map(project => (
                  <Link
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{project.developer}</p>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                          {project.name}
                        </h3>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ml-2 flex-shrink-0 ${POSSESSION_COLORS[project.possession]}`}>
                        {project.possession}
                      </span>
                    </div>

                    {/* Location */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {CITY_EMOJIS[project.city]} {project.locality}, {project.city} · {project.bedrooms}
                    </p>

                    {/* Price and rent */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 px-2.5 py-2">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Price Range</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                          {fmt(project.priceMin)}–{fmt(project.priceMax)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 px-2.5 py-2">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Avg Rent</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                          {fmt(project.avgRent)}/mo
                        </p>
                      </div>
                    </div>

                    {/* Appreciation tier + tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-bold ${TIER_COLORS[project.appreciationTier]}`}>
                        ● {project.appreciationTier} Growth
                      </span>
                      {project.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded px-1.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 truncate pr-2">{project.highlight}</p>
                      <span className="text-primary-500 text-xs font-bold flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        Analyse →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
