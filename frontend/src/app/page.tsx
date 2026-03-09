"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "18+",  label: "Financial metrics computed" },
  { value: "10K+", label: "Monte Carlo simulations" },
  { value: "6",    label: "Indian cities covered" },
  { value: "100%", label: "Free, no sign-up required" },
];

const FEATURES = [
  {
    icon: "◈",
    title: "Institutional-Grade IRR Engine",
    desc: "Full DCF model with Monte Carlo simulation across 10,000 scenarios. Pre-tax and post-tax IRR, NPV at your hurdle rate, equity multiple, and payback period — the same metrics a PE fund uses.",
    tag: "Core Engine",
  },
  {
    icon: "⬡",
    title: "Real Estate vs. Nifty 50",
    desc: "The question every Indian investor has — finally answered quantitatively. Compare your property against Nifty50, Mutual Funds, FD, and Gold over 20 years. Adjustable return assumptions, bull/base/bear scenarios.",
    tag: "Comparator",
  },
  {
    icon: "◎",
    title: "20-Year Wealth Builder",
    desc: "Project your net worth trajectory. FIRE date calculator. Passive income timeline. Model a portfolio of up to 10 properties and see the compounding effect on your financial independence.",
    tag: "Wealth Projection",
  },
  {
    icon: "△",
    title: "AI Investment Memo",
    desc: "One click generates a Blackstone-style investment memo — Investment Thesis, Key Risks, Market Outlook, Scenario Analysis, Exit Strategy. Export to PDF. Send to your CA or partner.",
    tag: "AI-Powered",
  },
  {
    icon: "◻",
    title: "Tax & Structuring Engine",
    desc: "India-specific: Sec 24(b) interest deduction, LTCG with indexation, stamp duty capitalisation, rental income tax. Post-tax IRR is often 200–300bps different from pre-tax — most investors ignore this.",
    tag: "Tax Analysis",
  },
  {
    icon: "⬢",
    title: "Stress Testing & Scenarios",
    desc: "What if rates rise 2%? What if you can't rent for 6 months? What if appreciation stalls at zero? DSCR breakeven rate, vacancy shock, appreciation sensitivity — know your worst-case before you buy.",
    tag: "Risk Engine",
  },
];

const CITIES = [
  { name: "Mumbai",    avg: "₹1.8–3.5Cr",  yield: "2.5–3.5%", growth: "6–8%"  },
  { name: "Bangalore", avg: "₹80L–1.8Cr",  yield: "3.5–5%",   growth: "7–10%" },
  { name: "Hyderabad", avg: "₹70L–1.5Cr",  yield: "3–4.5%",   growth: "8–11%" },
  { name: "Pune",      avg: "₹45L–1.1Cr",  yield: "4–5.5%",   growth: "6–8%"  },
  { name: "Delhi NCR", avg: "₹80L–2.5Cr",  yield: "2.5–3.5%", growth: "5–7%"  },
  { name: "Ahmedabad", avg: "₹35L–90L",    yield: "4.5–6%",   growth: "6–8%"  },
];

const TESTIMONIALS = [
  {
    quote: "Saved me from a terrible investment. The stress test showed my DSCR would drop below 1 if rates hit 10%. My CA had no idea about this.",
    name: "Rahul M.",
    role: "Software Engineer, Bangalore",
    avatar: "RM",
  },
  {
    quote: "I compared 4 Mumbai properties side by side. Found out the 'cheaper' one had a 3% lower IRR due to stamp duty and higher maintenance. Worth every second.",
    name: "Priya S.",
    role: "Startup Founder, Mumbai",
    avatar: "PS",
  },
  {
    quote: "The Nifty vs Real Estate comparator is eye-opening. My Hyderabad flat beats the index at 12% Nifty CAGR but not at 15%. Now I actually understand my decision.",
    name: "Vikram N.",
    role: "Finance Professional, Hyderabad",
    avatar: "VN",
  },
];

const PROCESS = [
  { step: "01", title: "Enter property details",      desc: "Purchase price, loan terms, expected rent, city, appreciation assumption. Takes 2 minutes." },
  { step: "02", title: "Instant full analysis",       desc: "18+ metrics computed in under 3 seconds. IRR, DSCR, Cap Rate, NPV, stress tests, tax analysis." },
  { step: "03", title: "Explore scenarios",           desc: "Monte Carlo simulation, rate shock, vacancy stress, renovation model, 20-year wealth projection." },
  { step: "04", title: "Share or export",             desc: "One-click shareable link to send to co-investors. Export PDF investment memo for your CA." },
];

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="text-4xl font-black text-sky-400 tracking-tight font-display">{value}</div>
      <div className="text-sm text-slate-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

// ─── Floating metric card ────────────────────────────────────────────────────

function MetricCard({ label, value, delta, color }: { label: string; value: string; delta?: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3.5 min-w-[130px]">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
      {delta && <p className="text-[10px] text-emerald-400 mt-0.5">{delta}</p>}
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/90 backdrop-blur border-b border-white/10" : ""}`}>
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white text-sm font-black">P</div>
          <span className="text-white font-bold text-lg tracking-tight">
            PropInvest <span className="text-sky-400">AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#cities" className="hover:text-white transition-colors">Cities</a>
          <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
          <Link href="/emi-calculator" className="hover:text-white transition-colors">EMI Calc</Link>
        </div>
        <Link
          href="/app"
          className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/25"
        >
          Analyse a Property →
        </Link>
      </div>
    </nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .font-display { font-family: 'DM Serif Display', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        body          { font-family: 'DM Sans', sans-serif; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .glow-sky {
          box-shadow: 0 0 80px -20px rgba(14,165,233,0.3);
        }
        .glow-text {
          text-shadow: 0 0 80px rgba(14,165,233,0.4);
        }
        .feature-card:hover {
          background: rgba(14,165,233,0.06);
          border-color: rgba(14,165,233,0.3);
          transform: translateY(-2px);
        }
        .feature-card { transition: all 0.2s ease; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float2 8s ease-in-out infinite 1s; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up-1 { animation: slideUp 0.7s ease forwards 0.1s; opacity: 0; }
        .slide-up-2 { animation: slideUp 0.7s ease forwards 0.3s; opacity: 0; }
        .slide-up-3 { animation: slideUp 0.7s ease forwards 0.5s; opacity: 0; }
        .slide-up-4 { animation: slideUp 0.7s ease forwards 0.7s; opacity: 0; }
        .slide-up-5 { animation: slideUp 0.7s ease forwards 0.9s; opacity: 0; }
      `}</style>

      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative grid-bg min-h-screen flex items-center pt-20">
        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <div className="slide-up-1 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-400 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                Institutional-grade analysis · Free · No sign-up
              </div>

              <h1 className="slide-up-2 font-display text-5xl lg:text-6xl xl:text-7xl leading-[1.05] text-white mb-6 glow-text">
                Stop guessing.<br />
                <em className="text-sky-400 not-italic">Analyse</em> your<br />
                real estate deal.
              </h1>

              <p className="slide-up-3 text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
                The only tool that gives Indian property investors the same financial rigour
                as a private equity fund — IRR, Monte Carlo, stress tests, tax engine,
                and AI memos. In under 3 seconds.
              </p>

              <div className="slide-up-4 flex flex-wrap gap-4">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-7 py-3.5 text-base font-bold text-white hover:bg-sky-400 transition-all shadow-xl shadow-sky-500/30 hover:shadow-sky-400/40 hover:-translate-y-0.5"
                >
                  Analyse a Property Free
                  <span className="text-sky-200">→</span>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-base font-medium text-white hover:bg-white/5 transition-all"
                >
                  See how it works
                </a>
              </div>

              <div className="slide-up-5 mt-10 flex flex-wrap gap-6">
                {["No spreadsheet needed", "No sign-up", "Shareable reports"].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="text-emerald-400 text-xs">✓</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating dashboard mockup */}
            <div className="relative hidden lg:block">
              <div className="float-1 relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-5 shadow-2xl glow-sky">
                {/* Fake tab bar */}
                <div className="flex gap-1.5 mb-4">
                  {["Overview", "Simulation", "Tax", "Wealth"].map((t, i) => (
                    <div key={t} className={`rounded-lg px-3 py-1 text-xs font-medium ${i === 0 ? "bg-sky-500/20 text-sky-400" : "text-slate-500"}`}>{t}</div>
                  ))}
                </div>

                {/* KPI grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { l: "IRR",         v: "13.4%",  c: "text-sky-400" },
                    { l: "Post-Tax IRR",v: "11.1%",  c: "text-emerald-400" },
                    { l: "DSCR",        v: "1.24×",  c: "text-emerald-400" },
                    { l: "Cap Rate",    v: "4.2%",   c: "text-amber-400" },
                    { l: "NPV",         v: "₹18.4L", c: "text-sky-400" },
                    { l: "Future Value",v: "₹3.2Cr", c: "text-white" },
                  ].map(m => (
                    <div key={m.l} className="rounded-lg bg-white/5 p-2.5 text-center">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider">{m.l}</p>
                      <p className={`text-sm font-black mt-0.5 ${m.c}`}>{m.v}</p>
                    </div>
                  ))}
                </div>

                {/* Fake chart bars */}
                <div className="rounded-lg bg-white/5 p-3 mb-3">
                  <p className="text-[9px] text-slate-500 mb-2 uppercase tracking-wider">20-Year Wealth Projection</p>
                  <div className="flex items-end gap-1 h-20">
                    {[18, 26, 36, 48, 62, 79, 98, 119, 143, 170].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{
                          height: `${h * 0.55}%`,
                          background: `linear-gradient(to top, #0ea5e9, #38bdf8)`,
                          opacity: 0.7 + i * 0.03,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Verdict badge */}
                <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Strong Buy · Beat FD by 6.4pp</span>
                  <span className="text-emerald-400 text-sm">✓</span>
                </div>
              </div>

              {/* Floating metric cards */}
              <div className="float-2 absolute -left-12 top-1/3 space-y-2">
                <MetricCard label="Monte Carlo" value="89%" delta="chance to beat FD" color="text-sky-400" />
                <MetricCard label="Break-even" value="71.2%" delta="occupancy" color="text-amber-400" />
              </div>

              <div className="absolute -right-4 bottom-16 float-1" style={{ animationDelay: "2s" }}>
                <MetricCard label="FIRE Date" value="2039" delta="passive income target" color="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/8">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map(s => <AnimatedStat key={s.label} {...s} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 border-t border-white/8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">Process</p>
            <h2 className="font-display text-4xl lg:text-5xl text-white">Analysis in under 3 minutes</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">No spreadsheets. No CAs. No guesswork.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-0 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

            {PROCESS.map((step, i) => (
              <div key={step.step} className="relative text-center px-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-400 font-black text-lg mb-5 relative z-10">
                  {step.step}
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/app" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-4 text-base font-bold text-white hover:bg-sky-400 transition-all shadow-xl shadow-sky-500/25 hover:-translate-y-0.5">
              Try it now — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 border-t border-white/8 grid-bg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">Capabilities</p>
            <h2 className="font-display text-4xl lg:text-5xl text-white">
              What private equity firms<br />
              <em className="text-sky-400">already know</em> about your deal
            </h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
              Most Indian investors buy on gut feel, builder promises, and broker yield estimates.
              PropInvest AI gives you the rigour that Blackstone uses — on any property, in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card rounded-2xl border border-white/8 bg-white/3 p-6 cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl text-sky-400/70">{f.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 border border-slate-700 rounded-full px-2.5 py-1">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-base mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITIES ───────────────────────────────────────────────────────── */}
      <section id="cities" className="py-28 border-t border-white/8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">Market Data</p>
            <h2 className="font-display text-4xl lg:text-5xl text-white">6 Indian cities. Real benchmarks.</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">
              Built-in market benchmarks for India&apos;s top residential real estate markets.
              Compare your deal against actual city yield and appreciation averages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CITIES.map(city => (
              <div key={city.name} className="feature-card group rounded-2xl border border-white/8 bg-white/3 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">{city.name}</h3>
                  <Link href="/app" className="text-xs font-semibold text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Analyse →
                  </Link>
                </div>
                <div className="space-y-2">
                  {[
                    { l: "Typical price range", v: city.avg },
                    { l: "Gross rental yield",  v: city.yield },
                    { l: "Historical CAGR",     v: city.growth },
                  ].map(row => (
                    <div key={row.l} className="flex justify-between text-sm">
                      <span className="text-slate-400">{row.l}</span>
                      <span className="text-white font-semibold">{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/8 grid-bg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">What Investors Say</p>
            <h2 className="font-display text-4xl lg:text-5xl text-white">Better decisions.<br />Real outcomes.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl border border-white/8 bg-white/3 p-7">
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
                </div>
                <p className="text-slate-300 leading-relaxed text-sm mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xs font-bold text-sky-400">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ─────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/8">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">Comparison</p>
            <h2 className="font-display text-4xl lg:text-5xl text-white">Why not a spreadsheet?</h2>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-slate-400 font-medium">Capability</th>
                  <th className="px-6 py-4 text-slate-400 font-medium text-center">Excel / Sheets</th>
                  <th className="px-6 py-4 text-sky-400 font-bold text-center bg-sky-500/8">PropInvest AI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Monte Carlo simulation (10,000 runs)", false, true],
                  ["India-specific tax engine (Sec 24b, LTCG, indexation)", false, true],
                  ["Real estate vs Nifty/FD/Gold comparator", false, true],
                  ["AI-generated investment memo (PDF)", false, true],
                  ["FIRE / wealth projection", false, true],
                  ["Renovation value-add model", false, true],
                  ["DSCR stress testing across rate scenarios", false, true],
                  ["Shareable link for co-investors / CAs", false, true],
                  ["Setup time", "2–4 hours", "0 seconds"],
                  ["Maintenance required", "Manual", "None"],
                ].map(([cap, excel, propinvest], i) => (
                  <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/2" : ""}`}>
                    <td className="px-6 py-3.5 text-slate-300">{cap}</td>
                    <td className="px-6 py-3.5 text-center">
                      {typeof excel === "boolean"
                        ? <span className="text-slate-600 text-base">{excel ? "✓" : "✗"}</span>
                        : <span className="text-slate-400">{excel}</span>}
                    </td>
                    <td className="px-6 py-3.5 text-center bg-sky-500/5">
                      {typeof propinvest === "boolean"
                        ? <span className="text-sky-400 text-base">{propinvest ? "✓" : "✗"}</span>
                        : <span className="text-sky-400 font-semibold">{propinvest}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[400px] rounded-full bg-sky-500/8 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Your next property<br />
            deserves a <em className="text-sky-400">proper analysis.</em>
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Free forever. No spreadsheets. No CAs needed for a first pass.
            Takes 2 minutes. Saves you from a bad decision that costs lakhs.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-3 rounded-2xl bg-sky-500 px-10 py-5 text-lg font-bold text-white hover:bg-sky-400 transition-all shadow-2xl shadow-sky-500/30 hover:shadow-sky-400/40 hover:-translate-y-1"
          >
            Analyse a Property Free
            <span className="text-sky-200 text-xl">→</span>
          </Link>
          <p className="text-xs text-slate-500 mt-5">No sign-up · No credit card · Works in 2 minutes</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-white text-xs font-black">P</div>
            <span className="text-slate-400 text-sm font-medium">PropInvest AI</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            For informational purposes only. Not financial advice. Projections based on user-provided assumptions.
          </p>
          <Link href="/app" className="text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors">
            Open the app →
          </Link>
        </div>
      </footer>
    </div>
  );
}
