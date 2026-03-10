// src/app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — PropInvest AI",
  description: "Terms of Service for PropInvest AI, the AI-powered Indian real estate investment analyzer.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</div>
            <span className="text-white font-bold">PropInvest AI</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: March 2026</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using PropInvest AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Description of Service</h2>
            <p>PropInvest AI is an AI-powered real estate investment analysis tool designed for the Indian property market. The Service provides financial metrics, projections, and AI-generated analysis including IRR, DSCR, NPV, Monte Carlo simulations, and investment memoranda.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Not Financial Advice</h2>
            <p className="text-amber-400 font-medium">All analysis, projections, and AI-generated content provided by PropInvest AI are for informational and educational purposes only. Nothing on this platform constitutes financial, investment, legal, or tax advice.</p>
            <p className="mt-2">You should consult a qualified financial advisor, chartered accountant, or real estate professional before making any investment decisions. Past projections are not indicative of future results.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. User Accounts</h2>
            <p>You may sign in using Google OAuth. You are responsible for maintaining the confidentiality of your account. You agree to provide accurate information and to notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, scrape, or abuse the API</li>
              <li>Resell or commercialise outputs without permission</li>
              <li>Transmit malicious code or interfere with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Subscription and Payments</h2>
            <p>Pro subscriptions are processed via Razorpay. Subscription fees are charged in Indian Rupees (INR). Refunds are provided at our discretion within 7 days of purchase if the Service has not been materially used. Subscriptions auto-renew unless cancelled.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Intellectual Property</h2>
            <p>All content, branding, and software comprising PropInvest AI is owned by or licensed to us. You retain ownership of data you input into the Service. AI-generated outputs may be used for personal or internal business purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, PropInvest AI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including financial losses from investment decisions made using our analysis.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Modifications</h2>
            <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Governing Law</h2>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of India.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Contact</h2>
            <p>For questions about these Terms, please contact us at <a href="mailto:support@propinvest.ai" className="text-green-400 hover:text-green-300">support@propinvest.ai</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex gap-6 text-sm">
          <Link href="/privacy" className="text-green-400 hover:text-green-300">Privacy Policy</Link>
          <Link href="/app" className="text-slate-400 hover:text-white">Back to App</Link>
        </div>
      </div>
    </div>
  );
}
