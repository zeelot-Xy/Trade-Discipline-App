import { Link } from "react-router-dom";
import { ArrowRight, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { normalizeSetupQualityLabel } from "../utils/tradeLabels.js";
import { getStrategyLabel } from "../data/checklistRules.js";
import { getTradeSourceLabel, isImportedTrade } from "../data/tradeSources.js";

const statusToneMap = {
  WIN: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  LOSS: "border-red-500/20 bg-red-500/10 text-red-200",
  BREAKEVEN: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
  OPEN: "border-amber-500/20 bg-amber-500/10 text-amber-200"
};

export default function TradeHistoryCard({ trade, onDelete }) {
  const badgeTone = statusToneMap[trade.result || trade.status] || statusToneMap.OPEN;
  const isOpenTrade = trade.status === "OPEN";
  const imported = isImportedTrade(trade);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-white">{trade.symbol || "Untitled Trade"}</h3>
            <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${badgeTone}`}>
              {trade.result || trade.status}
            </span>
            {trade.direction ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {trade.direction}
              </span>
            ) : null}
            {imported ? (
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                {getTradeSourceLabel(trade)}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-400">{formatDate(trade.tradeDate)}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
            <p>Confluence: {trade.confluenceScore ?? "--"}{trade.confluenceScore !== null && trade.confluenceScore !== undefined ? "%" : ""}</p>
            <p>
              Discipline: {trade.disciplineScore ?? "--"}
              {trade.disciplineScore !== null && trade.disciplineScore !== undefined ? "%" : ""}
            </p>
            <p>Setup: {normalizeSetupQualityLabel(trade.setupQuality) || "Not recorded"}</p>
            <p>P/L: {formatCurrency(trade.profitLoss)}</p>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Strategy: {getStrategyLabel(trade.strategyKey)}
          </p>
          {trade.notes ? (
            <p className="mt-4 line-clamp-2 text-sm text-slate-400">{trade.notes}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/trade/${trade.id}`}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 font-medium transition ${
              isOpenTrade
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                : "border border-white/10 bg-white/[0.05] text-white hover:border-emerald-400/30"
            }`}
          >
            {isOpenTrade ? "Update Outcome" : "View Details"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {isOpenTrade ? (
            <Link
              to={`/trade/${trade.id}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 font-medium text-white transition hover:border-emerald-400/30"
            >
              View Details
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(trade.id)}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 font-medium text-red-200 transition hover:bg-red-500/15"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
