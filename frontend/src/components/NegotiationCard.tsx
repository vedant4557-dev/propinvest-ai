"use client";

import type { DealAnalysis } from "@/types/investment";

interface NegotiationCardProps {
  deal: DealAnalysis;
}

export function NegotiationCard({ deal }: NegotiationCardProps) {
  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
      <h3 className="mb-2 text-sm font-semibold text-primary-800 dark:text-primary-200">
        Negotiation Suggestion
      </h3>
      <p className="text-sm text-slate-800 dark:text-slate-200">
        {deal.negotiation_suggestion}
      </p>
    </div>
  );
}
