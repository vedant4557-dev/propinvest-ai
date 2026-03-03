"use client";

import { useState, FormEvent } from "react";
import type { InvestmentInput } from "@/types/investment";

interface InputFormProps {
  onAnalyze: (input: InvestmentInput) => void;
  isLoading: boolean;
}

const DEFAULT_INPUT: InvestmentInput = {
  property_purchase_price: 10000000,
  down_payment: 2000000,
  loan_interest_rate: 8.5,
  loan_tenure_years: 20,
  expected_monthly_rent: 35000,
  annual_maintenance_cost: 36000,
  expected_annual_appreciation: 6,
  holding_period_years: 10,
  investor_tax_slab: 30,
};

export function InputForm({ onAnalyze, isLoading }: InputFormProps) {
  const [form, setForm] = useState<InvestmentInput>(DEFAULT_INPUT);

  const handleChange = (field: keyof InvestmentInput, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAnalyze(form);
  };

  const handleReset = () => setForm(DEFAULT_INPUT);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Property Price (₹)"
          value={form.property_purchase_price}
          onChange={(v) => handleChange("property_purchase_price", v)}
          min={100000}
          step={100000}
        />
        <FormField
          label="Down Payment (₹)"
          value={form.down_payment}
          onChange={(v) => handleChange("down_payment", v)}
          min={0}
          step={100000}
        />
        <FormField
          label="Loan Interest Rate (%)"
          value={form.loan_interest_rate}
          onChange={(v) => handleChange("loan_interest_rate", v)}
          min={0}
          max={30}
          step={0.1}
        />
        <FormField
          label="Loan Tenure (years)"
          value={form.loan_tenure_years}
          onChange={(v) => handleChange("loan_tenure_years", v)}
          min={1}
          max={30}
          step={1}
        />
        <FormField
          label="Expected Monthly Rent (₹)"
          value={form.expected_monthly_rent}
          onChange={(v) => handleChange("expected_monthly_rent", v)}
          min={0}
          step={1000}
        />
        <FormField
          label="Annual Maintenance (₹)"
          value={form.annual_maintenance_cost}
          onChange={(v) => handleChange("annual_maintenance_cost", v)}
          min={0}
          step={1000}
        />
        <FormField
          label="Annual Appreciation (%)"
          value={form.expected_annual_appreciation}
          onChange={(v) => handleChange("expected_annual_appreciation", v)}
          min={-10}
          max={30}
          step={0.5}
        />
        <FormField
          label="Holding Period (years)"
          value={form.holding_period_years}
          onChange={(v) => handleChange("holding_period_years", v)}
          min={1}
          max={30}
          step={1}
        />
        <FormField
          label="Tax Slab (%)"
          value={form.investor_tax_slab}
          onChange={(v) => handleChange("investor_tax_slab", v)}
          min={0}
          max={42.74}
          step={0.5}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {isLoading ? "Analyzing…" : "Analyze Investment"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
  );
}
