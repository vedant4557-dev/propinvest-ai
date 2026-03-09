"use client";

import { useEffect, useCallback } from "react";
import type { InvestmentInput } from "@/types/investment";

const PARAM = "deal";

// ─── Encode / Decode ────────────────────────────────────────────────────────
// We use a compact JSON → base64url approach. No external deps, pure browser APIs.

function encodeInput(input: InvestmentInput): string {
  try {
    const json = JSON.stringify(input);
    // btoa needs latin1 — use encodeURIComponent trick for unicode safety
    const b64 = btoa(unescape(encodeURIComponent(json)));
    // make URL-safe
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch {
    return "";
  }
}

function decodeInput(encoded: string): InvestmentInput | null {
  try {
    // restore base64 padding
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4;
    const b64 = pad > 0 ? padded + "=".repeat(4 - pad) : padded;
    const json = decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    // Validate it has required fields
    if (
      typeof parsed.property_purchase_price === "number" &&
      typeof parsed.loan_interest_rate === "number"
    ) {
      return parsed as InvestmentInput;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

interface UseShareURLReturn {
  getSharedInput: () => InvestmentInput | null;
  getShareURL: (input: InvestmentInput) => string;
  copyShareURL: (input: InvestmentInput) => Promise<boolean>;
  clearSharedParam: () => void;
}

export function useShareURL(): UseShareURLReturn {
  const getSharedInput = useCallback((): InvestmentInput | null => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(PARAM);
    if (!encoded) return null;
    return decodeInput(encoded);
  }, []);

  const getShareURL = useCallback((input: InvestmentInput): string => {
    if (typeof window === "undefined") return "";
    const encoded = encodeInput(input);
    const url = new URL(window.location.href);
    url.search = "";           // clear existing params
    url.hash   = "";
    url.searchParams.set(PARAM, encoded);
    return url.toString();
  }, []);

  const copyShareURL = useCallback(async (input: InvestmentInput): Promise<boolean> => {
    const url = getShareURL(input);
    if (!url) return false;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fallback: create input element and copy
      try {
        const el = document.createElement("input");
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        return true;
      } catch {
        return false;
      }
    }
  }, [getShareURL]);

  const clearSharedParam = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete(PARAM);
    window.history.replaceState({}, "", url.toString());
  }, []);

  return { getSharedInput, getShareURL, copyShareURL, clearSharedParam };
}
