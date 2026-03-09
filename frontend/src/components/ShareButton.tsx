"use client";

import { useState } from "react";
import type { InvestmentInput } from "@/types/investment";
import { useShareURL } from "@/hooks/useShareURL";

interface Props {
  inputs: InvestmentInput | null;
}

export function ShareButton({ inputs }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const { copyShareURL } = useShareURL();

  if (!inputs) return null;

  const handleShare = async () => {
    const success = await copyShareURL(inputs);
    setState(success ? "copied" : "error");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <button
      onClick={handleShare}
      title="Share this analysis as a link"
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
        state === "copied"
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : state === "error"
          ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
    >
      {state === "copied" ? (
        <>
          <span>✓</span>
          <span>Link copied!</span>
        </>
      ) : state === "error" ? (
        <>
          <span>✗</span>
          <span>Failed</span>
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share</span>
        </>
      )}
    </button>
  );
}
