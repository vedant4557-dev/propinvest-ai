"use client";

import { useState, useRef, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

interface UserMenuProps {
  user: User;
  dealCount: number;
  syncing: boolean;
  onSignOut: () => void;
  onSignIn: () => void;
}

export function UserMenu({ user, dealCount, syncing, onSignOut, onSignIn }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const name   = (user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "User";
  const email  = user.email ?? "";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 pr-2 transition-colors"
      >
        {avatar ? (
          <img src={avatar} alt={name} className="h-7 w-7 rounded-full object-cover ring-2 ring-primary-500/30" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary-500/30">
            {initials}
          </div>
        )}
        {/* Cloud sync indicator */}
        <span className={`text-[10px] font-medium ${syncing ? "text-amber-500" : "text-emerald-500"}`}>
          {syncing ? "⟳" : "☁"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{name}</p>
                <p className="text-xs text-slate-400 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-2.5 text-center">
                <p className="text-lg font-black text-primary-600 dark:text-primary-400">{dealCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Saved Deals</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-2.5 text-center">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {syncing ? "⟳" : "✓"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{syncing ? "Syncing…" : "Cloud Synced"}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <span>↩</span> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sign-in button (shown when not logged in) ────────────────────────────────

export function SignInButton({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium ${
        compact ? "px-2 py-1.5 text-xs" : "px-3 py-1.5 text-xs"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      <span className="hidden sm:inline">Sign in</span>
      <span className="sm:hidden">☁</span>
    </button>
  );
}
