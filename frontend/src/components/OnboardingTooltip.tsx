"use client";
// src/components/OnboardingTooltip.tsx
// Shows a 3-step onboarding flow for first-time users
// Dismisses permanently via localStorage flag
// Self-contained — drop anywhere in AppPage

import { useState, useEffect } from "react";

const STORAGE_KEY = "propinvest_onboarded_v1";

const STEPS = [
  {
    step: 1,
    emoji: "🏠",
    title: "Enter property details",
    body: "Add the property price, city, area, and rental income on the left panel.",
    anchor: "left", // hint for layout positioning
  },
  {
    step: 2,
    emoji: "⚡",
    title: "Click Analyze Investment",
    body: "We'll instantly compute IRR, DSCR, NPV, Monte Carlo simulations, and tax analysis.",
    anchor: "left",
  },
  {
    step: 3,
    emoji: "📄",
    title: "Get your AI Memo",
    body: "Head to the Wealth tab and generate an institutional-grade investment memorandum. Export as PDF.",
    anchor: "right",
  },
];

export function OnboardingTooltip() {
  const [step, setStep] = useState(0); // 0 = not started
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        // Show after 1s delay so page loads first
        const t = setTimeout(() => {
          setStep(1);
          setVisible(true);
        }, 1000);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage blocked (private browsing) — skip onboarding
    }
  }, []);

  function next() {
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  }

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  if (!visible || step === 0) return null;

  const current = STEPS[step - 1];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Tooltip card */}
      <div className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5">
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-4">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s.step === step
                    ? "w-6 bg-green-500"
                    : s.step < step
                    ? "w-3 bg-green-300"
                    : "w-3 bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex gap-3 items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-xl flex-shrink-0">
              {current.emoji}
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-0.5">
                Step {current.step} of {STEPS.length}
              </p>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {current.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {current.body}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={next}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              {step < STEPS.length ? "Next →" : "Got it!"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
