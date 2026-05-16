import { Calculator, PencilLine } from "lucide-react";

import popularPairs from "../data/popularPairs.json";
import { emotionBeforeOptions, riskyEmotionSet } from "../data/tradingOptions.js";
import { formatNumber } from "../utils/formatters.js";
import ScreenshotUploader from "./ScreenshotUploader.jsx";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-slate-500 focus:border-emerald-400/60";

export default function TradeForm({
  values,
  onChange,
  planningMetrics,
  symbolMode,
  onSymbolModeChange,
  isPro,
  screenshotPreviewUrl,
  onScreenshotFileChange,
  onScreenshotRemove,
}) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  const isCustomSymbol = symbolMode === "custom";
  const hasPlanningMetrics = planningMetrics.rrMultiple !== null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">Trade Details</h2>
        <p className="mt-1 text-sm text-slate-400">
          Capture the setup context now, then close the trade outcome later when the move has fully played out.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-3 md:col-span-2 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-white">Currency Pair / Symbol</label>
            <button
              type="button"
              onClick={() => onSymbolModeChange(isCustomSymbol ? "preset" : "custom")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-400/40"
            >
              <PencilLine className="h-3.5 w-3.5" />
              {isCustomSymbol ? "Use Popular Pair" : "Enter Custom"}
            </button>
          </div>

          {isCustomSymbol ? (
            <input
              className={inputClassName}
              name="symbol"
              value={values.symbol}
              onChange={handleChange}
              placeholder="Type any symbol, e.g. NAS100 or ETH/USD"
            />
          ) : (
            <select
              className={inputClassName}
              name="symbol"
              value={values.symbol}
              onChange={handleChange}
            >
              <option value="">Select Popular Pair</option>
              {popularPairs.map((pair) => (
                <option key={pair} value={pair}>
                  {pair}
                </option>
              ))}
            </select>
          )}
        </div>

        <select
          className={inputClassName}
          name="direction"
          value={values.direction}
          onChange={handleChange}
        >
          <option value="">Direction</option>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
        <input
          className={inputClassName}
          name="entryPrice"
          value={values.entryPrice}
          onChange={handleChange}
          placeholder="Entry Price"
          type="number"
          step="0.0001"
        />
        <input
          className={inputClassName}
          name="stopLoss"
          value={values.stopLoss}
          onChange={handleChange}
          placeholder="Stop Loss Price"
          type="number"
          step="0.0001"
        />
        <input
          className={inputClassName}
          name="takeProfit"
          value={values.takeProfit}
          onChange={handleChange}
          placeholder="Take Profit Price"
          type="number"
          step="0.0001"
        />
        <input
          className={inputClassName}
          name="riskAmount"
          value={values.riskAmount}
          onChange={handleChange}
          placeholder="Risk Amount"
          type="number"
          step="0.01"
        />
        <input
          className={`${inputClassName} ${planningMetrics.rewardAmount !== null ? "text-emerald-200" : ""}`}
          name="rewardAmount"
          value={
            planningMetrics.rewardAmount !== null
              ? String(Number(planningMetrics.rewardAmount.toFixed(2)))
              : values.rewardAmount
          }
          readOnly
          placeholder="Planned Reward Amount"
        />
        <select
          className={inputClassName}
          name="emotionBefore"
          value={values.emotionBefore}
          onChange={handleChange}
        >
          <option value="">Emotion Before Trade</option>
          {emotionBeforeOptions.map((emotion) => (
            <option key={emotion} value={emotion}>
              {emotion}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-slate-500 focus:border-emerald-400/60 md:col-span-2 xl:col-span-2"
          name="tradingViewUrl"
          value={values.tradingViewUrl}
          onChange={handleChange}
          placeholder="TradingView chart link (optional)"
          type="url"
        />
      </div>

      {values.emotionBefore && riskyEmotionSet.has(values.emotionBefore) ? (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {values.emotionBefore} is treated as a higher-risk discipline emotion and will reduce
          the discipline score for this trade.
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/50 p-4">
        <div className="flex items-center gap-2 text-white">
          <Calculator className="h-4 w-4 text-emerald-300" />
          <p className="font-medium">Planned Risk/Reward</p>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          This section estimates the setup plan only. Final trade profit or loss is still recorded after the trade closes.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Risk Distance</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {planningMetrics.riskDistance !== null ? formatNumber(planningMetrics.riskDistance, 4) : "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reward Distance</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {planningMetrics.rewardDistance !== null ? formatNumber(planningMetrics.rewardDistance, 4) : "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Planned R:R</p>
            <p className="mt-2 text-lg font-semibold text-emerald-300">
              {hasPlanningMetrics ? `1 : ${formatNumber(planningMetrics.rrMultiple, 2)}` : "--"}
            </p>
          </div>
        </div>

        {planningMetrics.warning ? (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {planningMetrics.warning}
          </div>
        ) : null}
      </div>

      <textarea
        className={`${inputClassName} mt-4 min-h-36 resize-y`}
        name="notes"
        value={values.notes}
        onChange={handleChange}
        placeholder="Notes about your thesis, execution plan, or anything worth reviewing later..."
      />

      <div className="mt-4">
        <ScreenshotUploader
          title="Before Trade Screenshot"
          helper="Capture the chart or setup view you want to review later."
          isPro={isPro}
          previewUrl={screenshotPreviewUrl}
          onFileChange={onScreenshotFileChange}
          onRemove={onScreenshotRemove}
        />
      </div>
    </section>
  );
}
