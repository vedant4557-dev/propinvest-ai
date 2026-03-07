"use client";

// DataConfidenceIndicator — PropInvest AI V3.1 Task 11
// Shows data quality level for market intelligence estimates

export type ConfidenceLevel = "High" | "Medium" | "Low";

interface Props {
  city: string;
  module?: string;
}

const METRO_CITIES = ["mumbai", "bangalore", "bengaluru", "delhi", "hyderabad", "pune", "chennai"];

function getConfidence(city: string): { level: ConfidenceLevel; reason: string } {
  const c = city.toLowerCase().trim();
  if (METRO_CITIES.some((m) => c.includes(m))) {
    return { level: "Medium", reason: "Estimated from city-tier benchmarks and market reports" };
  }
  if (c.length > 0) {
    return { level: "Low", reason: "Generic benchmarks — city-specific data not available" };
  }
  return { level: "Low", reason: "No city provided — using national averages" };
}

const levelConfig: Record<ConfidenceLevel, { bg: string; text: string; dot: string; icon: string }> = {
  High:   { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-400", icon: "●●●" },
  Medium: { bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-400",  icon: "●●○" },
  Low:    { bg: "bg-slate-100 dark:bg-slate-700/40",    text: "text-slate-600 dark:text-slate-400",     dot: "bg-slate-400",  icon: "●○○" },
};

export function DataConfidenceIndicator({ city, module = "Market Data" }: Props) {
  const { level, reason } = getConfidence(city);
  const cfg = levelConfig[level];

  return (
    <div className={`flex items-start gap-2.5 rounded-lg px-3 py-2 ${cfg.bg}`}>
      <span className={`mt-0.5 text-xs font-mono tracking-widest ${cfg.text}`}>{cfg.icon}</span>
      <div>
        <p className={`text-xs font-semibold ${cfg.text}`}>
          {module} Confidence: {level}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{reason}</p>
      </div>
    </div>
  );
}
