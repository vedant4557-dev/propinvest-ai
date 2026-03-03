"use client";

interface DiversificationGaugeProps {
  value: number;
  label?: string;
}

export function DiversificationGauge({ value, label = "Diversification" }: DiversificationGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-36">
        <svg viewBox="0 0 120 70" className="w-full">
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-200 dark:text-slate-600"
          />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${(clamped / 100) * 157} 157`}
            strokeLinecap="round"
            className="text-primary-500 transition-all duration-500"
          />
        </svg>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl font-bold text-slate-900 dark:text-slate-100">
          {Math.round(clamped)}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
    </div>
  );
}
