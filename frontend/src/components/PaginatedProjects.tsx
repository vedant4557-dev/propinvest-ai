"use client";
// src/components/PaginatedProjects.tsx
// Replaces the full 337-project list dump with paginated 12-at-a-time view
// Self-contained — pass in your projects array, handles pagination internally

import { useState, useMemo } from "react";

const PAGE_SIZE = 12;

interface Project {
  id: string | number;
  name: string;
  city: string;
  price?: number;
  pricePerSqft?: number;
  type?: string;
  tags?: string[];
  [key: string]: unknown;
}

interface PaginatedProjectsProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  renderCard: (project: Project) => React.ReactNode;
  emptyMessage?: string;
}

export default function PaginatedProjects({
  projects,
  renderCard,
  emptyMessage = "No projects found",
}: PaginatedProjectsProps) {
  const [page, setPage] = useState(1);
  const [cityFilter, setCityFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Get unique cities
  const cities = useMemo(() => {
    const c = Array.from(new Set(projects.map((p) => p.city))).sort();
    return ["All", ...c];
  }, [projects]);

  // Filter projects
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchCity = cityFilter === "All" || p.city === cityFilter;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase());
      return matchCity && matchSearch;
    });
  }, [projects, cityFilter, search]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;
  const total = filtered.length;

  function handleFilterChange(city: string) {
    setCityFilter(city);
    setPage(1);
  }

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects or cities..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
              focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700
            bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
            focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {Math.min(visible.length, total)} of {total} projects
        {cityFilter !== "All" && ` in ${cityFilter}`}
        {search && ` matching "${search}"`}
      </p>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-2">🏘️</p>
          <p className="font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((project) => renderCard(project))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
              text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl
              hover:bg-green-50 hover:border-green-300 hover:text-green-700
              dark:hover:bg-green-950 dark:hover:border-green-700 dark:hover:text-green-400
              transition-colors"
          >
            Load more ({filtered.length - visible.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
