import type { Metadata } from "next";
import AppPage from "./_components/AppPage";

export const metadata: Metadata = {
  title: "Property Investment Analyzer — IRR, DSCR, Monte Carlo, Tax",
  description: "Analyse any Indian property investment in seconds. Enter your deal parameters and get IRR, cash-on-cash return, DSCR, Monte Carlo stress tests, tax savings, and AI-generated investment memo.",
  alternates: { canonical: "https://propinvest-ai-smoky.vercel.app/app" },
  openGraph: {
    title: "PropInvest AI Analyzer — 18+ Metrics for Indian Real Estate",
    description: "Institutional-grade property analysis free for Indian retail investors. IRR, DSCR, Monte Carlo, tax engine, Nifty comparator.",
    url: "https://propinvest-ai-smoky.vercel.app/app",
  },
};

export default function Page() {
  return <AppPage />;
}
