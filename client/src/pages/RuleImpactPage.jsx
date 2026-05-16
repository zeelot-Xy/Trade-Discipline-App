import { Crown, Lock, Sparkles, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import dashboardService from "../services/dashboardService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

const LockedInsight = ({ title, description }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
    <div className="flex items-center gap-2 text-amber-200">
      <Lock className="h-4 w-4" />
      <p className="text-sm font-semibold text-white">{title}</p>
    </div>
    <p className="mt-2 text-sm text-slate-400">{description}</p>
  </div>
);

const HighlightCard = ({ label, rule, helper, accent = "emerald", icon: Icon = Sparkles }) => {
  const accentMap = {
    emerald: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10",
    red: "text-red-300 border-red-500/20 bg-red-500/10",
    cyan: "text-cyan-300 border-cyan-500/20 bg-cyan-500/10",
    amber: "text-amber-300 border-amber-500/20 bg-amber-500/10",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${accentMap[accent]}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-4 text-lg font-semibold text-white">{rule?.label || "Not enough data"}</p>
      <p className="mt-2 text-sm text-slate-400">
        {rule ? helper(rule) : "Save more trades with checklist snapshots to unlock rule-level analysis."}
      </p>
    </div>
  );
};

export default function RuleImpactPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getRuleImpact();
        if (isMounted) {
          setReport(response);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
        <LoadingSpinner label="Loading rule impact analysis..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!report) {
    return <ErrorMessage message="Rule impact analysis could not be loaded." />;
  }

  const conditions = report.conditions || [];
  const hasTrades = report.totalTradesAnalyzed > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">
          Rule Impact Analysis
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          See which checklist rules are actually helping
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          Compare outcomes when each checklist condition was checked versus unchecked, so you can
          learn which parts of your process deserve more trust and which ones need review.
        </p>
      </section>

      {!hasTrades ? (
        <EmptyState
          title="No rule data yet"
          description="Save more checklist-backed trades so the app can compare each rule across real outcomes."
          icon={Target}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rules Analyzed"
          value={`${report.totalRulesAnalyzed}`}
          helper="Checklist conditions discovered from saved snapshots"
        />
        <StatCard
          label="Trades Analyzed"
          value={`${report.totalTradesAnalyzed}`}
          helper="Saved trades used to compute rule impact"
          accent="cyan"
        />
        <StatCard
          label="Top Positive Rule"
          value={report.accessLevel === "PRO" ? report.topPositiveRule?.label || "Not enough data" : "Pro only"}
          helper="Condition currently linked to the strongest outcomes"
          accent="emerald"
        />
        <StatCard
          label="Top Negative Rule"
          value={report.accessLevel === "PRO" ? report.topNegativeRule?.label || "Not enough data" : "Pro only"}
          helper="Condition currently linked to weaker outcomes"
          accent="amber"
        />
      </div>

      {report.accessLevel !== "PRO" ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
            <Crown className="h-3.5 w-3.5" />
            Pro Preview
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            Upgrade to analyze each rule properly
          </h2>
          <p className="mt-3 text-sm text-slate-400">{report.teaser?.description}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(report.teaser?.lockedSections || []).map((item) => (
              <LockedInsight
                key={item}
                title={item}
                description="This becomes available when Pro is active."
              />
            ))}
          </div>
          <Link
            to="/upgrade"
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Upgrade to Pro
          </Link>
        </section>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <HighlightCard
              label="Top Positive Rule"
              rule={report.topPositiveRule}
              helper={(rule) =>
                `${formatNumber(rule.winRateDelta)}% win-rate lift and ${formatCurrency(rule.pnlDelta)} P/L delta when checked`
              }
              icon={TrendingUp}
            />
            <HighlightCard
              label="Top Negative Rule"
              rule={report.topNegativeRule}
              helper={(rule) =>
                `${formatNumber(rule.winRateDelta)}% win-rate delta and ${formatCurrency(rule.pnlDelta)} P/L delta when checked`
              }
              accent="red"
              icon={TrendingDown}
            />
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
              Rule Scorecards
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Compare each checklist condition directly
            </h2>
            <div className="mt-5 space-y-4">
              {conditions.slice(0, 12).map((rule) => (
                <article
                  key={rule.key}
                  className="rounded-3xl border border-white/10 bg-slate-900/50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-white">{rule.label}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        {rule.sectionTitle} · weight {rule.weight}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Impact Score</p>
                      <p className="text-2xl font-semibold text-white">
                        {formatNumber(rule.impactScore)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        When Checked
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-slate-300">
                        <p>{rule.checked.totalTrades} trades</p>
                        <p>{formatNumber(rule.checked.winRate)}% win rate</p>
                        <p>{formatCurrency(rule.checked.netProfitLoss)} net P/L</p>
                        <p>{formatNumber(rule.checked.avgConfluence)}% avg confluence</p>
                        <p>{formatNumber(rule.checked.avgDiscipline)}% avg discipline</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        When Unchecked
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-slate-300">
                        <p>{rule.unchecked.totalTrades} trades</p>
                        <p>{formatNumber(rule.unchecked.winRate)}% win rate</p>
                        <p>{formatCurrency(rule.unchecked.netProfitLoss)} net P/L</p>
                        <p>{formatNumber(rule.unchecked.avgConfluence)}% avg confluence</p>
                        <p>{formatNumber(rule.unchecked.avgDiscipline)}% avg discipline</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Win Rate Delta</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatNumber(rule.winRateDelta)}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">P/L Delta</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatCurrency(rule.pnlDelta)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Discipline Delta</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatNumber(rule.disciplineDelta)}%
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
              Rule Verdict
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              What to do with these patterns
            </h2>
            <div className="mt-5 space-y-3">
              {(report.recommendation || []).map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
