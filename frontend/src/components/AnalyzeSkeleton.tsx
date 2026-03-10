"use client";
// src/components/AnalyzeSkeleton.tsx
// Loading skeleton shown while /analyze-investment is in flight
// Usage: {loading && <AnalyzeSkeleton />}

export default function AnalyzeSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Verdict banner */}
      <div className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />

      {/* 4-metric row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 space-y-2">
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* 4-metric row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 space-y-2">
            <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />

      {/* Text lines */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-4/6 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}
