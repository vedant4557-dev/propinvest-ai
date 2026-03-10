// src/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — PropInvest AI",
  description: "Privacy Policy for PropInvest AI — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">P</div>
            <span className="text-white font-bold">PropInvest AI</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: March 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Account data:</strong> Name, email address, and profile picture from Google OAuth when you sign in</li>
              <li><strong className="text-white">Usage data:</strong> Property inputs you enter for analysis (price, city, area, etc.)</li>
              <li><strong className="text-white">Saved deals:</strong> Investment analyses you choose to save to your portfolio</li>
              <li><strong className="text-white">Analytics data:</strong> Page views, feature usage, and interaction events via Posthog</li>
              <li><strong className="text-white">Payment data:</strong> Subscription status via Razorpay (we do not store card details)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve the investment analysis Service</li>
              <li>To sync your saved deals across devices when signed in</li>
              <li>To process subscription payments</li>
              <li>To send product updates and portfolio digests (if opted in)</li>
              <li>To understand how users interact with the product and improve it</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Data Storage</h2>
            <p>Your data is stored securely in Supabase (PostgreSQL), hosted on AWS infrastructure. Property inputs and saved deals are stored in your account. We use industry-standard encryption in transit (HTTPS/TLS) and at rest.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Google OAuth</strong> — for authentication</li>
              <li><strong className="text-white">Supabase</strong> — for database and auth</li>
              <li><strong className="text-white">Razorpay</strong> — for payment processing</li>
              <li><strong className="text-white">Google Gemini AI</strong> — for AI-generated memo content (property inputs are sent to Google's API)</li>
              <li><strong className="text-white">Posthog</strong> — for product analytics</li>
              <li><strong className="text-white">Vercel</strong> — for frontend hosting</li>
              <li><strong className="text-white">Railway</strong> — for backend hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. AI Analysis & Data</h2>
            <p>When you generate an AI Investment Memo, your property inputs (city, price, area, financial parameters) are sent to Google&apos;s Gemini API to generate the analysis. We do not send personally identifiable information to the AI. Please do not enter sensitive personal data into the analysis form.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. Analytics cookies (Posthog) are used to understand product usage. You can disable analytics cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your saved deals</li>
              <li>Opt out of marketing emails</li>
            </ul>
            <p className="mt-2">To exercise these rights, email <a href="mailto:support@propinvest.ai" className="text-green-400 hover:text-green-300">support@propinvest.ai</a></p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>PropInvest AI is not intended for users under 18 years of age. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Contact</h2>
            <p>For privacy questions or data requests: <a href="mailto:support@propinvest.ai" className="text-green-400 hover:text-green-300">support@propinvest.ai</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex gap-6 text-sm">
          <Link href="/terms" className="text-green-400 hover:text-green-300">Terms of Service</Link>
          <Link href="/app" className="text-slate-400 hover:text-white">Back to App</Link>
        </div>
      </div>
    </div>
  );
}
