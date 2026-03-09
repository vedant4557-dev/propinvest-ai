import type { Metadata } from "next";
import LandingPage from "./_components/LandingPage";

export const metadata: Metadata = {
  title: "PropInvest AI — Real Estate Investment Analyzer India",
  description: "Free AI-powered tool to analyse any Indian property investment. Compute IRR, cash-on-cash return, DSCR, Monte Carlo risk, tax savings, and compare against Nifty 50. Used by 10,000+ Indian investors.",
  alternates: { canonical: "https://propinvest-ai-smoky.vercel.app" },
  openGraph: {
    title: "PropInvest AI — Real Estate Investment Analyzer India",
    description: "Should you buy that flat in Bangalore or Hyderabad? Get institutional-grade analysis in 3 seconds. Free, no sign-up.",
    url: "https://propinvest-ai-smoky.vercel.app",
    type: "website",
  },
};

export default function Page() {
  return <LandingPage />;
}
