"use client";

import { useState, useEffect, useCallback } from "react";
import type { SavedDeal, InvestmentInput, AnalyzeInvestmentResponse } from "@/types/investment";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const STORAGE_KEY    = "propinvest_saved_deals";
const FREE_DEAL_LIMIT = 3;

function localGet(): SavedDeal[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function localSet(deals: SavedDeal[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deals)); } catch { /* ignore */ }
}

async function cloudFetch(userId: string): Promise<SavedDeal[]> {
  const { data, error } = await supabase
    .from("saved_deals").select("*").eq("user_id", userId)
    .order("saved_at", { ascending: false });
  if (error) { console.error("Cloud fetch error:", error); return []; }
  return (data ?? []).map((row) => ({
    id: row.id, name: row.name, savedAt: row.saved_at,
    input: row.input as InvestmentInput, result: row.result as AnalyzeInvestmentResponse,
  }));
}

async function cloudSave(userId: string, deal: SavedDeal): Promise<void> {
  const { error } = await supabase.from("saved_deals").insert({
    id: deal.id, user_id: userId, name: deal.name,
    saved_at: deal.savedAt, input: deal.input, result: deal.result,
  });
  if (error) console.error("Cloud save error:", error);
}

async function cloudDelete(id: string): Promise<void> {
  const { error } = await supabase.from("saved_deals").delete().eq("id", id);
  if (error) console.error("Cloud delete error:", error);
}

export interface UseDealsReturn {
  deals: SavedDeal[];
  save: (input: InvestmentInput, result: AnalyzeInvestmentResponse, name?: string) => Promise<{ id: string; limitReached: boolean }>;
  remove: (id: string) => Promise<void>;
  clear: () => void;
  syncing: boolean;
  isCloud: boolean;
  limitReached: boolean;
}

export function useDeals(user: User | null): UseDealsReturn {
  const [deals,   setDeals]  = useState<SavedDeal[]>([]);
  const [syncing, setSyncing] = useState(false);
  const isCloud = !!user;

  useEffect(() => {
    if (user) {
      setSyncing(true);
      cloudFetch(user.id).then(async (cloudDeals) => {
        const localDeals = localGet();
        if (localDeals.length > 0) {
          for (const deal of localDeals) {
            if (!cloudDeals.some(cd => cd.id === deal.id)) await cloudSave(user.id, deal);
          }
          localSet([]);
          setDeals(await cloudFetch(user.id));
        } else {
          setDeals(cloudDeals);
        }
        setSyncing(false);
      });
    } else {
      setDeals(localGet());
    }
  }, [user?.id]);

  const save = useCallback(async (
    input: InvestmentInput, result: AnalyzeInvestmentResponse, name?: string
  ): Promise<{ id: string; limitReached: boolean }> => {
    const deal: SavedDeal = {
      id: Date.now().toString(),
      name: name || input.property_name || `Deal ${new Date().toLocaleDateString("en-IN")}`,
      savedAt: new Date().toISOString(), input, result,
    };
    if (user) {
      setSyncing(true);
      await cloudSave(user.id, deal);
      setDeals(await cloudFetch(user.id));
      setSyncing(false);
      return { id: deal.id, limitReached: false };
    } else {
      const current = localGet();
      if (current.length >= FREE_DEAL_LIMIT) return { id: "", limitReached: true };
      const next = [deal, ...current];
      localSet(next); setDeals(next);
      return { id: deal.id, limitReached: false };
    }
  }, [user]);

  const remove = useCallback(async (id: string) => {
    if (user) {
      await cloudDelete(id);
      setDeals(prev => prev.filter(d => d.id !== id));
    } else {
      setDeals(prev => { const next = prev.filter(d => d.id !== id); localSet(next); return next; });
    }
  }, [user]);

  const clear = useCallback(() => {
    if (!user) { localSet([]); setDeals([]); }
  }, [user]);

  return { deals, save, remove, clear, syncing, isCloud, limitReached: !user && deals.length >= FREE_DEAL_LIMIT };
}
