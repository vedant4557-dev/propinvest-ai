"use client";

import type { AIAnalysis } from "@/types/investment";

interface AISummaryProps {
  analysis: AIAnalysis;
}

export function AISummary({ analysis }: AISummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span className="text-primary-500">AI</span> Investment Analysis
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Verdict
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {analysis.verdict}
          </p>
        </div>
        <p className="text-slate-700 dark:text-slate-300">{analysis.summary}</p>
        {analysis.pros.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Pros
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {analysis.pros.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {analysis.cons.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Cons
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {analysis.cons.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            FD Comparison (7%)
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {analysis.fd_comparison}
          </p>
        </div>
        <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
          <p className="text-sm font-medium text-primary-800 dark:text-primary-200">
            Recommendation
          </p>
          <p className="mt-1 text-slate-800 dark:text-slate-200">
            {analysis.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
