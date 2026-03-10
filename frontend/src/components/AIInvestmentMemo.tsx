"use client";

import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { InvestmentInput, InvestmentMetrics, TaxAnalysis, AIAnalysis } from "@/types/investment";
import { Tooltip } from "@/lib/glossary";

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmt(v: number): string {
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 10_000_000) return `${s}₹${(a / 10_000_000).toFixed(2)}Cr`;
  if (a >= 100_000)    return `${s}₹${(a / 100_000).toFixed(1)}L`;
  return `${s}₹${a.toLocaleString("en-IN")}`;
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface MemoSection {
  title: string;
  content: string;
}

interface GeneratedMemo {
  property: string;
  date: string;
  verdict: string;
  sections: MemoSection[];
}

interface Props {
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
  taxAnalysis?: TaxAnalysis | null;
  aiAnalysis?: AIAnalysis | null;
}

// ─── PDF print styles ──────────────────────────────────────────────────────

const PRINT_CSS = `
  @media print {
    body > * { display: none !important; }
    #propinvest-memo-print-root { display: block !important; position: static !important; }
    #propinvest-memo-print-root * { color: #000 !important; background: #fff !important; }
    .no-print { display: none !important; }
    @page { margin: 20mm; }
  }
`;

// ─── Memo renderer ────────────────────────────────────────────────────────

function MemoContent({ memo, inputs, metrics, taxAnalysis }: {
  memo: GeneratedMemo;
  inputs: InvestmentInput;
  metrics: InvestmentMetrics;
  taxAnalysis?: TaxAnalysis | null;
}) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b-2 border-slate-800 dark:border-slate-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
              Investment Memorandum — Confidential
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{memo.property}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {inputs.city ? `${inputs.city} · ` : ""}{fmt(inputs.property_purchase_price)} · {inputs.holding_period_years}-Year Hold
            </p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
              memo.verdict === "Strong Buy" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
              memo.verdict === "Buy"        ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" :
              memo.verdict === "Hold"       ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                                              "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
            }`}>{memo.verdict}</span>
            <p className="text-[10px] text-slate-400 mt-2">{memo.date}</p>
          </div>
        </div>

        {/* Quick financials */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {[
            { l: "IRR (Pre-Tax)",    v: `${metrics.irr.toFixed(1)}%` },
            { l: "Post-Tax IRR",     v: `${(taxAnalysis?.post_tax_irr ?? metrics.irr).toFixed(1)}%` },
            { l: "DSCR",             v: `${metrics.dscr.toFixed(2)}x` },
            { l: "Gross Yield",      v: `${metrics.gross_rental_yield.toFixed(2)}%` },
            { l: "Cap Rate",         v: `${metrics.cap_rate.toFixed(2)}%` },
            { l: "NPV",              v: fmt(metrics.npv) },
            { l: "Equity Multiple",  v: `${(metrics.future_property_value / metrics.effective_down_payment).toFixed(1)}x` },
            { l: "Future Value",     v: fmt(metrics.future_property_value) },
          ].map(item => (
            <div key={item.l} className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2.5 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">{item.l}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Memo sections — rendered with full content */}
      {memo.sections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-l-4 border-primary-500 pl-3 py-0.5">
            {idx + 1}. {section.title}
          </h3>
          <div className="pl-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {section.content || <span className="text-slate-400 italic">No content generated for this section.</span>}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">Generated by PropInvest AI · For institutional use only</p>
        <p className="text-[10px] text-slate-400">Projections based on user-provided assumptions. Not financial advice.</p>
      </div>
    </div>
  );
}

// ─── Streaming text renderer ───────────────────────────────────────────────

function StreamingDisplay({ text }: { text: string }) {
  const sections = text.split(/\n(?=#{1,3} )/);
  return (
    <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
      {sections.map((s, i) => {
        const lines = s.split("\n");
        const heading = lines[0].replace(/^#{1,3} /, "");
        const body = lines.slice(1).join("\n");
        return (
          <div key={i}>
            {i > 0 && (
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-l-4 border-primary-500 pl-3 py-0.5 mb-1">
                {heading}
              </h4>
            )}
            {i === 0 && <p className="font-semibold text-slate-700 dark:text-slate-200">{heading}</p>}
            <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">{body}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section parser ────────────────────────────────────────────────────────

function parseMemoSections(text: string): MemoSection[] {
  const sectionTitles = [
    "Investment Thesis",
    "Key Risks",
    "Financial Summary",
    "Market Outlook",
    "Scenario Analysis",
    "Exit Strategy",
    "Recommendation",
  ];

  const sections: MemoSection[] = [];

  for (let i = 0; i < sectionTitles.length; i++) {
    const title = sectionTitles[i];
    const next  = sectionTitles[i + 1];

    // Match headings like: ## Investment Thesis  OR  ## 1. Investment Thesis
    const startRegex = new RegExp(`#{1,3}\\s*(?:\\d+\\.\\s*)?${title}`, "i");
    const endRegex   = next ? new RegExp(`#{1,3}\\s*(?:\\d+\\.\\s*)?${next}`, "i") : null;

    const startMatch = text.match(startRegex);
    if (!startMatch || startMatch.index === undefined) continue;

    const startIdx = startMatch.index + startMatch[0].length;
    const endIdx   = endRegex ? (text.match(endRegex)?.index ?? text.length) : text.length;

    const content = text.slice(startIdx, endIdx).trim();
    if (content) sections.push({ title, content });
  }

  // Fallback: if no sections matched, return the whole text as one section
  if (sections.length === 0 && text.trim()) {
    return [{ title: "Investment Analysis", content: text.trim() }];
  }

  return sections;
}

// ─── Main Component ────────────────────────────────────────────────────────

export function AIInvestmentMemo({ inputs, metrics, taxAnalysis, aiAnalysis }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "streaming" | "done" | "error">("idle");
  const [streamText, setStreamText] = useState("");
  const [memo, setMemo] = useState<GeneratedMemo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const memoRef = useRef<HTMLDivElement>(null);

  const postTaxIRR = taxAnalysis?.post_tax_irr ?? metrics.irr;
  const propName   = inputs.property_name || "Property";
  const city       = inputs.city || "India";

  const buildPrompt = () => {
    const verdict =
      metrics.irr >= 15 && metrics.dscr >= 1.2 ? "Strong Buy" :
      metrics.irr >= 10 && metrics.dscr >= 1.0  ? "Buy"        :
      metrics.irr >= 7                           ? "Hold"       : "Avoid";

    return `You are a senior private equity real estate analyst at a top-tier Indian institutional fund (similar to Blackstone India or Kotak Realty Fund). Generate a professional investment memo for the following deal.

PROPERTY: ${propName} — ${city}

KEY FINANCIALS:
- Purchase Price: ${fmt(inputs.property_purchase_price)}
- Down Payment: ${fmt(inputs.down_payment)} (LTV: ${Math.round(metrics.ltv_ratio * 100)}%)
- Monthly Rent: ${fmt(inputs.expected_monthly_rent)}
- Loan: ${metrics.loan_amount > 0 ? `${fmt(metrics.loan_amount)} at ${inputs.loan_interest_rate}% for ${inputs.loan_tenure_years}yrs` : "No loan (all cash)"}
- EMI: ${fmt(metrics.emi)}/month
- Annual Cash Flow: ${fmt(metrics.annual_cash_flow)}
- IRR (Pre-Tax): ${metrics.irr.toFixed(1)}%
- IRR (Post-Tax): ${postTaxIRR.toFixed(1)}%
- Net Yield: ${metrics.net_rental_yield.toFixed(2)}%
- Cap Rate: ${metrics.cap_rate.toFixed(2)}%
- DSCR: ${metrics.dscr.toFixed(2)}x
- NPV (10% hurdle): ${fmt(metrics.npv)}
- Future Value (${inputs.holding_period_years}yr): ${fmt(metrics.future_property_value)}
- Capital Gains: ${fmt(metrics.capital_gains)}
- Break-Even Occupancy: ${metrics.break_even_occupancy.toFixed(1)}%
- Appreciation Assumption: ${inputs.expected_annual_appreciation}%/yr
- Holding Period: ${inputs.holding_period_years} years
- Investor Tax Slab: ${inputs.investor_tax_slab}%
- LTCG Tax: ${taxAnalysis ? fmt(taxAnalysis.capital_gains_tax) : "N/A"}
- Sec 24(b) Interest Benefit: ${taxAnalysis ? fmt(taxAnalysis.tax_savings_from_interest) : "N/A"}
- Verdict: ${verdict}

Generate the memo with exactly these 7 sections. Be rigorous, specific, and use the exact numbers above. Write like a Blackstone/McKinsey analyst — precise, institutional, no fluff.

## Investment Thesis
[2-3 paragraphs: why this deal makes sense, what drives returns, market context for ${city}]

## Key Risks
[Bullet list of 4-6 specific quantified risks with mitigation notes]

## Financial Summary
[Detailed breakdown referencing the specific numbers: IRR waterfall, return attribution between income vs appreciation, comparison to 7% FD benchmark, tax efficiency]

## Market Outlook
[${city} market context: supply-demand, employment trends, infrastructure, expected appreciation vs assumption]

## Scenario Analysis
[3 scenarios — Base (${inputs.expected_annual_appreciation}%/yr apprec), Bear (0% apprec, -15% rent, +2% rate), Bull (+12% apprec) — with estimated IRR for each]

## Exit Strategy
[Specific exit timing recommendation, expected buyer profile, liquidity considerations, LTCG optimization strategy]

## Recommendation
[Final verdict with conditions — what must go right, what would change the call, specific action items for the investor]`;
  };

  const generate = async () => {
    setState("loading");
    setStreamText("");
    setMemo(null);
    setErrorMsg("");

    try {
      const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://propinvest-ai-production.up.railway.app";
      const response = await fetch(`${BACKEND}/generate-memo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });

      if (!response.ok) throw new Error(`API error ${response.status}`);
      if (!response.body)  throw new Error("No response body");

      setState("streaming");
      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const raw = trimmed.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;

          try {
            const parsed = JSON.parse(raw);

            // ── FIX: handle ALL possible Gemini / OpenAI streaming shapes ──
            const delta =
              // Gemini REST streaming: candidates[0].content.parts[0].text
              parsed?.candidates?.[0]?.content?.parts?.[0]?.text ??
              // Gemini via delta wrapper (some proxy versions)
              parsed?.delta?.text ??
              // OpenAI-style delta
              parsed?.choices?.[0]?.delta?.content ??
              // Generic content array (Anthropic style)
              parsed?.content?.[0]?.text ??
              // Plain text field
              parsed?.text ??
              "";

            if (delta) {
              fullText += delta;
              setStreamText(fullText);
            }
          } catch {
            // malformed JSON chunk — skip silently
          }
        }
      }

      if (!fullText.trim()) {
        throw new Error("Gemini returned an empty response. Check GEMINI_API_KEY in Railway Variables.");
      }

      // Parse streamed markdown into structured sections
      const sections = parseMemoSections(fullText);
      const verdict  =
        metrics.irr >= 15 && metrics.dscr >= 1.2 ? "Strong Buy" :
        metrics.irr >= 10 && metrics.dscr >= 1.0  ? "Buy"        :
        metrics.irr >= 7                           ? "Hold"       : "Avoid";

      setMemo({
        property: `${propName}${city ? ` — ${city}` : ""}`,
        date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
        verdict,
        sections,
      });
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Generation failed");
      setState("error");
    }
  };

  // ── PDF export using jsPDF + html2canvas — works on iOS Safari ────────────
  const exportPDF = async () => {
    if (!memoRef.current) return;

    // Temporarily remove max-height/overflow so html2canvas captures full content
    const el = memoRef.current;
    const prevMaxH = el.style.maxHeight;
    const prevOverflow = el.style.overflow;
    el.style.maxHeight = "none";
    el.style.overflow = "visible";

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;

      // Header
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("PropInvest AI — Investment Memorandum", pdfW / 2, 14, { align: "center" });
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Institutional-grade analysis · Not financial advice", pdfW / 2, 20, { align: "center" });

      // Add image — paginate if content is taller than one page
      const margin = 10;
      const contentTop = 25;
      const availH = pdfH - contentTop - margin;

      if (imgH <= availH) {
        pdf.addImage(imgData, "PNG", margin, contentTop, pdfW - margin * 2, imgH);
      } else {
        // Multi-page: slice the canvas across pages
        let yOffset = 0;
        let isFirst = true;
        while (yOffset < imgH) {
          if (!isFirst) pdf.addPage();
          const sliceH = Math.min(availH, imgH - yOffset);
          pdf.addImage(imgData, "PNG", margin, isFirst ? contentTop : margin, pdfW - margin * 2, imgH, "", "FAST", 0, -(yOffset));
          yOffset += sliceH;
          isFirst = false;
        }
      }

      const filename = `propinvest-memo-${(memo?.property || "property").replace(/\s+/g, "-").toLowerCase()}.pdf`;
      pdf.save(filename);
    } finally {
      // Restore styles
      el.style.maxHeight = prevMaxH;
      el.style.overflow = prevOverflow;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            📄 AI Investment Memo
            <Tooltip
              content="Generates a professional private equity-style investment memorandum using AI — covering investment thesis, risks, financial summary, market outlook, scenario analysis, exit strategy, and final recommendation. Exportable as PDF."
              maxWidth={320}
            />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional-grade PE memo · Blackstone / McKinsey style · PDF export
          </p>
        </div>
        <div className="flex gap-2 no-print">
          {state === "done" && (
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              ⬇ Export PDF
            </button>
          )}
          <button
            onClick={generate}
            disabled={state === "loading" || state === "streaming"}
            className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {state === "loading" ? (
              <><span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Starting…</>
            ) : state === "streaming" ? (
              <><span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Writing…</>
            ) : state === "done" ? "Regenerate Memo" : "✦ Generate Memo"}
          </button>
        </div>
      </div>

      {/* Idle */}
      {state === "idle" && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Generate Investment Memo</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            AI will write a full institutional-grade memo covering thesis, risks, financials, market outlook, scenarios, exit strategy and final recommendation.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400">
            {["Investment Thesis","Key Risks","Financial Summary","Market Outlook","Scenario Analysis","Exit Strategy","Recommendation"].map(s => (
              <span key={s} className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Streaming */}
      {(state === "loading" || state === "streaming") && (
        <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-400 border-t-primary-600" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {state === "loading" ? "Initialising AI analyst…" : "Writing memo…"}
            </span>
            <span className="text-xs text-slate-400 ml-auto">{propName} · {fmt(inputs.property_purchase_price)}</span>
          </div>
          {streamText ? (
            <StreamingDisplay text={streamText} />
          ) : (
            <div className="space-y-2">
              {[140, 100, 120, 80, 160, 90].map((w, i) => (
                <div key={i} className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" style={{ width: `${w}px` }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Done */}
      {state === "done" && memo && (
        <div
          ref={memoRef}
          id="propinvest-memo-print-root"
          className="rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 max-h-[70vh] overflow-y-auto"
        >
          <MemoContent memo={memo} inputs={inputs} metrics={metrics} taxAnalysis={taxAnalysis} />
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 p-4">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">⚠ Generation failed</p>
          <p className="text-xs text-rose-600 dark:text-rose-500 mt-1 font-mono">{errorMsg}</p>
          <button
            onClick={generate}
            className="mt-3 rounded-lg bg-rose-100 dark:bg-rose-900/30 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-200 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Info note */}
      {state === "idle" && (
        <div className="mt-3 flex items-start gap-2 text-[10px] text-slate-400">
          <span className="flex-shrink-0">ℹ</span>
          <span>Memo uses all computed metrics (IRR, DSCR, Cap Rate, NPV, tax analysis) plus city market data. Generation takes ~15–20 seconds.</span>
        </div>
      )}
    </div>
  );
}
