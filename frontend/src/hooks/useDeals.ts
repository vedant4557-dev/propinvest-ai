"use client";

import { useState, useEffect, useCallback } from "react";
import type { SavedDeal, InvestmentInput, AnalyzeInvestmentResponse } from "@/types/investment";

const STORAGE_KEY = "propinvest_saved_deals";

export function useDeals() {
  const [deals, setDeals] = useState<SavedDeal[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDeals(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((
    input: InvestmentInput,
    result: AnalyzeInvestmentResponse,
    name?: string
  ) => {
    const deal: SavedDeal = {
      id: Date.now().toString(),
      name: name || input.property_name || `Deal ${new Date().toLocaleDateString("en-IN")}`,
      savedAt: new Date().toISOString(),
      input,
      result,
    };
    setDeals((prev) => {
      const next = [deal, ...prev].slice(0, 20); // max 20 deals
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return deal.id;
  }, []);

  const remove = useCallback((id: string) => {
    setDeals((prev) => {
      const next = prev.filter((d) => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDeals([]);
  }, []);

  return { deals, save, remove, clear };
}
