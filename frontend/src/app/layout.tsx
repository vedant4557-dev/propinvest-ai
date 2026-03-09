import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://propinvest-ai-smoky.vercel.app";
const SITE_NAME = "PropInvest AI";
const DEFAULT_TITLE = "PropInvest AI — Real Estate Investment Analyzer India";
const DEFAULT_DESCRIPTION = "India's most powerful free real estate investment analyzer. Compute IRR, DSCR, Monte Carlo risk, tax savings, and 18+ metrics for any Indian property in 3 seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s | PropInvest AI" },
  description: DEFAULT_DESCRIPTION,
  keywords: ["real estate investment calculator India","property investment analyzer","IRR calculator India","rental yield calculator","home loan EMI calculator","real estate ROI India","property investment returns","DSCR calculator","Mumbai property investment","Bangalore real estate returns","Hyderabad property analysis"],
  authors: [{ name: "PropInvest AI" }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: { type: "website", locale: "en_IN", url: SITE_URL, siteName: SITE_NAME, title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "PropInvest AI" }] },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: [`${SITE_URL}/og-image.png`] },
  alternates: { canonical: SITE_URL },
};

const orgSchema = {
  "@context": "https://schema.org", "@type": "WebApplication", name: "PropInvest AI", url: SITE_URL,
  description: DEFAULT_DESCRIPTION, applicationCategory: "FinanceApplication", operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  featureList: ["IRR Calculator","DSCR Calculator","Monte Carlo Risk Analysis","Tax Savings Calculator","Rental Yield Calculator","Home Loan EMI Calculator","Nifty 50 Comparator","AI Investment Memo"],
  areaServed: "IN", inLanguage: "en-IN",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
