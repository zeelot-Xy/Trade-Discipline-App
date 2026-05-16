import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function ConfluenceSummary({
  totalScore,
  setupQuality,
  riskManagementReady,
  onSave,
  isSaving,
  canCreateTrade = true,
  usage,
  onUpgrade,
}) {
  const remainingTrades =
    usage?.tradeLimit === null || usage?.tradeLimit === undefined
      ? null
      : Math.max(usage.tradeLimit - usage.savedTrades, 0);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
            Confluence Summary
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{setupQuality}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Your overall confluence score reflects how well your higher timeframe context,
            lower timeframe entry, and risk controls align before you take the trade.
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !canCreateTrade}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving Trade..." : canCreateTrade ? "Save Trade" : "Upgrade to Save More"}
        </button>
      </div>

      {!canCreateTrade ? (
        <div className="mt-5 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 text-sm text-pink-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Free plan limit reached</p>
              <p className="mt-1 text-pink-100/80">
                You have used all {usage?.tradeLimit || 25} free saved trades. Upgrade to Pro for
                unlimited trade journaling.
              </p>
            </div>
            <button
              type="button"
              onClick={onUpgrade}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-100"
            >
              Upgrade Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : remainingTrades !== null && remainingTrades <= 5 ? (
        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          You have {remainingTrades} free saved {remainingTrades === 1 ? "trade" : "trades"}{" "}
          remaining before the Pro plan is required.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Total Overall Score</span>
            <span>{totalScore}%</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-800">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min(totalScore, 100)}%` }}
            />
          </div>
        </div>

        <div
          className={`rounded-2xl border p-4 ${
            riskManagementReady
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : "border-amber-500/20 bg-amber-500/10 text-amber-100"
          }`}
        >
          <div className="flex items-start gap-3">
            {riskManagementReady ? (
              <ShieldCheck className="mt-0.5 h-5 w-5" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5" />
            )}
            <div>
              <p className="font-medium">
                {riskManagementReady ? "Risk confirmations complete" : "Action needed"}
              </p>
              <p className="mt-1 text-sm">
                {riskManagementReady
                  ? "Stop Loss and Take Profit are confirmed for this setup."
                  : "Stop Loss and Take Profit must be confirmed before saving this trade."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
