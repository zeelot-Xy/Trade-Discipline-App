import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import tradeService from "../services/tradeService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import ScreenshotUploader from "../components/ScreenshotUploader.jsx";
import { formatCurrency, formatDate, formatNumber } from "../utils/formatters.js";
import { getStrategyLabel, strategyOptions } from "../data/checklistRules.js";
import { emotionAfterOptions, mistakeTagOptions } from "../data/tradingOptions.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getServerAssetUrl } from "../utils/serverAssets.js";
import { getTradeSourceLabel, isImportedTrade } from "../data/tradeSources.js";
import { normalizeSetupQualityLabel } from "../utils/tradeLabels.js";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-55";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The screenshot could not be loaded."));
    reader.readAsDataURL(file);
  });

export default function TradeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [trade, setTrade] = useState(null);
  const [form, setForm] = useState({
    strategyKey: "",
    tradingViewUrl: "",
    status: "OPEN",
    result: "",
    profitLoss: "",
    notes: "",
    emotionAfter: "",
    mistakeTags: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [screenshotDrafts, setScreenshotDrafts] = useState({
    beforeTradeScreenshot: null,
    afterTradeScreenshot: null,
    removeBeforeTradeScreenshot: false,
    removeAfterTradeScreenshot: false,
  });
  const availableEmotionAfterOptions =
    form.emotionAfter && !emotionAfterOptions.includes(form.emotionAfter)
      ? [form.emotionAfter, ...emotionAfterOptions]
      : emotionAfterOptions;

  useEffect(() => {
    let isMounted = true;

    const fetchTrade = async () => {
      try {
        setLoading(true);
        const response = await tradeService.getTrade(id);

        if (isMounted) {
          setTrade(response.trade);
          setForm({
            strategyKey: response.trade.strategyKey || "",
            tradingViewUrl: response.trade.tradingViewUrl || "",
            status: response.trade.status || "OPEN",
            result: response.trade.result || "",
            profitLoss:
              response.trade.profitLoss !== null && response.trade.profitLoss !== undefined
                ? String(response.trade.profitLoss)
                : "",
            notes: response.trade.notes || "",
            emotionAfter: response.trade.emotionAfter || "",
            mistakeTags: response.trade.mistakeTags || [],
          });
          setScreenshotDrafts({
            beforeTradeScreenshot: null,
            afterTradeScreenshot: null,
            removeBeforeTradeScreenshot: false,
            removeAfterTradeScreenshot: false,
          });
          setIsCorrectionMode(false);
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

    fetchTrade();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);
      const response = await tradeService.updateTrade(id, {
        ...form,
        strategyKey: form.strategyKey || "",
        tradingViewUrl: form.tradingViewUrl || "",
        result: form.result || null,
        profitLoss: form.profitLoss === "" ? undefined : Number(form.profitLoss),
        mistakeTags: form.mistakeTags,
        beforeTradeScreenshot: screenshotDrafts.beforeTradeScreenshot || undefined,
        afterTradeScreenshot: screenshotDrafts.afterTradeScreenshot || undefined,
        removeBeforeTradeScreenshot: screenshotDrafts.removeBeforeTradeScreenshot,
        removeAfterTradeScreenshot: screenshotDrafts.removeAfterTradeScreenshot,
      });
      setTrade(response.trade);
      setForm({
        strategyKey: response.trade.strategyKey || "",
        tradingViewUrl: response.trade.tradingViewUrl || "",
        status: response.trade.status || "OPEN",
        result: response.trade.result || "",
        profitLoss:
          response.trade.profitLoss !== null && response.trade.profitLoss !== undefined
            ? String(response.trade.profitLoss)
            : "",
        notes: response.trade.notes || "",
        emotionAfter: response.trade.emotionAfter || "",
        mistakeTags: response.trade.mistakeTags || [],
      });
      setScreenshotDrafts({
        beforeTradeScreenshot: null,
        afterTradeScreenshot: null,
        removeBeforeTradeScreenshot: false,
        removeAfterTradeScreenshot: false,
      });
      setIsCorrectionMode(response.trade.status !== "CLOSED");
      setMessage("Trade updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResultChange = (value) => {
    setForm((current) => {
      if (value === "WIN" && (current.profitLoss === "" || Number(current.profitLoss) <= 0)) {
        return { ...current, result: value, status: "CLOSED", profitLoss: "1" };
      }

      if (value === "LOSS" && (current.profitLoss === "" || Number(current.profitLoss) >= 0)) {
        return { ...current, result: value, status: "CLOSED", profitLoss: "-1" };
      }

      if (value === "BREAKEVEN") {
        return { ...current, result: value, status: "CLOSED", profitLoss: "0" };
      }

      return { ...current, result: value };
    });
  };

  const resetFormFromTrade = (currentTrade) => {
    setForm({
      strategyKey: currentTrade.strategyKey || "",
      tradingViewUrl: currentTrade.tradingViewUrl || "",
      status: currentTrade.status || "OPEN",
      result: currentTrade.result || "",
      profitLoss:
        currentTrade.profitLoss !== null && currentTrade.profitLoss !== undefined
          ? String(currentTrade.profitLoss)
          : "",
      notes: currentTrade.notes || "",
      emotionAfter: currentTrade.emotionAfter || "",
      mistakeTags: currentTrade.mistakeTags || [],
    });
    setScreenshotDrafts({
      beforeTradeScreenshot: null,
      afterTradeScreenshot: null,
      removeBeforeTradeScreenshot: false,
      removeAfterTradeScreenshot: false,
    });
  };

  const handleScreenshotChange = async (slot, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setScreenshotDrafts((current) => ({
        ...current,
        [slot]: {
          dataUrl,
          fileName: file.name,
        },
        ...(slot === "beforeTradeScreenshot"
          ? { removeBeforeTradeScreenshot: false }
          : { removeAfterTradeScreenshot: false }),
      }));
      setError("");
    } catch (fileError) {
      setError(fileError.message);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
        <LoadingSpinner label="Loading trade details..." />
      </div>
    );
  }

  if (!trade) {
    return <ErrorMessage message={error || "Trade could not be found."} />;
  }

  const isTradeClosed = trade.status === "CLOSED";
  const importedTrade = isImportedTrade(trade);
  const isFormReadOnly = isTradeClosed && !isCorrectionMode;
  const isPro = user?.planType === "PRO";
  const beforeTradeScreenshotPreview =
    screenshotDrafts.beforeTradeScreenshot?.dataUrl ||
    (!screenshotDrafts.removeBeforeTradeScreenshot ? trade.beforeTradeScreenshotUrl : null);
  const afterTradeScreenshotPreview =
    screenshotDrafts.afterTradeScreenshot?.dataUrl ||
    (!screenshotDrafts.removeAfterTradeScreenshot ? trade.afterTradeScreenshotUrl : null);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Trade Detail</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">{trade.symbol || "Untitled Trade"}</h1>
        <p className="mt-3 text-sm text-slate-400">
          Saved on {formatDate(trade.tradeDate)}
          {trade.confluenceScore !== null && trade.confluenceScore !== undefined
            ? ` with a ${trade.confluenceScore}% confluence score.`
            : "."}
        </p>
      </section>

      <ErrorMessage message={error} />
      {message ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">Trade overview</h2>
          {importedTrade ? (
            <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              This trade was imported from {getTradeSourceLabel(trade)}. It has no live pre-trade
              checklist unless you enrich it later with notes, strategy context, screenshots, and review tags.
            </div>
          ) : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["Source", getTradeSourceLabel(trade)],
              ["Direction", trade.direction || "Not set"],
              ["Entry Price", trade.entryPrice ? formatNumber(trade.entryPrice, 4) : "Not set"],
              ["Exit Price", trade.exitPrice ? formatNumber(trade.exitPrice, 4) : "Not set"],
              ["Stop Loss", trade.stopLoss ? formatNumber(trade.stopLoss, 4) : "Not set"],
              ["Take Profit", trade.takeProfit ? formatNumber(trade.takeProfit, 4) : "Not set"],
              ["Risk Amount", formatCurrency(trade.riskAmount)],
              ["Reward Amount", formatCurrency(trade.rewardAmount)],
              ["Profit / Loss", formatCurrency(trade.profitLoss)],
              ["Setup Quality", normalizeSetupQualityLabel(trade.setupQuality) || "Not recorded"],
              ["Discipline Score", trade.disciplineScore !== null && trade.disciplineScore !== undefined ? `${trade.disciplineScore}%` : "Not scored"],
              ["Strategy", getStrategyLabel(trade.strategyKey)],
              ["Status", trade.status],
              ["Result", trade.result || "Open"],
              ["Emotion Before", trade.emotionBefore || "Not set"],
              ["Emotion After", trade.emotionAfter || "Not set"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Discipline Summary</p>
            <p className="mt-2 text-sm text-slate-300">
              {trade.disciplineSummary || "No discipline review was saved for this trade."}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">TradingView</p>
            {trade.tradingViewUrl ? (
              <a
                href={trade.tradingViewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-sm text-emerald-300 transition hover:text-emerald-200"
              >
                Open linked TradingView chart
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No TradingView link saved for this trade.</p>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mistake Tags</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trade.mistakeTags?.length ? (
                trade.mistakeTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs text-pink-100"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">No mistake review tags added yet.</p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Notes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
              {trade.notes || "No notes saved for this trade."}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Trade Screenshots</p>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {[
                ["Before Trade", trade.beforeTradeScreenshotUrl],
                ["After Trade", trade.afterTradeScreenshotUrl],
              ].map(([label, screenshotUrl]) => (
                <div key={label} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55">
                  {screenshotUrl ? (
                    <img
                      src={getServerAssetUrl(screenshotUrl)}
                      alt={label}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                      No screenshot saved
                    </div>
                  )}
                  <div className="border-t border-white/10 px-4 py-3 text-sm text-slate-300">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">Close Trade / Record Outcome</h2>
          <p className="mt-2 text-sm text-slate-400">
            Save the final result here after the trade has played out. Open trades can stay open until you know the outcome.
          </p>
          {isTradeClosed && !isCorrectionMode ? (
            <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              This trade has already been marked as closed. If you saved something incorrectly, use correction mode to update the record intentionally.
            </div>
          ) : null}
          {isTradeClosed && isCorrectionMode ? (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Correction mode is active. You are editing a previously closed trade record.
            </div>
          ) : null}
          {isTradeClosed ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {!isCorrectionMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setIsCorrectionMode(true);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/15"
                >
                  Correct Trade Record
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    resetFormFromTrade(trade);
                    setError("");
                    setMessage("");
                    setIsCorrectionMode(false);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:border-emerald-400/30"
                >
                  Cancel Correction
                </button>
              )}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <select
              className={inputClassName}
              value={form.strategyKey}
              disabled={isFormReadOnly}
              onChange={(event) => setForm((current) => ({ ...current, strategyKey: event.target.value }))}
            >
              <option value="">Strategy Not Assigned</option>
              {strategyOptions.map((strategy) => (
                <option key={strategy.key} value={strategy.key}>
                  {strategy.label}
                </option>
              ))}
            </select>
            <input
              className={inputClassName}
              type="url"
              value={form.tradingViewUrl}
              disabled={isFormReadOnly}
              onChange={(event) => setForm((current) => ({ ...current, tradingViewUrl: event.target.value }))}
              placeholder="TradingView chart link"
            />
            <select
              className={inputClassName}
              value={form.status}
              disabled={isFormReadOnly}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <select
              className={inputClassName}
              value={form.result}
              disabled={isFormReadOnly}
              onChange={(event) => handleResultChange(event.target.value)}
            >
              <option value="">Open / Unset</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
              <option value="BREAKEVEN">BREAKEVEN</option>
            </select>
            <input
              className={inputClassName}
              type="number"
              step="0.01"
              value={form.profitLoss}
              disabled={isFormReadOnly}
              onChange={(event) => setForm((current) => ({ ...current, profitLoss: event.target.value }))}
              placeholder="Profit / Loss"
            />
            <p className="text-xs text-slate-400">
              Tip: wins should be positive, losses negative, and breakeven should be 0.
            </p>
            <select
              className={inputClassName}
              value={form.emotionAfter}
              disabled={isFormReadOnly}
              onChange={(event) => setForm((current) => ({ ...current, emotionAfter: event.target.value }))}
            >
              <option value="">Emotion After Trade</option>
              {availableEmotionAfterOptions.map((emotion) => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                Mistake Review Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {mistakeTagOptions.map((tag) => {
                  const selected = form.mistakeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      disabled={isFormReadOnly}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          mistakeTags: selected
                            ? current.mistakeTags.filter((item) => item !== tag)
                            : tag === "No notable mistake"
                              ? ["No notable mistake"]
                              : [
                                  ...current.mistakeTags.filter(
                                    (item) => item !== "No notable mistake",
                                  ),
                                  tag,
                                ],
                        }))
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        selected
                          ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20"
                      } disabled:opacity-60`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
            <textarea
              className={`${inputClassName} min-h-36 resize-y`}
              value={form.notes}
              disabled={isFormReadOnly}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Update notes..."
            />
            <div className="grid gap-4 xl:grid-cols-2">
              <ScreenshotUploader
                title="Before Trade Screenshot"
                helper="Replace the original setup screenshot if you need a better case-study reference."
                isPro={isPro}
                previewUrl={beforeTradeScreenshotPreview}
                onFileChange={(event) => handleScreenshotChange("beforeTradeScreenshot", event)}
                onRemove={() =>
                  setScreenshotDrafts((current) => ({
                    ...current,
                    beforeTradeScreenshot: null,
                    removeBeforeTradeScreenshot: true,
                  }))
                }
                disabled={isFormReadOnly}
              />
              <ScreenshotUploader
                title="After Trade Screenshot"
                helper="Add the chart outcome after the trade closes so the review becomes visual, not just numerical."
                isPro={isPro}
                previewUrl={afterTradeScreenshotPreview}
                onFileChange={(event) => handleScreenshotChange("afterTradeScreenshot", event)}
                onRemove={() =>
                  setScreenshotDrafts((current) => ({
                    ...current,
                    afterTradeScreenshot: null,
                    removeAfterTradeScreenshot: true,
                  }))
                }
                disabled={isFormReadOnly}
              />
            </div>
            <button
              type="submit"
              disabled={saving || isFormReadOnly}
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isTradeClosed
                ? isCorrectionMode
                  ? saving
                    ? "Saving Correction..."
                    : "Save Correction"
                  : "Trade Closed"
                : saving
                  ? "Saving changes..."
                  : "Save changes"}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
        <h2 className="text-xl font-semibold text-white">Checklist snapshot</h2>
        {Array.isArray(trade.checklistSnapshot) && trade.checklistSnapshot.length ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {trade.checklistSnapshot.map((section) => (
              <div key={section.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium text-white">{section.title}</h3>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                    {section.score}
                  </span>
                </div>
                <div className="space-y-2">
                  {section.conditions.map((condition) => (
                    <div
                      key={`${section.id}-${condition.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-slate-950/55 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-300">{condition.label}</span>
                      <span className={condition.checked ? "text-emerald-300" : "text-slate-500"}>
                        {condition.checked ? "Checked" : "Unchecked"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
            No pre-trade checklist was recorded for this imported trade.
          </div>
        )}
      </section>
    </div>
  );
}
