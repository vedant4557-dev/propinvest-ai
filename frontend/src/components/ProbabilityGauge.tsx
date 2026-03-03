"use client";

interface ProbabilityGaugeProps {
  value: number; // 0–100
  label: string;
  subtitle?: string;
}

export function ProbabilityGauge({ value, label, subtitle }: ProbabilityGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-32">
        <svg viewBox="0 0 100 60" className="w-full">
          {/* Background arc */}
          <path
            d="M 5 55 A 45 45 0 0 1 95 55"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-600"
          />
          {/* Value arc */}
          <path
            d="M 5 55 A 45 45 0 0 1 95 55"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${(clamped / 100) * 141} 141`}
            strokeLinecap="round"
            className="text-primary-500 transition-all duration-500"
          />
        </svg>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl font-bold text-slate-900 dark:text-slate-100">
          {Math.round(clamped)}%
        </span>
      </div>
      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
