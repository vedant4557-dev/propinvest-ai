import type { Metadata } from "next";
import ProjectsPage from "./_components/ProjectsPage";

export const metadata: Metadata = {
  title: "Indian Real Estate Project Database — 300+ Projects Analysed",
  description: "Browse and analyse 300+ Indian real estate projects from DLF, Lodha, Prestige, Brigade, Sobha, Godrej and more. Click any project for instant investment analysis — IRR, yield, risk score.",
  keywords: ["Indian real estate projects", "Lodha investment analysis", "Prestige Group returns", "DLF property investment", "Brigade Group analysis", "Sobha Limited investment", "Godrej Properties returns"],
  alternates: { canonical: "https://propinvest-ai-smoky.vercel.app/projects" },
  openGraph: {
    title: "Indian Real Estate Project Database — PropInvest AI",
    description: "300+ projects from India's top developers. Instant investment analysis for every project.",
    url: "https://propinvest-ai-smoky.vercel.app/projects",
  },
};

export default function Page() {
  return <ProjectsPage />;
}
