"use client";

import { useState, useRef } from "react";
import type { InvestmentInput } from "@/types/investment";

function fmtLabel(v: number): string {
  const a = Math.abs(v);
  if (a >= 10_000_000) return `₹${(a / 10_000_000).toFixed(2)} Cr`;
  if (a >= 100_000)    return `₹${(a / 100_000).toFixed(2)} L`;
  if (a >= 1_000)      return `₹${(a / 1_000).toFixed(0)} K`;
  return v > 0 ? `₹${v.toLocaleString("en-IN")}` : "";
}

const INDIAN_CITIES = [
  "Ahmedabad","Bangalore","Bengaluru","Bhopal","Bhubaneswar","Chandigarh","Chennai",
  "Coimbatore","Delhi","Faridabad","Ghaziabad","Gurgaon","Gurugram","Hyderabad",
  "Indore","Jaipur","Jodhpur","Kanpur","Kochi","Kolkata","Lucknow","Ludhiana",
  "Madurai","Meerut","Mumbai","Nagpur","Nashik","Navi Mumbai","Noida","Patna",
  "Pune","Rajkot","Ranchi","Surat","Thane","Vadodara","Varanasi","Visakhapatnam",
];

interface InputFormProps {
  onAnalyze: (input: InvestmentInput) => void;
  isLoading: boolean;
  initialValues?: Partial<InvestmentInput>;
}

const DEFAULTS: InvestmentInput = {
  property_purchase_price: 10_000_000,
  down_payment: 2_000_000,
  loan_interest_rate: 8.5,
  loan_tenure_years: 20,
  expected_monthly_rent: 35_000,
  annual_maintenance_cost: 36_000,
  expected_annual_appreciation: 6,
  holding_period_years: 10,
  investor_tax_slab: 30,
  vacancy_rate: 5,
  stamp_duty_percent: 6,
  registration_cost_percent: 1,
  property_name: "",
  city: "",
  property_area_sqft: 1000,
  rent_growth_rate: 0,
};

function SectionHeader({ label, icon, isOpen, onToggle, summary }: {
  label: string; icon: string; isOpen: boolean; onToggle: () => void; summary?: string;
}) {
  return (
    <button type="button" onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        {!isOpen && summary && (
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">{summary}</span>
        )}
      </div>
      <span className={`text-xs text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
    </button>
  );
}

function NumField({ label, value, onChange, min, max, step, suffix, hint, isINR = false }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
  suffix?: string; hint?: string; isINR?: boolean;
}) {
  const preview = isINR && value >= 1000 ? fmtLabel(value) : null;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
        {preview && (
          <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded">
            {preview}
          </span>
        )}
      </div>
      <div className="relative">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          min={min} max={max} step={step}
          className={`w-full rounded-lg border border-slate-200 bg-white py-2 text-sm shadow-sm
            focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100
            dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:border-primary-500 transition-colors
            pl-3 ${suffix ? "pr-8" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function CityField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);

  const matches = q.length >= 1
    ? INDIAN_CITIES.filter(c => c.toLowerCase().startsWith(q.toLowerCase())).slice(0, 6)
    : [];

  const select = (city: string) => { setQ(city); onChange(city); setOpen(false); };

  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">City</label>
      <input type="text" value={q}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="e.g. Mumbai" autoComplete="off"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 transition-colors"
      />
      {open && matches.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800 overflow-hidden">
          {matches.map(city => (
            <button key={city} type="button" onMouseDown={() => select(city)}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              🏙 {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InputForm({ onAnalyze, isLoading, initialValues }: InputFormProps) {
  const [form, setForm] = useState<InvestmentInput>({ ...DEFAULTS, ...initialValues });
  const [expanded, setExpanded] = useState<string>("property");

  const set = (field: keyof InvestmentInput, value: number | string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggle = (group: string) =>
    setExpanded(prev => prev === group ? "" : group);

  const loanAmt = form.property_purchase_price - form.down_payment;
  const ltv = form.property_purchase_price > 0 ? Math.round((loanAmt / form.property_purchase_price) * 100) : 0;
  const acqCost = form.property_purchase_price * (form.stamp_duty_percent + form.registration_cost_percent) / 100;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 mb-1">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Property Name</label>
          <input type="text" value={form.property_name || ""} onChange={(e) => set("property_name", e.target.value)}
            placeholder="e.g. Andheri Flat"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 transition-colors"
          />
        </div>
        <CityField value={form.city || ""} onChange={(v) => set("city", v)} />
      </div>

      {/* Property */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <SectionHeader label="Property" icon="🏠" isOpen={expanded === "property"} onToggle={() => toggle("property")}
          summary={form.property_purchase_price > 0 ? fmtLabel(form.property_purchase_price) : undefined} />
        {expanded === "property" && (
          <div className="border-t border-slate-100 dark:border-slate-700 p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Property Price (₹)" value={form.property_purchase_price}
                onChange={(v) => set("property_purchase_price", v)} min={100_000} step={100_000} isINR />
              <NumField label="Down Payment (₹)" value={form.down_payment}
                onChange={(v) => set("down_payment", v)} min={0} step={100_000} isINR
                hint={loanAmt > 0 ? `Loan: ${fmtLabel(loanAmt)} · LTV: ${ltv}%` : undefined} />
              <NumField label="Area (sqft)" value={form.property_area_sqft ?? 1000}
                onChange={(v) => set("property_area_sqft", v)} min={1} max={100_000} step={50}
                hint={form.property_area_sqft && form.property_purchase_price > 0
                  ? `₹${Math.round(form.property_purchase_price / form.property_area_sqft).toLocaleString("en-IN")}/sqft`
                  : undefined} />
              <NumField label="Appreciation (%/yr)" value={form.expected_annual_appreciation}
                onChange={(v) => set("expected_annual_appreciation", v)} min={-10} max={30} step={0.5} suffix="%" />
            </div>
            <NumField label="Holding Period (years)" value={form.holding_period_years}
              onChange={(v) => set("holding_period_years", v)} min={1} max={30} step={1} suffix="yrs"
              hint={`Planned exit in ${new Date().getFullYear() + form.holding_period_years}`} />
          </div>
        )}
      </div>

      {/* Loan */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <SectionHeader label="Loan" icon="🏦" isOpen={expanded === "loan"} onToggle={() => toggle("loan")}
          summary={`${form.loan_interest_rate}% · ${form.loan_tenure_years}yr`} />
        {expanded === "loan" && (
          <div className="border-t border-slate-100 dark:border-slate-700 p-3">
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Interest Rate (%/yr)" value={form.loan_interest_rate}
                onChange={(v) => set("loan_interest_rate", v)} min={0} max={30} step={0.1} suffix="%" />
              <NumField label="Tenure (years)" value={form.loan_tenure_years}
                onChange={(v) => set("loan_tenure_years", v)} min={1} max={30} step={1} suffix="yrs" />
            </div>
          </div>
        )}
      </div>

      {/* Rental */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <SectionHeader label="Rental Income" icon="💰" isOpen={expanded === "rental"} onToggle={() => toggle("rental")}
          summary={form.expected_monthly_rent > 0 ? `${fmtLabel(form.expected_monthly_rent)}/mo` : undefined} />
        {expanded === "rental" && (
          <div className="border-t border-slate-100 dark:border-slate-700 p-3">
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Monthly Rent (₹)" value={form.expected_monthly_rent}
                onChange={(v) => set("expected_monthly_rent", v)} min={0} step={1_000} isINR
                hint={form.expected_monthly_rent > 0 ? `Annual: ${fmtLabel(form.expected_monthly_rent * 12)}` : undefined} />
              <NumField label="Annual Maintenance (₹)" value={form.annual_maintenance_cost}
                onChange={(v) => set("annual_maintenance_cost", v)} min={0} step={1_000} isINR
                hint={form.annual_maintenance_cost > 0 ? `Monthly: ${fmtLabel(form.annual_maintenance_cost / 12)}` : undefined} />
              <NumField label="Vacancy Rate (%)" value={form.vacancy_rate}
                onChange={(v) => set("vacancy_rate", v)} min={0} max={50} step={1} suffix="%" />
              <NumField label="Rent Growth (%/yr)" value={form.rent_growth_rate ?? 0}
                onChange={(v) => set("rent_growth_rate", v)} min={0} max={15} step={0.5} suffix="%" />
            </div>
          </div>
        )}
      </div>

      {/* India Tax */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <SectionHeader label="India Tax" icon="🇮🇳" isOpen={expanded === "india"} onToggle={() => toggle("india")}
          summary={`${form.investor_tax_slab}% slab · SD ${form.stamp_duty_percent}%`} />
        {expanded === "india" && (
          <div className="border-t border-slate-100 dark:border-slate-700 p-3">
            <div className="grid grid-cols-3 gap-3">
              <NumField label="Tax Slab (%)" value={form.investor_tax_slab}
                onChange={(v) => set("investor_tax_slab", v)} min={0} max={42.74} step={0.5} suffix="%" />
              <NumField label="Stamp Duty (%)" value={form.stamp_duty_percent}
                onChange={(v) => set("stamp_duty_percent", v)} min={0} max={15} step={0.5} suffix="%" />
              <NumField label="Registration (%)" value={form.registration_cost_percent}
                onChange={(v) => set("registration_cost_percent", v)} min={0} max={5} step={0.25} suffix="%" />
            </div>
            {acqCost > 0 && (
              <p className="mt-2 text-[10px] text-slate-400 text-center">
                Estimated stamp duty + registration: {fmtLabel(acqCost)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => onAnalyze(form)} disabled={isLoading}
          className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-sm">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Analyzing…
            </span>
          ) : "Analyze Investment →"}
        </button>
        <button type="button" onClick={() => setForm(DEFAULTS)}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
          title="Reset to defaults">↺
        </button>
      </div>
    </div>
  );
}
