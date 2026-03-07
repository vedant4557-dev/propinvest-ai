"use client";

import { useMemo } from "react";
import { validateInvestmentInput, type ValidationWarning } from "@/lib/validationEngine";
import type { InvestmentInput } from "@/types/investment";

interface Props {
  input: InvestmentInput;
}

const severityConfig = {
  danger: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-800 dark:text-rose-300",
    icon: "🚨",
    label: "Error",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-300",
    icon: "⚠️",
    label: "Warning",
  },
  info: {
    bg: "bg-sky-50 dark:bg-sky-900/20",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-800 dark:text-sky-300",
    icon: "ℹ️",
    label: "Note",
  },
};

function WarningRow({ w }: { w: ValidationWarning }) {
  const cfg = severityConfig[w.severity];
  return (
    <div className={`flex gap-2 rounded-lg border p-2.5 ${cfg.bg} ${cfg.border}`}>
      <span className="text-sm mt-0.5">{cfg.icon}</span>
      <div>
        <p className={`text-xs font-medium ${cfg.text}`}>{w.message}</p>
        {w.suggestion && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            💡 {w.suggestion}
          </p>
        )}
      </div>
    </div>
  );
}

export function ValidationWarnings({ input }: Props) {
  const result = useMemo(() => validateInvestmentInput(input), [input]);

  if (!result.hasWarnings) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Input Validation
      </h3>
      <div className="space-y-2">
        {result.warnings.map((w, i) => (
          <WarningRow key={i} w={w} />
        ))}
      </div>
    </div>
  );
}
