import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getStrategyLabel } from "../data/checklistRules.js";
import { getTradeSourceLabel, isImportedTrade } from "../data/tradeSources.js";
import {
  formatCurrency,
  formatDate,
  formatDateOnly,
} from "../utils/formatters.js";
import { normalizeSetupQualityLabel } from "../utils/tradeLabels.js";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMarkerTone = (entry) => {
  if (!entry) {
    return "";
  }
  if (entry.netProfitLoss > 0) {
    return "bg-emerald-400";
  }
  if (entry.netProfitLoss < 0) {
    return "bg-red-400";
  }
  if (entry.openTrades > 0) {
    return "bg-amber-400";
  }
  return "bg-cyan-400";
};

const resultToneMap = {
  WIN: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  LOSS: "border-red-500/20 bg-red-500/10 text-red-200",
  BREAKEVEN: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
  OPEN: "border-amber-500/20 bg-amber-500/10 text-amber-200",
};

export default function TradingCalendar({ calendarData }) {
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const today = new Date();

  const entries = useMemo(() => {
    return Object.fromEntries(calendarData.map((item) => [item.date, item]));
  }, [calendarData]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedDay(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const viewDate = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const start = new Date(viewDate);
  start.setDate(1 - viewDate.getDay());

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });

  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-2xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Trading Calendar</h2>
            <p className="mt-1 text-sm text-slate-400">
              Review which days produced positive, negative, or open trade activity. Tap a marked day to inspect the trades taken there.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded-2xl border border-white/10 bg-slate-900/55 p-3 text-slate-200 transition hover:border-emerald-400/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date())}
              className="rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 text-sm text-slate-200 transition hover:border-emerald-400/40"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded-2xl border border-white/10 bg-slate-900/55 p-3 text-slate-200 transition hover:border-emerald-400/40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-lg font-medium text-white">{monthLabel}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Profit
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              Loss
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              Open
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
          {weekDays.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateKey = day.toISOString().split("T")[0];
            const entry = entries[dateKey];
            const isCurrentMonth = day.getMonth() === viewDate.getMonth();
            const isToday = dateKey === today.toISOString().split("T")[0];

            return (
              <button
                key={dateKey}
                type="button"
                disabled={!entry}
                onClick={() => entry && setSelectedDay(entry)}
                className={`min-h-24 rounded-2xl border p-2 text-left transition ${
                  isToday
                    ? "border-emerald-400/40 bg-emerald-500/10"
                    : "border-white/10 bg-slate-900/45"
                } ${isCurrentMonth ? "opacity-100" : "opacity-45"} ${
                  entry ? "cursor-pointer hover:border-emerald-400/30" : "cursor-default"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{day.getDate()}</span>
                  {entry ? (
                    <span className={`h-2.5 w-2.5 rounded-full ${getMarkerTone(entry)}`} />
                  ) : null}
                </div>
                {entry ? (
                  <div className="mt-3 space-y-1 text-[11px] text-slate-300">
                    <p>{entry.totalTrades} trade(s)</p>
                    <p>{formatCurrency(entry.netProfitLoss)}</p>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {selectedDay ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 backdrop-blur-sm md:items-center md:justify-center">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close trade day summary"
            onClick={() => setSelectedDay(null)}
          />

          <div className="relative z-10 max-h-[88vh] w-full overflow-hidden rounded-t-[2rem] border border-white/10 bg-slate-950 shadow-2xl md:max-h-[80vh] md:max-w-3xl md:rounded-[2rem]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 md:px-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">
                  Trading Day
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {formatDateOnly(selectedDay.date)}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {selectedDay.totalTrades} trade(s), net {formatCurrency(selectedDay.netProfitLoss)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-emerald-400/30 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-6rem)] overflow-y-auto px-5 py-5 md:max-h-[calc(80vh-6rem)] md:px-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Wins</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-300">{selectedDay.wins}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Losses</p>
                  <p className="mt-2 text-lg font-semibold text-red-300">{selectedDay.losses}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Open Trades</p>
                  <p className="mt-2 text-lg font-semibold text-amber-300">{selectedDay.openTrades}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {selectedDay.trades.map((trade) => {
                  const stateKey = trade.result || trade.status;
                  const tone =
                    resultToneMap[stateKey] || resultToneMap.OPEN;

                  return (
                    <div
                      key={trade.id}
                      className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-semibold text-white">
                              {trade.symbol || "Untitled Trade"}
                            </h4>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${tone}`}
                            >
                              {stateKey}
                            </span>
                            {trade.direction ? (
                              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                                {trade.direction}
                              </span>
                            ) : null}
                            {isImportedTrade(trade) ? (
                              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                                {getTradeSourceLabel(trade)}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-slate-400">
                            {formatDate(trade.tradeDate)}
                          </p>
                          <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                            <p>
                              Confluence: {trade.confluenceScore ?? "--"}
                              {trade.confluenceScore !== null && trade.confluenceScore !== undefined ? "%" : ""}
                            </p>
                            <p>P/L: {formatCurrency(trade.profitLoss)}</p>
                            <p>Setup: {normalizeSetupQualityLabel(trade.setupQuality) || "Not recorded"}</p>
                            <p>Strategy: {getStrategyLabel(trade.strategyKey)}</p>
                          </div>
                        </div>

                        <Link
                          to={`/trade/${trade.id}`}
                          className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
                        >
                          View Trade Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
