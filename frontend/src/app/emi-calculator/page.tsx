import type { Metadata } from "next";
import EMIPage from "./_components/EMIPage";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator India 2025 — With Amortization Schedule",
  description: "Free home loan EMI calculator for India. Calculate monthly EMI, total interest, and full amortization schedule for SBI, HDFC, ICICI, Kotak and all major banks. Compare tenure options instantly.",
  keywords: ["home loan EMI calculator India", "housing loan EMI calculator", "SBI home loan EMI", "HDFC home loan calculator", "mortgage calculator India", "loan amortization schedule India", "EMI calculator 2025"],
  alternates: { canonical: "https://propinvest-ai-smoky.vercel.app/emi-calculator" },
  openGraph: {
    title: "Home Loan EMI Calculator India 2025 — Free, Instant",
    description: "Calculate EMI for any home loan amount, rate and tenure. Compare SBI, HDFC, ICICI rates. Full amortization schedule included.",
    url: "https://propinvest-ai-smoky.vercel.app/emi-calculator",
  },
};

export default function Page() {
  return <EMIPage />;
}
