"use client";
// src/components/PosthogProvider.tsx
// Drop this in your root layout — tracks page views + clicks automatically
// Get your key from posthog.com (free, no credit card)

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    posthog?: {
      init: (key: string, options: object) => void;
      capture: (event: string, properties?: object) => void;
      identify: (id: string, properties?: object) => void;
      reset: () => void;
    };
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = "https://app.posthog.com";

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!POSTHOG_KEY) return;

    // Load Posthog script once
    if (!window.posthog) {
      const script = document.createElement("script");
      script.src = `${POSTHOG_HOST}/static/array.js`;
      script.async = true;
      script.onload = () => {
        window.posthog?.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          capture_pageview: false, // we do it manually below
          capture_pageleave: true,
          autocapture: true,        // tracks all clicks automatically
          persistence: "localStorage",
        });
      };
      document.head.appendChild(script);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!window.posthog) return;
    window.posthog.capture("$pageview", {
      $current_url: window.location.href,
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// ── Helper: track custom events anywhere in the app ─────────────────────────
// Usage: trackEvent("analyze_clicked", { city: "Mumbai", price: 10000000 })
export function trackEvent(event: string, properties?: object) {
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.capture(event, properties);
  }
}

// ── Helper: identify signed-in users ────────────────────────────────────────
// Call this after Google Sign-In:
// identifyUser(user.id, { email: user.email, name: user.name })
export function identifyUser(id: string, properties?: object) {
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.identify(id, properties);
  }
}
