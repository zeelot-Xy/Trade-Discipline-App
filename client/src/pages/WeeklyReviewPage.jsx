import { Crown, Lock, Sparkles, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import dashboardService from "../services/dashboardService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import { getStrategyLabel } from "../data/checklistRules.js";
import { formatCurrency, formatDateOnly, formatNumber } from "../utils/formatters.js";
import { normalizeSetupQualityLabel } from "../utils/tradeLabels.js";

const LockedInsight = ({ title, description }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
    <div className="flex items-center gap-2 text-amber-200">
      <Lock className="h-4 w-4" />
      <p className="text-sm font-semibold text-white">{title}</p>
    </div>
    <p className="mt-2 text-sm text-slate-400">{description}</p>
  </div>
);

const InsightCard = ({ label, value, helper, accent = "emerald", icon: Icon = Sparkles }) => {
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
      <p className="mt-4 text-lg font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </div>
  );
};

export default function WeeklyReviewPage() {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchWeeklyReview = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getWeeklyReview();
        if (isMounted) {
          setReview(response);
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

    fetchWeeklyReview();

    return () => {
      isMounted = false;
    };
  }, []);

  const weekRangeText = useMemo(() => {
    if (!review?.week?.start || !review?.week?.end) {
      return "";
    }

    return `${formatDateOnly(review.week.start)} to ${formatDateOnly(review.week.end)}`;
  }, [review]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
        <LoadingSpinner label="Building weekly review..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!review) {
    return <ErrorMessage message="Weekly review could not be loaded." />;
  }

  const { overview } = review;
  const hasTrades = overview.totalTrades > 0;
  const strongestTrade = review.insights?.strongestTrade;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Weekly Review</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Review your discipline one week at a time
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          {weekRangeText
            ? `Current review window: ${weekRangeText}.`
            : "Track the quality of your trading process across the current week."}{" "}
          This page separates raw performance from the behavioral patterns underneath it.
        </p>
      </section>

      {!hasTrades ? (
        <EmptyState
          title="No trades recorded this week"
          description="Save a few checklist-backed trades this week and your review summary will appear here automatically."
          icon={Target}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Weekly P/L" value={formatCurrency(overview.netProfitLoss)} accent="emerald" />
        <StatCard
          label="Completed"
          value={`${overview.completedTrades}`}
          helper={`${overview.totalTrades} total trades this week`}
          accent="cyan"
        />
        <StatCard
          label="Avg Confluence"
          value={`${formatNumber(overview.avgConfluence)}%`}
          helper="Average setup quality across the week"
        />
        <StatCard
          label="Avg Discipline"
          value={`${formatNumber(overview.avgDiscipline)}%`}
          helper="Average process quality across the week"
          accent="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">Week Snapshot</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            What the numbers are saying
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InsightCard
              label="Wins / Losses"
              value={`${overview.winningTrades} / ${overview.losingTrades}`}
              helper={`${overview.breakevenTrades} breakeven trades this week`}
              icon={TrendingUp}
            />
            <InsightCard
              label="Average R:R"
              value={overview.averageRiskReward ? `1 : ${formatNumber(overview.averageRiskReward)}` : "Not enough data"}
              helper="Derived from planned risk and reward amounts"
              accent="cyan"
              icon={Target}
            />
          </div>

          {review.accessLevel === "PRO" ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InsightCard
                label="Best Strategy"
                value={
                  review.insights?.bestStrategy
                    ? getStrategyLabel(review.insights.bestStrategy.strategyKey)
                    : "No strategy data yet"
                }
                helper={
                  review.insights?.bestStrategy
                    ? `${formatCurrency(review.insights.bestStrategy.netProfitLoss)} net P/L this week`
                    : "Save more trades with strategy tags to unlock this view."
                }
              />
              <InsightCard
                label="Worst Strategy"
                value={
                  review.insights?.worstStrategy
                    ? getStrategyLabel(review.insights.worstStrategy.strategyKey)
                    : "No strategy data yet"
                }
                helper={
                  review.insights?.worstStrategy
                    ? `${formatCurrency(review.insights.worstStrategy.netProfitLoss)} net P/L this week`
                    : "No underperforming strategy detected yet."
                }
                accent="red"
                icon={TrendingDown}
              />
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <LockedInsight
                title="Best and worst strategy"
                description="Pro tracks which trading style is helping or hurting you each week."
              />
              <LockedInsight
                title="Behavioral mistake trends"
                description="Pro shows repeated and most costly mistakes so you know what is draining your edge."
              />
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          {review.accessLevel === "PRO" ? (
            <>
              <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
                Weekly Insight
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                What deserves your attention most
              </h2>
              <div className="mt-5 space-y-4">
                <InsightCard
                  label="Most Repeated Mistake"
                  value={review.insights?.mostRepeatedMistake?.tag || "No mistake tags yet"}
                  helper={
                    review.insights?.mostRepeatedMistake
                      ? `${review.insights.mostRepeatedMistake.trades} trades carried this tag`
                      : "Close and review more trades to surface a pattern."
                  }
                  accent="amber"
                />
                <InsightCard
                  label="Most Common Emotion"
                  value={review.insights?.mostCommonEmotionBeforeTrade?.emotion || "No emotion data yet"}
                  helper={
                    review.insights?.mostCommonEmotionBeforeTrade
                      ? `${review.insights.mostCommonEmotionBeforeTrade.count} trades started from this emotion`
                      : "Record your pre-trade emotions to expose emotional drift."
                  }
                  accent="cyan"
                />
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                <Crown className="h-3.5 w-3.5" />
                Pro Preview
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">
                Upgrade to unlock the real weekly review
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                {review.teaser?.description}
              </p>
              <div className="mt-5 space-y-3">
                {(review.teaser?.lockedSections || []).map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                  >
                    <Lock className="h-4 w-4 text-amber-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/upgrade"
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Upgrade to Pro
              </Link>
            </>
          )}
        </section>
      </div>

      {review.accessLevel === "PRO" && hasTrades ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">Weekly Verdict</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Recommendation</h2>
            <div className="mt-5 space-y-3">
              {(review.insights?.recommendation || []).map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">Strongest Trade</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {strongestTrade?.symbol || "No strongest trade yet"}
            </h2>
            <div className="mt-5 space-y-3">
              <InsightCard
                label="Setup Quality"
                value={
                  strongestTrade
                    ? `${strongestTrade.confluenceScore ?? "--"}${strongestTrade.confluenceScore !== null && strongestTrade.confluenceScore !== undefined ? "%" : ""} confluence / ${strongestTrade.disciplineScore ?? 0}% discipline`
                    : "Not enough data"
                }
                helper={
                  strongestTrade
                    ? `${normalizeSetupQualityLabel(strongestTrade.setupQuality)} · ${getStrategyLabel(strongestTrade.strategyKey)}`
                    : "Save and close a few trades this week to identify a standout record."
                }
              />
              <InsightCard
                label="Outcome"
                value={
                  strongestTrade
                    ? `${strongestTrade.result || strongestTrade.status} · ${formatCurrency(
                        strongestTrade.profitLoss,
                      )}`
                    : "Not enough data"
                }
                helper={
                  strongestTrade?.disciplineSummary ||
                  "The strongest trade will include its discipline summary here."
                }
                accent="cyan"
              />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
