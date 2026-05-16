import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarRange,
  Camera,
  CheckCircle2,
  Crown,
  FileSpreadsheet,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

import LoadingSpinner from "../components/LoadingSpinner.jsx";
import TradeCadetLogo from "../components/TradeCadetLogo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Checklist-first execution",
    text: "Validate the setup before the trade, not after the mistake. TradeCadet turns discipline into a repeatable workflow.",
  },
  {
    icon: BarChart3,
    title: "Behavior-aware reviews",
    text: "Track confluence, discipline score, emotions, and mistake tags so you can tell whether losses came from the market or your behavior.",
  },
  {
    icon: Camera,
    title: "Visual trade case studies",
    text: "Attach before-and-after screenshots plus TradingView links so every trade becomes a reviewable story, not just a number.",
  },
  {
    icon: FileSpreadsheet,
    title: "Import real history honestly",
    text: "Bring in historical trades through CSV and MT4/MT5 statements without inventing fake checklist data for trades you did not journal live.",
  },
];

const valuePoints = [
  "Weighted setup scoring across Trend, Swing, and Scalping workflows",
  "Trade journaling with screenshots, notes, emotions, and outcome correction flow",
  "Weekly review, strategy review, and rule-impact analysis for deeper insight",
  "Free plan for early use and Pro features for disciplined growth",
];

const workflowSteps = [
  {
    icon: BookOpenCheck,
    title: "Record the setup",
    text: "Use the checklist, risk confirmations, and planned trade details before pressing the trigger.",
  },
  {
    icon: Target,
    title: "Review the outcome",
    text: "Close the trade later with result, P/L, screenshots, and mistake tags once the market has played out.",
  },
  {
    icon: CalendarRange,
    title: "Refine the process",
    text: "Use reviews and analytics to discover which strategies, rules, and behaviors are shaping your results.",
  },
];

export default function LandingPage() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]">
        <LoadingSpinner label="Loading TradeCadet..." />
      </div>
    );
  }

  const primaryHref = user ? "/checklist" : "/register";
  const primaryLabel = user ? "Open App" : "Get Started";
  const secondaryHref = user ? "/dashboard" : "/login";
  const secondaryLabel = user ? "View Dashboard" : "Log In";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <TradeCadetLogo showWordmark subtitle="Trading Journal" />

          <nav className="hidden items-center gap-3 lg:flex">
            <a
              href="#features"
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Workflow
            </a>
            <a
              href="#pricing"
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to={secondaryHref}
              className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-emerald-400/30 hover:text-white sm:inline-flex"
            >
              {secondaryLabel}
            </Link>
            <Link
              to={primaryHref}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:pb-24 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              TradeCadet Journal
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight text-white lg:text-6xl">
              A disciplined trading journal for recording, reviewing, and refining every trade.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Stop guessing whether your strategy failed or your process did. TradeCadet helps you
              journal trade quality before entry, track behavior after exit, and review the
              patterns shaping your edge.
            </p>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.32em] text-emerald-300/80">
              Record. Review. Refine.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={primaryHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={secondaryHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:border-emerald-400/30"
              >
                {secondaryLabel}
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {valuePoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
                    Discipline Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Trade quality, not just P/L</h2>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100">
                  Pro Insight
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Confluence</p>
                  <p className="mt-3 text-3xl font-semibold text-white">78%</p>
                  <p className="mt-2 text-sm text-slate-400">Strong setup quality before entry</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Discipline</p>
                  <p className="mt-3 text-3xl font-semibold text-emerald-300">62%</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Weaker process due to hesitation and weak post-trade review
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">What this means</p>
                <p className="mt-3 text-sm text-slate-300">
                  TradeCadet helps you separate a bad setup from bad execution, so your review is
                  grounded in behavior instead of emotion.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Weekly Review
                </div>
                <p className="mt-4 text-lg font-semibold text-white">
                  See your best strategy, most repeated mistake, and weekly recommendation in one place.
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-100">
                  <Crown className="h-3.5 w-3.5" />
                  Pro Ready
                </div>
                <p className="mt-4 text-lg font-semibold text-white">
                  Free gets you started. Pro unlocks deeper reviews, imports, screenshots, and strategy insight.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-white/10 bg-slate-950/45">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Features</p>
            <h2 className="mt-3 text-4xl font-semibold text-white">
              Built for traders who want proof, not just trade logs
            </h2>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {featureCards.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="inline-flex rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-100">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Workflow</p>
          <h2 className="mt-3 text-4xl font-semibold text-white">
            Train your trades in three clear steps
          </h2>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-100">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-t border-white/10 bg-slate-950/45">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl lg:p-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Pricing</p>
                  <h2 className="mt-3 text-4xl font-semibold text-white">
                    Start simple, upgrade when you want deeper discipline insight
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                    TradeCadet is designed so the upgrade feels like more understanding, not just
                    more storage. Start on the free plan, then unlock the review layers that help
                    you refine your edge.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Free</p>
                    <p className="mt-4 text-3xl font-semibold text-white">25 Trades</p>
                    <ul className="mt-4 space-y-3 text-sm text-slate-300">
                      <li>Checklist journaling</li>
                      <li>Confluence scoring</li>
                      <li>Basic dashboard and history</li>
                    </ul>
                  </div>
                  <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Pro</p>
                    <p className="mt-4 text-3xl font-semibold text-white">Deeper Insight</p>
                    <ul className="mt-4 space-y-3 text-sm text-emerald-50">
                      <li>Unlimited trades</li>
                      <li>Discipline score and mistake analysis</li>
                      <li>Imports, screenshots, and review pages</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={primaryHref}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/upgrade"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:border-emerald-400/30"
                >
                  Explore Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
