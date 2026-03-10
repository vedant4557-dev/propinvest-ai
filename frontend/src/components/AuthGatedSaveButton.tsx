"use client";
// src/components/AuthGatedSaveButton.tsx
// Self-contained — gates Save behind Google Sign-In
// If not signed in → shows auth prompt instead of silently failing

import { useState } from "react";

interface AuthGatedSaveButtonProps {
  isSignedIn: boolean;
  isSaved: boolean;
  onSave: () => Promise<void>;
  onUnsave: () => Promise<void>;
  onSignInRequired: () => void; // trigger your existing Google Sign-In flow
  size?: "sm" | "md";
  label?: boolean; // show text label
}

export default function AuthGatedSaveButton({
  isSignedIn,
  isSaved,
  onSave,
  onUnsave,
  onSignInRequired,
  size = "md",
  label = true,
}: AuthGatedSaveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  async function handleClick() {
    // Not signed in → trigger auth modal
    if (!isSignedIn) {
      onSignInRequired();
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        await onUnsave();
      } else {
        await onSave();
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  const isSmall = size === "sm";

  // Not signed in — show lock prompt
  if (!isSignedIn) {
    return (
      <button
        onClick={onSignInRequired}
        title="Sign in to save properties to your portfolio"
        className={`
          flex items-center gap-1.5 font-semibold rounded-xl transition-all duration-200
          border-2 border-dashed border-slate-300 text-slate-400
          hover:border-green-400 hover:text-green-600 hover:bg-green-50
          ${isSmall ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {label && "Sign in to Save"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={isSaved ? "Remove from portfolio" : "Save to portfolio"}
      className={`
        flex items-center gap-1.5 font-semibold rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isSmall ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}
        ${isSaved
          ? "bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-red-500 hover:shadow-red-200"
          : justSaved
          ? "bg-green-100 text-green-700 border-2 border-green-300"
          : "bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-400"
        }
      `}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : isSaved ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3-7 3V5z" />
        </svg>
      )}
      {label && (
        justSaved ? "Saved ✓" : isSaved ? "Saved" : "Save"
      )}
    </button>
  );
}
