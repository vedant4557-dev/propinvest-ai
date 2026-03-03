"use client";

export function CorrelationTooltip() {
  return (
    <span
      className="inline-flex cursor-help align-middle"
      title="Correlated appreciation (ρ=0.6): In portfolio Monte Carlo, property values are simulated with 0.6 correlation—when one appreciates, others tend to move in the same direction. Reflects real estate market behavior."
    >
      <svg
        className="h-4 w-4 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </span>
  );
}
