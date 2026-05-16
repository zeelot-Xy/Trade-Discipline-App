import { BarChart3, Crown, Lock, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import dashboardService from "../services/dashboardService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import { getStrategyLabel } from "../data/checklistRules.js";
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

const ComparisonCard = ({ label, strategy, helper, accent = "emerald", icon: Icon = Sparkles }) => {
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
      <p className="mt-4 text-lg font-semibold text-white">
        {strategy ? getStrategyLabel(strategy.strategyKey) : "Not enough data"}
      </p>
      <p className="mt-2 text-sm text-slate-400">
        {strategy ? helper(strategy) : "Save more trades across your strategies to unlock this comparison."}
      </p>
    </div>
  );
};

export default function StrategyPerformancePage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getStrategyPerformance();
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
        <LoadingSpinner label="Loading strategy performance..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!report) {
    return <ErrorMessage message="Strategy performance could not be loaded." />;
  }

  const strategies = report.strategies || [];
  const hasTrades = report.totalTradesAnalyzed > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">
          Strategy Performance
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Find out which trading style is really helping you
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          Compare Trend, Swing, and Scalping side by side using real outcomes, discipline,
          mistakes, and emotional patterns from your trade journal.
        </p>
      </section>

      {!hasTrades ? (
        <EmptyState
          title="No strategy data yet"
          description="Save trades under Trend, Swing, or Scalping and this comparison page will show which style is serving you best."
          icon={BarChart3}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Strategies"
          value={`${report.totalStrategiesTracked}`}
          helper="Distinct strategy buckets tracked so far"
        />
        <StatCard
          label="Trades Analyzed"
          value={`${report.totalTradesAnalyzed}`}
          helper="All saved trades with strategy labels"
          accent="cyan"
        />
        <StatCard
          label="Best Strategy"
          value={
            report.accessLevel === "PRO" && report.comparison?.bestPerforming
              ? getStrategyLabel(report.comparison.bestPerforming.strategyKey)
              : report.accessLevel === "PRO"
                ? "Not enough data"
                : "Pro only"
          }
          helper="Highest-performing style by outcome and quality"
          accent="emerald"
        />
        <StatCard
          label="Weakest Strategy"
          value={
            report.accessLevel === "PRO" && report.comparison?.weakestPerforming
              ? getStrategyLabel(report.comparison.weakestPerforming.strategyKey)
              : report.accessLevel === "PRO"
                ? "Not enough data"
                : "Pro only"
          }
          helper="Lowest-performing style needing attention"
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
            Upgrade to compare your strategies properly
          </h2>
          <p className="mt-3 text-sm text-slate-400">{report.teaser?.description}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(report.teaser?.lockedSections || []).map((item) => (
              <LockedInsight
                key={item}
                title={item}
                description="This section becomes available when Pro is active."
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
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
                  Next Layer
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Ready to see which checklist rules drive those strategy results?
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Rule Impact Analysis goes beyond strategy labels and compares the actual conditions
                  inside your checklist snapshots.
                </p>
              </div>
              <Link
                to="/reviews/rules"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/15"
              >
                Open Rule Impact
              </Link>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <ComparisonCard
              label="Best Performing"
              strategy={report.comparison?.bestPerforming}
              helper={(strategy) =>
                `${formatCurrency(strategy.netProfitLoss)} net P/L with ${formatNumber(strategy.winRate)}% win rate`
              }
              icon={TrendingUp}
            />
            <ComparisonCard
              label="Weakest Performing"
              strategy={report.comparison?.weakestPerforming}
              helper={(strategy) =>
                `${formatCurrency(strategy.netProfitLoss)} net P/L with ${formatNumber(strategy.winRate)}% win rate`
              }
              accent="red"
              icon={TrendingDown}
            />
            <ComparisonCard
              label="Strong Discipline, Weak Outcome"
              strategy={report.comparison?.strongestDisciplineButWeakOutcome}
              helper={(strategy) =>
                `${formatNumber(strategy.avgDiscipline)}% discipline but ${formatCurrency(strategy.netProfitLoss)} net P/L`
              }
              accent="cyan"
            />
            <ComparisonCard
              label="Weak Discipline and Outcome"
              strategy={report.comparison?.weakestDisciplineAndOutcome}
              helper={(strategy) =>
                `${formatNumber(strategy.avgDiscipline)}% discipline with ${formatCurrency(strategy.netProfitLoss)} net P/L`
              }
              accent="amber"
            />
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
              Strategy Scorecards
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Compare each trading style in detail
            </h2>
            <div className="mt-5 space-y-4">
              {strategies.map((strategy) => (
                <article
                  key={strategy.strategyKey}
                  className="rounded-3xl border border-white/10 bg-slate-900/50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-white">
                        {getStrategyLabel(strategy.strategyKey)}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {strategy.totalTrades} total trades, {strategy.completedTrades} completed,
                        {` ${formatNumber(strategy.winRate)}%`} win rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Net P/L</p>
                      <p className="text-2xl font-semibold text-white">
                        {formatCurrency(strategy.netProfitLoss)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Avg Confluence
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatNumber(strategy.avgConfluence)}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Avg Discipline
                      </p>
                      <p className="mt-2 text-lg font-semibold text-emerald-300">
                        {formatNumber(strategy.avgDiscipline)}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Largest Win
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatCurrency(strategy.largestWin)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Largest Loss
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatCurrency(strategy.largestLoss)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Most Common Mistake
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {strategy.mostCommonMistake?.tag || "No mistake tags yet"}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {strategy.mostCommonMistake
                          ? `${strategy.mostCommonMistake.count} trades carried this issue`
                          : "Review closed trades with mistake tags to expose strategy-specific errors."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Most Common Emotion
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {strategy.mostCommonEmotionBefore?.emotion || "No emotion data yet"}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {strategy.mostCommonEmotionBefore
                          ? `${strategy.mostCommonEmotionBefore.count} trades started from this emotion`
                          : "Record emotions before trade to see how each strategy feels in practice."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Strongest Trade
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {strategy.strongestTrade?.symbol || "No standout trade yet"}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {strategy.strongestTrade
                          ? `${strategy.strongestTrade.confluenceScore ?? "--"}${strategy.strongestTrade.confluenceScore !== null && strategy.strongestTrade.confluenceScore !== undefined ? "%" : ""} confluence, ${strategy.strongestTrade.disciplineScore ?? 0}% discipline, ${formatCurrency(strategy.strongestTrade.profitLoss)} result`
                          : "Close more trades under this strategy to surface its strongest example."}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
              Strategy Verdict
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              What to do with this comparison
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
