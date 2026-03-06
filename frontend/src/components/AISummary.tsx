"use client";

import type { AIAnalysis } from "@/types/investment";

interface AISummaryProps {
  analysis: AIAnalysis;
}

const verdictColor: Record<string, string> = {
  "Strong Buy": "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Buy":        "bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/30 dark:text-primary-300",
  "Hold":       "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
  "Avoid":      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300",
};

export function AISummary({ analysis }: AISummaryProps) {
  const verdictClass = verdictColor[analysis.verdict] ?? verdictColor["Hold"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="text-primary-500">✦</span> AI Investment Analysis
        </h3>
        <span className={`rounded-full border px-3 py-1 text-sm font-bold ${verdictClass}`}>
          {analysis.verdict}
        </span>
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{analysis.summary}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {analysis.pros.length > 0 && (
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/15">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Pros</p>
            <ul className="space-y-1">
              {analysis.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-1 text-emerald-500">✓</span>{p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {analysis.cons.length > 0 && (
          <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-900/15">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">Cons</p>
            <ul className="space-y-1">
              {analysis.cons.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-1 text-rose-500">✗</span>{c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {analysis.key_risks.length > 0 && (
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/15">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Key Risks</p>
          <ul className="space-y-1">
            {analysis.key_risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-1 text-amber-500">⚠</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <AICard icon="🏦" title="FD Comparison" content={analysis.fd_comparison} />
        <AICard icon="🎯" title="Recommendation" content={analysis.recommendation} highlight />
        <AICard icon="🚪" title="Exit Strategy" content={analysis.exit_strategy} />
        <AICard icon="💰" title="Rent Optimization" content={analysis.rent_optimization} />
      </div>

      {analysis.negotiation_tip && (
        <AICard icon="🤝" title="Negotiation Tip" content={analysis.negotiation_tip} />
      )}
    </div>
  );
}

function AICard({ icon, title, content, highlight }: { icon: string; title: string; content: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-primary-50 dark:bg-primary-900/20" : "bg-slate-50 dark:bg-slate-700/30"}`}>
      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <span>{icon}</span>{title}
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-300">{content}</p>
    </div>
  );
}
