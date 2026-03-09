"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(v: number, decimals = 0): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(2)}Cr`;
  if (v >= 100_000)    return `₹${(v / 100_000).toFixed(2)}L`;
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: decimals })}`;
}

function calcEMI(principal: number, rate: number, months: number): number {
  if (rate === 0) return principal / months;
  const r = rate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

interface AmortRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
  totalPaid: number;
  totalInterest: number;
}

function buildSchedule(principal: number, rate: number, months: number): AmortRow[] {
  const emi = calcEMI(principal, rate, months);
  const r = rate / 100 / 12;
  const rows: AmortRow[] = [];
  let balance = principal;
  let totalPaid = 0;
  let totalInterest = 0;

  for (let i = 1; i <= months; i++) {
    const interestPart = balance * r;
    const principalPart = emi - interestPart;
    balance = Math.max(0, balance - principalPart);
    totalPaid += emi;
    totalInterest += interestPart;
    rows.push({ month: i, emi, principal: principalPart, interest: interestPart, balance, totalPaid, totalInterest });
  }
  return rows;
}

// ─── Slider ──────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-base font-black text-primary-600 dark:text-primary-400">{format(value)}</span>
      </div>
      <div className="relative">
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary-500 shadow transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Donut chart ─────────────────────────────────────────────────────────────

function DonutChart({ principal, interest }: { principal: number; interest: number }) {
  const total = principal + interest;
  const pPct = (principal / total) * 100;
  const iPct = (interest / total) * 100;
  const r = 70;
  const circ = 2 * Math.PI * r;
  const pDash = (pPct / 100) * circ;
  const iDash = (iPct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#e2e8f0" strokeWidth="20" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="#0ea5e9" strokeWidth="20"
          strokeDasharray={`${pDash} ${circ}`} strokeLinecap="butt" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="#f59e0b" strokeWidth="20"
          strokeDasharray={`${iDash} ${circ - iDash}`}
          strokeDashoffset={-pDash} strokeLinecap="butt" />
      </svg>
      <div className="absolute text-center">
        <p className="text-[10px] text-slate-400 font-medium">Total</p>
        <p className="text-sm font-black text-slate-700 dark:text-slate-100">{fmt(total)}</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EMICalculatorPage() {
  // Inputs
  const [loanAmount, setLoanAmount]   = useState(8000000);
  const [rate, setRate]               = useState(8.75);
  const [tenure, setTenure]           = useState(20);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleView, setScheduleView] = useState<"yearly" | "monthly">("yearly");

  // Derived
  const emi = useMemo(() => calcEMI(loanAmount, rate, tenure * 12), [loanAmount, rate, tenure]);
  const totalPayable = useMemo(() => emi * tenure * 12, [emi, tenure]);
  const totalInterest = useMemo(() => totalPayable - loanAmount, [totalPayable, loanAmount]);
  const schedule = useMemo(() => buildSchedule(loanAmount, rate, tenure * 12), [loanAmount, rate, tenure]);

  // Yearly grouped schedule
  const yearlySchedule = useMemo(() => {
    const years: { year: number; principal: number; interest: number; balance: number; emi: number }[] = [];
    for (let y = 1; y <= tenure; y++) {
      const rows = schedule.filter(r => Math.ceil(r.month / 12) === y);
      const pSum = rows.reduce((s, r) => s + r.principal, 0);
      const iSum = rows.reduce((s, r) => s + r.interest, 0);
      const lastRow = rows[rows.length - 1];
      years.push({ year: y, principal: pSum, interest: iSum, balance: lastRow?.balance ?? 0, emi: rows[0]?.emi ?? emi });
    }
    return years;
  }, [schedule, tenure, emi]);

  // PropInvest deep-link (pre-fill with these loan details)
  const propinvestURL = useMemo(() => {
    const input = {
      property_purchase_price: Math.round(loanAmount / 0.8),
      down_payment: Math.round(loanAmount / 0.8 * 0.2),
      loan_interest_rate: rate,
      loan_tenure_years: tenure,
      expected_monthly_rent: 25000,
      annual_maintenance_cost: 50000,
      expected_annual_appreciation: 7.5,
      holding_period_years: tenure,
      investor_tax_slab: 30,
      vacancy_rate: 5,
      stamp_duty_percent: 5,
      registration_cost_percent: 1,
      property_area_sqft: 1200,
      rent_growth_rate: 5,
    };
    const encoded = btoa(JSON.stringify(input)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return `/app?deal=${encoded}`;
  }, [loanAmount, rate, tenure]);

  const yearlyBreakEven = useMemo(() => {
    // Year where cumulative principal > cumulative interest (equity flip)
    for (let i = 0; i < yearlySchedule.length; i++) {
      const cumP = yearlySchedule.slice(0, i + 1).reduce((s, y) => s + y.principal, 0);
      const cumI = yearlySchedule.slice(0, i + 1).reduce((s, y) => s + y.interest, 0);
      if (cumP > cumI) return i + 1;
    }
    return null;
  }, [yearlySchedule]);

  const interestRatio = ((totalInterest / totalPayable) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white text-xs font-bold">P</div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 hidden sm:block">PropInvest <span className="text-primary-500">AI</span></span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:block">/</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Home Loan EMI Calculator</span>
          </div>
          <Link href={propinvestURL}
            className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700 transition-colors shadow-sm">
            Full Analysis →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Home Loan EMI Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Calculate your monthly payments, total interest, and full amortization schedule</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Sliders */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-6">
              <Slider label="Loan Amount" value={loanAmount} min={500000} max={50000000} step={100000}
                onChange={setLoanAmount} format={fmt} />
              <Slider label="Interest Rate (p.a.)" value={rate} min={6} max={15} step={0.05}
                onChange={setRate} format={v => `${v.toFixed(2)}%`} />
              <Slider label="Tenure (Years)" value={tenure} min={1} max={30} step={1}
                onChange={setTenure} format={v => `${v} yr`} />
            </div>

            {/* Quick rate comparison */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Rate Comparison</p>
              <div className="space-y-1.5">
                {[
                  { bank: "SBI", rate: 8.5 }, { bank: "HDFC", rate: 8.75 },
                  { bank: "ICICI", rate: 8.75 }, { bank: "Kotak", rate: 8.7 },
                  { bank: "Axis", rate: 8.75 }, { bank: "PNB", rate: 8.45 },
                ].map(b => {
                  const bEmi = calcEMI(loanAmount, b.rate, tenure * 12);
                  const isActive = Math.abs(b.rate - rate) < 0.01;
                  return (
                    <button key={b.bank} onClick={() => setRate(b.rate)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                        isActive ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}>
                      <span className={`font-semibold ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-700 dark:text-slate-300"}`}>{b.bank}</span>
                      <span className="text-slate-400">{b.rate}%</span>
                      <span className={`font-bold ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-600 dark:text-slate-400"}`}>{fmt(bEmi)}/mo</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">Click any row to apply rate</p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* EMI hero card */}
            <div className="rounded-2xl border border-primary-200 dark:border-primary-800/40 bg-gradient-to-br from-primary-50 to-sky-50 dark:from-primary-900/20 dark:to-sky-900/10 p-5">
              <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">Monthly EMI</p>
              <p className="text-4xl font-black text-primary-700 dark:text-primary-300">{fmt(emi)}</p>
              <p className="text-xs text-slate-500 mt-1">for {tenure} years at {rate}% per annum</p>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-primary-200/50 dark:border-primary-800/30">
                {[
                  { l: "Principal", v: fmt(loanAmount), color: "text-sky-600 dark:text-sky-400" },
                  { l: "Total Interest", v: fmt(totalInterest), color: "text-amber-600 dark:text-amber-400" },
                  { l: "Total Payable", v: fmt(totalPayable), color: "text-slate-700 dark:text-slate-200" },
                ].map(m => (
                  <div key={m.l} className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{m.l}</p>
                    <p className={`text-sm font-black mt-0.5 ${m.color}`}>{m.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual breakdown */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Loan Breakdown</p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <DonutChart principal={loanAmount} interest={totalInterest} />
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-sky-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">Principal Amount</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(loanAmount)}</p>
                      <p className="text-[10px] text-slate-400">{(100 - Number(interestRatio)).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">Total Interest</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{fmt(totalInterest)}</p>
                      <p className="text-[10px] text-slate-400">{interestRatio}%</p>
                    </div>
                  </div>

                  {/* Interest insight */}
                  <div className={`rounded-xl p-3 text-xs mt-2 ${
                    Number(interestRatio) > 50
                      ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40"
                      : "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40"
                  }`}>
                    {Number(interestRatio) > 50 ? (
                      <p className="text-amber-700 dark:text-amber-400">
                        ⚠️ You pay <strong>{interestRatio}%</strong> of your total outgo as interest.
                        Consider a shorter tenure or higher down payment.
                      </p>
                    ) : (
                      <p className="text-emerald-700 dark:text-emerald-400">
                        ✓ Interest cost is <strong>{interestRatio}%</strong> of total — reasonable for this tenure.
                      </p>
                    )}
                  </div>

                  {yearlyBreakEven && (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3 text-xs">
                      <p className="text-slate-600 dark:text-slate-400">
                        📊 <strong>Equity flip at Year {yearlyBreakEven}</strong> — after this point your principal repayment exceeds your interest payment each year.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tenure comparison */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">EMI vs Tenure</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px]">
                      <th className="text-left pb-2 font-medium">Tenure</th>
                      <th className="text-right pb-2 font-medium">EMI</th>
                      <th className="text-right pb-2 font-medium">Total Interest</th>
                      <th className="text-right pb-2 font-medium">Savings vs 30yr</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {[10, 15, 20, 25, 30].map(t => {
                      const e = calcEMI(loanAmount, rate, t * 12);
                      const tot = e * t * 12;
                      const int = tot - loanAmount;
                      const base = calcEMI(loanAmount, rate, 30 * 12) * 30 * 12 - loanAmount;
                      const saving = base - int;
                      const isActive = t === tenure;
                      return (
                        <tr key={t} onClick={() => setTenure(t)} className={`cursor-pointer transition ${isActive ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/30"}`}>
                          <td className={`py-2 font-semibold ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-700 dark:text-slate-300"}`}>{t} yrs</td>
                          <td className={`py-2 text-right font-bold ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-700 dark:text-slate-200"}`}>{fmt(e)}</td>
                          <td className="py-2 text-right text-slate-500">{fmt(int)}</td>
                          <td className={`py-2 text-right font-medium ${saving > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                            {t === 30 ? "—" : saving > 0 ? `+${fmt(saving)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Click any row to set tenure</p>
            </div>

            {/* PropInvest CTA */}
            <div className="rounded-2xl border border-primary-200 dark:border-primary-800/40 bg-primary-50/60 dark:bg-primary-900/10 p-5">
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">Go Beyond EMI</p>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Is this property actually a good investment?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                EMI is just one number. PropInvest AI computes IRR, Cash-on-Cash return, DSCR, Monte Carlo risk, tax savings, Nifty comparison, and 15+ more metrics — in 3 seconds.
              </p>
              <Link href={propinvestURL}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                ✦ Run Full Investment Analysis
                <span className="text-primary-200 text-xs">— Free, no sign-up</span>
              </Link>
            </div>

            {/* Amortization schedule toggle */}
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <span>📅 {showSchedule ? "Hide" : "View"} Amortization Schedule</span>
              <span className="text-slate-400">{showSchedule ? "▲" : "▼"}</span>
            </button>

            {showSchedule && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Amortization Schedule</p>
                  <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden text-xs">
                    {(["yearly", "monthly"] as const).map(v => (
                      <button key={v} onClick={() => setScheduleView(v)}
                        className={`px-2.5 py-1 font-medium capitalize transition ${scheduleView === v ? "bg-primary-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                      <tr className="text-slate-400 text-[10px]">
                        <th className="text-left px-4 py-2 font-medium">{scheduleView === "yearly" ? "Year" : "Month"}</th>
                        <th className="text-right px-3 py-2 font-medium">EMI</th>
                        <th className="text-right px-3 py-2 font-medium">Principal</th>
                        <th className="text-right px-3 py-2 font-medium">Interest</th>
                        <th className="text-right px-4 py-2 font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {scheduleView === "yearly"
                        ? yearlySchedule.map(row => (
                          <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Year {row.year}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{fmt(row.emi * 12)}</td>
                            <td className="px-3 py-2 text-right text-sky-600 dark:text-sky-400 font-medium">{fmt(row.principal)}</td>
                            <td className="px-3 py-2 text-right text-amber-600 dark:text-amber-400 font-medium">{fmt(row.interest)}</td>
                            <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{fmt(row.balance)}</td>
                          </tr>
                        ))
                        : schedule.map(row => (
                          <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">M{row.month}</td>
                            <td className="px-3 py-2 text-right text-slate-500">{fmt(emi)}</td>
                            <td className="px-3 py-2 text-right text-sky-600 dark:text-sky-400">{fmt(row.principal)}</td>
                            <td className="px-3 py-2 text-right text-amber-600 dark:text-amber-400">{fmt(row.interest)}</td>
                            <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-400">{fmt(row.balance)}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-8">
        <p>
          <Link href="/" className="text-primary-500 hover:underline">PropInvest AI</Link>
          {" · "}
          <Link href="/app" className="hover:text-primary-500 transition-colors">Full Analyzer</Link>
          {" · "}
          <Link href="/projects" className="hover:text-primary-500 transition-colors">Project Database</Link>
        </p>
        <p className="mt-2">EMI calculations are indicative. Actual bank rates and terms may vary.</p>
      </footer>
    </div>
  );
}
