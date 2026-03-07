"use client";

// InflationReturnsCard — PropInvest AI V3.1 (Task 8)
// Shows real (inflation-adjusted) IRR and returns

interface Props {
  nominalIRR: number;
  nominalROI: number;
  postTaxIRR?: number;
  inflation?: number;  // default 6
}

export function InflationReturnsCard({ nominalIRR, nominalROI, postTaxIRR, inflation = 6 }: Props) {
  const realIRR      = Math.round((nominalIRR - inflation) * 10) / 10;
  const realROI      = Math.round((nominalROI - inflation * (nominalROI > 0 ? 1 : 0)) * 10) / 10;
  const realPostTax  = postTaxIRR !== undefined ? Math.round((postTaxIRR - inflation) * 10) / 10 : null;

  const irrColor = realIRR >= 5
    ? "text-emerald-700 dark:text-emerald-400"
    : realIRR >= 0
    ? "text-amber-700 dark:text-amber-400"
    : "text-rose-700 dark:text-rose-400";

  const rows = [
    { label: "Nominal IRR",    nominal: nominalIRR,       real: realIRR,      show: true },
    { label: "Post-Tax IRR",   nominal: postTaxIRR ?? 0,  real: realPostTax ?? 0, show: realPostTax !== null },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">📉 Inflation-Adjusted Returns</h3>
        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
          Inflation: {inflation}%
        </span>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Real returns = Nominal returns − Inflation ({inflation}%). Reflects actual purchasing power gain.
      </p>

      <div className="space-y-3">
        {rows.filter((r) => r.show).map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{row.label}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Nominal: <strong>{row.nominal.toFixed(1)}%</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-600">→</span>
                <span className={`text-sm font-bold ${row.real >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                  Real: {row.real >= 0 ? "+" : ""}{row.real.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              row.real >= 5 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
              row.real >= 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
              "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
            }`}>
              {row.real >= 5 ? "Beats Inflation" : row.real >= 0 ? "Marginal" : "Below Inflation"}
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-4 rounded-xl p-3 ${realIRR >= 4 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
        <p className={`text-sm font-semibold ${irrColor}`}>
          Real IRR: {realIRR >= 0 ? "+" : ""}{realIRR.toFixed(1)}%
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {realIRR >= 6
            ? "Strong real return — well above inflation. Capital is genuinely growing."
            : realIRR >= 3
            ? "Positive real return — modest wealth creation after inflation."
            : realIRR >= 0
            ? "Barely beating inflation. Consider if risk justifies marginal real return."
            : "Negative real return. Inflation is eroding purchasing power faster than gains."}
        </p>
      </div>
    </div>
  );
}
