import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import dashboardService from "../services/dashboardService.js";
import StatCard from "../components/StatCard.jsx";
import TradingCalendar from "../components/TradingCalendar.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { getStrategyLabel } from "../data/checklistRules.js";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardStats();
        if (isMounted) {
          setStats(response);
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

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
        <LoadingSpinner label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const chartData = stats.calendarData.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    pnl: entry.netProfitLoss,
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">
              Trading Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white">
              Your trading performance at a glance
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Performance, consistency, discipline, and mistake awareness grounded in the real
              trades saved manually or imported into your journal.
            </p>
          </div>
          <Link
            to="/reviews/weekly"
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15"
          >
            Open Weekly Review
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
                Core Performance
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {formatCurrency(stats.netProfitLoss)}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {stats.completedTrades} completed trades, {formatNumber(stats.winRate)}% win rate,
                profit factor {formatNumber(stats.profitFactor)}.
              </p>
            </div>
            <div className="grid gap-3 text-right">
              <p className="text-sm text-slate-400">Average confluence</p>
              <p className="text-2xl font-semibold text-white">
                {formatNumber(stats.avgConfluence)}%
              </p>
              <p className="text-sm text-slate-400">Average discipline</p>
              <p className="text-xl font-semibold text-emerald-300">
                {formatNumber(stats.avgDiscipline)}%
              </p>
            </div>
          </div>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(2, 6, 23, 0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="#34d399"
                  fill="url(#pnlFill)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard label="Total Profit" value={formatCurrency(stats.totalProfit)} accent="emerald" />
          <StatCard label="Total Loss" value={formatCurrency(stats.totalLoss)} accent="red" />
          <StatCard label="Largest Win" value={formatCurrency(stats.largestWin)} accent="cyan" />
          <StatCard label="Largest Loss" value={formatCurrency(stats.largestLoss)} accent="amber" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Best Streak"
          value={`${stats.bestStreak}`}
          helper="Longest win streak by trade date"
        />
        <StatCard
          label="Total Trades"
          value={`${stats.totalTrades}`}
          helper="All manual and imported journal records"
        />
        <StatCard
          label="Winning Trades"
          value={`${stats.winningTrades}`}
          helper="Closed trades marked as wins"
        />
        <StatCard
          label="Breakevens"
          value={`${stats.breakevenTrades}`}
          helper="Completed trades with zero result"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
            Mistake Review
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">What is costing you most?</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Most Repeated Mistake
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {stats.mostRepeatedMistake?.tag || "No mistake data yet"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {stats.mostRepeatedMistake
                  ? `${stats.mostRepeatedMistake.trades} trades tagged with this issue.`
                  : "Close and review a few trades to surface patterns here."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Most Costly Mistake
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {stats.mostCostlyMistake?.tag || "No mistake data yet"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {stats.mostCostlyMistake
                  ? `${formatCurrency(stats.mostCostlyMistake.netProfitLoss)} total P/L across tagged trades.`
                  : "Cost analysis will appear once trades are reviewed."}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {(stats.mistakeBreakdown || []).slice(0, 4).map((item) => (
              <div
                key={item.tag}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
              >
                <span className="text-slate-300">{item.tag}</span>
                <span className="text-white">
                  {item.trades} trades · {formatCurrency(item.netProfitLoss)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
            Strategy Breakdown
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Which style is serving you best?
          </h2>
          <div className="mt-5 space-y-3">
            {(stats.strategyBreakdown || []).map((strategy) => (
              <div
                key={strategy.strategyKey}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white capitalize">
                      {getStrategyLabel(strategy.strategyKey)}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {strategy.trades} trades · {formatNumber(strategy.winRate)}% win rate
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Net P/L</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(strategy.netProfitLoss)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                  <p>Avg confluence: {formatNumber(strategy.avgConfluence)}%</p>
                  <p>Avg discipline: {formatNumber(strategy.avgDiscipline)}%</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
              Deep Review
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Want to compare Trend, Swing, and Scalping directly?
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              The strategy review page breaks down each style by outcome, discipline, common
              mistakes, and strongest trade examples.
            </p>
          </div>
          <Link
            to="/reviews/strategies"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/15"
          >
            Open Strategy Review
          </Link>
        </div>
      </section>

      <TradingCalendar calendarData={stats.calendarData} />
    </div>
  );
}
