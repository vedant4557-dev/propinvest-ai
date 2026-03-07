"use client";

import { useMemo } from "react";
import { validateInvestmentInput, type ValidationWarning } from "@/lib/validationEngine";
import type { InvestmentInput, AnalyzeInvestmentResponse } from "@/types/investment";

interface Props {
  input: InvestmentInput;
  result?: AnalyzeInvestmentResponse | null;
}

type Severity = "danger" | "warning" | "info";

const severityConfig: Record<Severity, { bg: string; border: string; text: string; icon: string }> = {
  danger: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-800 dark:text-rose-300",
    icon: "🚨",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-300",
    icon: "⚠️",
  },
  info: {
    bg: "bg-sky-50 dark:bg-sky-900/20",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-800 dark:text-sky-300",
    icon: "ℹ️",
  },
};

function mapSeverity(s: string): Severity {
  if (s === "high" || s === "danger") return "danger";
  if (s === "medium" || s === "warning") return "warning";
  return "info";
}

function WarningRow({ message, severity, suggestion }: { message: string; severity: Severity; suggestion?: string }) {
  const cfg = severityConfig[severity];
  return (
    <div className={`flex gap-2 rounded-lg border p-2.5 ${cfg.bg} ${cfg.border}`}>
      <span className="text-sm mt-0.5 shrink-0">{cfg.icon}</span>
      <div>
        <p className={`text-xs font-medium ${cfg.text}`}>{message}</p>
        {suggestion && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">💡 {suggestion}</p>
        )}
      </div>
    </div>
  );
}

export function ValidationWarnings({ input, result }: Props) {
  const frontendResult = useMemo(() => validateInvestmentInput(input), [input]);
  const backendWarnings = result?.input_warnings ?? [];
  const backendFields = new Set(backendWarnings.map((w) => w.field));
  const frontendWarnings = frontendResult.warnings.filter((w) => !backendFields.has(w.field));

  const allWarnings = [
    ...backendWarnings.map((w) => ({ message: w.message, severity: mapSeverity(w.severity), suggestion: w.suggestion })),
    ...frontendWarnings.map((w) => ({ message: w.message, severity: mapSeverity(w.severity), suggestion: w.suggestion })),
  ];

  if (allWarnings.length === 0) return null;

  const hasDanger = allWarnings.some((w) => w.severity === "danger");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Input Validation</h3>
        {hasDanger && (
          <span className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded-full font-medium">
            Unrealistic inputs
          </span>
        )}
      </div>
      <div className="space-y-2">
        {allWarnings.map((w, i) => (
          <WarningRow key={i} message={w.message} severity={w.severity} suggestion={w.suggestion} />
        ))}
      </div>
      {hasDanger && (
        <p className="mt-3 text-xs text-slate-400">
          ⚡ Results shown but may not reflect realistic returns. Adjust inputs for accurate analysis.
        </p>
      )}
    </div>
  );
}
