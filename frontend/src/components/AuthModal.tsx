"use client";

import { useEffect } from "react";

interface AuthModalProps {
  onGoogleSignIn: () => void;
  onClose: () => void;
  reason?: "save_limit" | "general";
}

export function AuthModal({ onGoogleSignIn, onClose, reason = "general" }: AuthModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-primary-500 to-violet-500" />

        <div className="p-6">
          {/* Icon + close */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30">
              <span className="text-2xl">
                {reason === "save_limit" ? "💾" : "☁️"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          {reason === "save_limit" ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Free limit reached
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                You&apos;ve saved 3 deals (the free limit). Sign in with Google to save unlimited deals to the cloud — accessible from any device, forever.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Save deals to the cloud
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Sign in to sync your portfolio across devices. Your existing saved deals will be migrated automatically.
              </p>
            </>
          )}

          {/* Benefits */}
          <div className="mt-4 space-y-2">
            {[
              { icon: "♾️", text: "Unlimited saved deals" },
              { icon: "📱", text: "Access from any device" },
              { icon: "🔄", text: "Auto-sync, never lose a deal" },
              { icon: "📊", text: "Portfolio dashboard coming soon" },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          {/* Google sign-in button */}
          <button
            onClick={onGoogleSignIn}
            className="mt-6 w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm hover:shadow-md"
          >
            {/* Google logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            Free forever · No credit card needed
          </p>
        </div>
      </div>
    </div>
  );
}
