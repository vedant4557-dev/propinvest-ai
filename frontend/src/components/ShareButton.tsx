"use client";
// src/components/ShareButton.tsx
// Generates a shareable URL with investment inputs encoded as query params
// Recipient opens the link → inputs are pre-filled → they can run the same analysis
// Self-contained, no external deps

import { useState } from "react";

interface ShareInputs {
  propertyName?: string;
  city?: string;
  price?: number;
  downPayment?: number;
  area?: number;
  appreciation?: number;
  holdingPeriod?: number;
  rentalIncome?: number;
  loanRate?: number;
  loanTenure?: number;
}

interface ShareButtonProps {
  inputs: ShareInputs;
  className?: string;
}

export default function ShareButton({ inputs, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  function buildShareUrl(): string {
    const params = new URLSearchParams();

    if (inputs.propertyName) params.set("name", inputs.propertyName);
    if (inputs.city) params.set("city", inputs.city);
    if (inputs.price) params.set("price", String(inputs.price));
    if (inputs.downPayment) params.set("dp", String(inputs.downPayment));
    if (inputs.area) params.set("area", String(inputs.area));
    if (inputs.appreciation) params.set("appr", String(inputs.appreciation));
    if (inputs.holdingPeriod) params.set("hold", String(inputs.holdingPeriod));
    if (inputs.rentalIncome) params.set("rent", String(inputs.rentalIncome));
    if (inputs.loanRate) params.set("rate", String(inputs.loanRate));
    if (inputs.loanTenure) params.set("tenure", String(inputs.loanTenure));

    const base =
      typeof window !== "undefined"
        ? `${window.location.origin}/app`
        : "https://propinvest-ai-smoky.vercel.app/app";

    return `${base}?${params.toString()}`;
  }

  async function handleShare() {
    const url = buildShareUrl();

    // Try native share on mobile
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PropInvest Analysis — ${inputs.propertyName ?? "Property"}`,
          text: `Check out this real estate investment analysis for ${inputs.propertyName ?? "a property"} in ${inputs.city ?? "India"}`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard if user cancels native share
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Last resort: select text from a temp input
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <button
      onClick={handleShare}
      title="Share this analysis"
      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200
        ${copied
          ? "bg-green-100 text-green-700 border-2 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-700"
          : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-green-300 hover:text-green-700 dark:hover:border-green-700 dark:hover:text-green-400"
        } ${className}`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Link Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

// ── URL param reader (use this in your AppPage to pre-fill inputs on load) ──
// Add this to your AppPage.tsx useEffect:
//
// useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   if (params.get("price")) {
//     setPropertyName(params.get("name") ?? "");
//     setCity(params.get("city") ?? "");
//     setPrice(Number(params.get("price")));
//     setDownPayment(Number(params.get("dp")));
//     setArea(Number(params.get("area")));
//     setAppreciation(Number(params.get("appr")));
//     setHoldingPeriod(Number(params.get("hold")));
//     setRentalIncome(Number(params.get("rent")));
//     setLoanRate(Number(params.get("rate")));
//     setLoanTenure(Number(params.get("tenure")));
//   }
// }, []);
