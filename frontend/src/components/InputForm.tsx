"use client";

import { useState, FormEvent } from "react";
import type { InvestmentInput } from "@/types/investment";

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
};

type FieldConfig = {
  field: keyof InvestmentInput;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  type?: "number" | "text";
  group: "property" | "loan" | "rental" | "india";
};

const FIELDS: FieldConfig[] = [
  { field: "property_purchase_price", label: "Property Price (₹)", min: 100_000, step: 100_000, group: "property" },
  { field: "down_payment",            label: "Down Payment (₹)",   min: 0, step: 100_000, group: "property" },
  { field: "expected_annual_appreciation", label: "Appreciation (%/yr)", min: -10, max: 30, step: 0.5, group: "property" },
  { field: "holding_period_years",    label: "Holding Period (yrs)", min: 1, max: 30, step: 1, group: "property" },
  { field: "loan_interest_rate",      label: "Loan Rate (%/yr)",   min: 0, max: 30, step: 0.1, group: "loan" },
  { field: "loan_tenure_years",       label: "Loan Tenure (yrs)",  min: 1, max: 30, step: 1, group: "loan" },
  { field: "expected_monthly_rent",   label: "Monthly Rent (₹)",   min: 0, step: 1_000, group: "rental" },
  { field: "annual_maintenance_cost", label: "Annual Maintenance (₹)", min: 0, step: 1_000, group: "rental" },
  { field: "vacancy_rate",            label: "Vacancy Rate (%)",   min: 0, max: 50, step: 1, group: "rental" },
  { field: "investor_tax_slab",       label: "Tax Slab (%)",       min: 0, max: 42.74, step: 0.5, group: "india" },
  { field: "stamp_duty_percent",      label: "Stamp Duty (%)",     min: 0, max: 15, step: 0.5, group: "india" },
  { field: "registration_cost_percent", label: "Registration (%)", min: 0, max: 5, step: 0.25, group: "india" },
];

const GROUP_LABELS: Record<string, string> = {
  property: "Property",
  loan: "Loan",
  rental: "Rental",
  india: "India Tax",
};

export function InputForm({ onAnalyze, isLoading, initialValues }: InputFormProps) {
  const [form, setForm] = useState<InvestmentInput>({ ...DEFAULTS, ...initialValues });
  const [expanded, setExpanded] = useState<string>("property");

  const set = (field: keyof InvestmentInput, value: number | string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const groups = ["property", "loan", "rental", "india"] as const;

  return (
    <div className="space-y-2">
      {/* Name & City */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Property Name</label>
          <input
            type="text"
            value={form.property_name || ""}
            onChange={(e) => set("property_name", e.target.value)}
            placeholder="e.g. Andheri Flat"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">City</label>
          <input
            type="text"
            value={form.city || ""}
            onChange={(e) => set("city", e.target.value)}
            placeholder="e.g. Mumbai"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Grouped accordion */}
      {groups.map((group) => (
        <div key={group} className="rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setExpanded(expanded === group ? "" : group)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            <span>{GROUP_LABELS[group]}</span>
            <span className={`text-xs transition-transform ${expanded === group ? "rotate-180" : ""}`}>▼</span>
          </button>
          {expanded === group && (
            <div className="border-t border-slate-100 p-3 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.filter((f) => f.group === group).map(({ field, label, min, max, step }) => (
                  <div key={field}>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
                    <input
                      type="number"
                      value={form[field] as number}
                      onChange={(e) => set(field, Number(e.target.value))}
                      min={min}
                      max={max}
                      step={step}
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-primary-400 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onAnalyze(form)}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500"
        >
          {isLoading ? "Analyzing…" : "Analyze Investment"}
        </button>
        <button
          type="button"
          onClick={() => setForm(DEFAULTS)}
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
