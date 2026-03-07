"use client";

import { useState, FormEvent } from "react";
import type { InvestmentInput } from "@/types/investment";
import { InputForm } from "./InputForm";

const DEFAULT_INPUT = {
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

interface PortfolioFormProps {
  onAnalyze: (investments: InvestmentInput[]) => void;
  isLoading: boolean;
}

export function PortfolioForm({ onAnalyze, isLoading }: PortfolioFormProps) {
  const [investments, setInvestments] = useState<any[]>([
    { ...DEFAULT_INPUT },
  ]);

  const addProperty = () => {
    setInvestments((prev) => [...prev, { ...DEFAULT_INPUT }]);
  };

  const removeProperty = (index: number) => {
    if (investments.length <= 1) return;
    setInvestments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateProperty = (index: number, data: InvestmentInput) => {
    setInvestments((prev) => {
      const next = [...prev];
      next[index] = data;
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAnalyze(investments);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {investments.map((inv, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-slate-800 dark:text-slate-200">
                Property {i + 1}
              </h3>
              {investments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProperty(i)}
                  className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400"
                >
                  Remove
                </button>
              )}
            </div>
            <InputFormFields
              data={inv}
              onChange={(d) => updateProperty(i, d)}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addProperty}
          className="rounded-lg border border-dashed border-slate-400 px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary-500 hover:text-primary-600 dark:text-slate-400 dark:hover:border-primary-400 dark:hover:text-primary-400"
        >
          + Add Property
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {isLoading ? "Analyzing…" : "Analyze Portfolio"}
        </button>
      </div>
    </form>
  );
}

function InputFormFields({
  data,
  onChange,
}: {
  data: InvestmentInput;
  onChange: (d: InvestmentInput) => void;
}) {
  const handleChange = (field: keyof InvestmentInput, value: number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <FormField label="Price (₹)" value={data.property_purchase_price} onChange={(v) => handleChange("property_purchase_price", v)} min={100000} step={100000} />
      <FormField label="Down (₹)" value={data.down_payment} onChange={(v) => handleChange("down_payment", v)} min={0} step={100000} />
      <FormField label="Rate (%)" value={data.loan_interest_rate} onChange={(v) => handleChange("loan_interest_rate", v)} min={0} max={30} step={0.1} />
      <FormField label="Tenure (y)" value={data.loan_tenure_years} onChange={(v) => handleChange("loan_tenure_years", v)} min={1} max={30} step={1} />
      <FormField label="Rent/mo (₹)" value={data.expected_monthly_rent} onChange={(v) => handleChange("expected_monthly_rent", v)} min={0} step={1000} />
      <FormField label="Maint (₹)" value={data.annual_maintenance_cost} onChange={(v) => handleChange("annual_maintenance_cost", v)} min={0} step={1000} />
      <FormField label="Apprec (%)" value={data.expected_annual_appreciation} onChange={(v) => handleChange("expected_annual_appreciation", v)} min={-10} max={30} step={0.5} />
      <FormField label="Holding (y)" value={data.holding_period_years} onChange={(v) => handleChange("holding_period_years", v)} min={1} max={30} step={1} />
      <FormField label="Tax (%)" value={data.investor_tax_slab} onChange={(v) => handleChange("investor_tax_slab", v)} min={0} max={42.74} step={0.5} />
    </div>
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
      <label className="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
  );
}
