// src/app/not-found.tsx
// Branded 404 page for PropInvest AI

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-black text-2xl">P</span>
        </div>

        {/* 404 */}
        <p className="text-green-500 text-sm font-bold uppercase tracking-widest mb-2">
          404 — Page Not Found
        </p>
        <h1 className="text-3xl font-black text-white mb-3">
          This property doesn't exist
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          The page you're looking for has been removed, moved, or never existed.
          Let's get you back to analyzing real estate.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/app"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors text-sm"
          >
            Go to App →
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
