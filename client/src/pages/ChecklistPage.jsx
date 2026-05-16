import { BookOpenText, BrainCircuit } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ChecklistSection from "../components/ChecklistSection.jsx";
import ConfluenceSummary from "../components/ConfluenceSummary.jsx";
import TradeForm from "../components/TradeForm.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import {
  createChecklistState,
  defaultStrategyKey,
  getStrategyMeta,
  strategyOptions,
} from "../data/checklistRules.js";
import {
  calculateTotalScore,
  classifySetup,
  createChecklistSnapshot,
} from "../utils/calculateConfluence.js";
import { calculatePlannedTradeMetrics } from "../utils/tradePlanning.js";
import { useAuth } from "../context/AuthContext.jsx";
import tradeService from "../services/tradeService.js";

const initialTradeForm = {
  symbol: "",
  direction: "",
  entryPrice: "",
  stopLoss: "",
  takeProfit: "",
  riskAmount: "",
  rewardAmount: "",
  notes: "",
  emotionBefore: "",
  tradingViewUrl: "",
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The screenshot could not be loaded."));
    reader.readAsDataURL(file);
  });

export default function ChecklistPage() {
  const [strategyKey, setStrategyKey] = useState(defaultStrategyKey);
  const [sections, setSections] = useState(() => createChecklistState(defaultStrategyKey));
  const [tradeForm, setTradeForm] = useState(initialTradeForm);
  const [symbolMode, setSymbolMode] = useState("preset");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [beforeTradeScreenshot, setBeforeTradeScreenshot] = useState(null);
  const { user, usage, setUsage } = useAuth();
  const navigate = useNavigate();

  const strategy = useMemo(() => getStrategyMeta(strategyKey), [strategyKey]);
  const totalScore = useMemo(() => calculateTotalScore(sections), [sections]);
  const setupQuality = useMemo(() => classifySetup(totalScore), [totalScore]);
  const planningMetrics = useMemo(
    () => calculatePlannedTradeMetrics(tradeForm),
    [tradeForm],
  );

  const riskManagementReady = useMemo(() => {
    const riskSection = sections.find((section) => section.id === "risk-management");
    return riskSection ? riskSection.conditions.every((condition) => condition.checked) : false;
  }, [sections]);

  const handleToggle = (sectionId, conditionId) => {
    setSections((currentSections) =>
      currentSections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        return {
          ...section,
          conditions: section.conditions.map((condition) =>
            condition.id === conditionId
              ? { ...condition, checked: !condition.checked }
              : condition,
          ),
        };
      }),
    );
  };

  const handleStrategyChange = (nextStrategyKey) => {
    setStrategyKey(nextStrategyKey);
    setSections(createChecklistState(nextStrategyKey));
    setMessage("");
    setError("");
  };

  const handleTradeFormChange = (name, value) => {
    setTradeForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveTrade = async () => {
    setError("");
    setMessage("");

    if (!usage?.canCreateTrade) {
      setError("You have reached the 25-trade free limit. Upgrade to continue saving trades.");
      return;
    }

    if (!riskManagementReady) {
      setError("Stop Loss and Take Profit must be confirmed before saving this trade.");
      return;
    }

    if (planningMetrics.warning) {
      setError(planningMetrics.warning);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...tradeForm,
        strategyKey,
        direction: tradeForm.direction || undefined,
        rewardAmount:
          planningMetrics.rewardAmount !== null
            ? Number(planningMetrics.rewardAmount.toFixed(2))
            : undefined,
        beforeTradeScreenshot,
        confluenceScore: totalScore,
        setupQuality,
        checklistSnapshot: createChecklistSnapshot(sections),
      };

      const response = await tradeService.createTrade(payload);
      if (response.usage) {
        setUsage(response.usage);
      }
      setMessage("Trade saved successfully.");
      setSections(createChecklistState(strategyKey));
      setTradeForm(initialTradeForm);
      setBeforeTradeScreenshot(null);
      setSymbolMode("preset");
      navigate("/history");
    } catch (requestError) {
      if (requestError.code === "TRADE_LIMIT_REACHED" && requestError.data?.usage) {
        setUsage(requestError.data.usage);
      }
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBeforeTradeScreenshotChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setBeforeTradeScreenshot({
        dataUrl,
        fileName: file.name,
      });
      setError("");
    } catch (fileError) {
      setError(fileError.message);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">TradeCadet Journal</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Select the conditions that are present in your strategy
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          Record. Review. Refine. Pick the strategy vocabulary you actually use, score the setup,
          confirm risk controls, and save the exact checklist snapshot that justified the trade.
        </p>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl xl:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="flex items-center gap-2 text-white">
            <BrainCircuit className="h-4 w-4 text-emerald-300" />
            <h2 className="text-xl font-semibold">Strategy Preset</h2>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Choose the checklist language that best matches how you analyze trades.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {strategyOptions.map((option) => {
              const selected = option.key === strategyKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleStrategyChange(option.key)}
                  className={`rounded-3xl border p-4 text-left transition duration-200 ${
                    selected
                      ? "border-emerald-400/40 bg-emerald-500/10"
                      : "border-white/10 bg-slate-950/45 hover:border-white/20"
                  }`}
                >
                  <p className="text-lg font-semibold text-white">{option.label}</p>
                  <p className="mt-2 text-sm text-slate-400">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
          <div className="flex items-center gap-2 text-white">
            <BookOpenText className="h-4 w-4 text-emerald-300" />
            <h2 className="text-xl font-semibold">Glossary</h2>
          </div>
          <p className="mt-2 text-sm text-slate-400">{strategy?.description}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            {strategy?.glossary?.length ? (
              strategy.glossary.map((entry) => (
                <div
                  key={entry.term}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
                    {entry.term}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{entry.meaning}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
                This preset uses plain-language conditions without abbreviations.
              </div>
            )}
          </div>
        </div>
      </section>

      <ErrorMessage message={error} />
      {message ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      {usage?.tradeLimit !== null && usage?.savedTrades >= 20 ? (
        <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5 text-sm text-cyan-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Free plan usage</p>
              <p className="mt-1 text-cyan-100/80">
                You have used {usage.savedTrades} of {usage.tradeLimit} free saved trades.
              </p>
            </div>
            <Link
              to="/upgrade"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-50"
            >
              View Pro Upgrade
            </Link>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((section) => (
          <ChecklistSection key={section.id} section={section} onToggle={handleToggle} />
        ))}
      </div>

      <TradeForm
        values={tradeForm}
        onChange={handleTradeFormChange}
        planningMetrics={planningMetrics}
        symbolMode={symbolMode}
        onSymbolModeChange={setSymbolMode}
        isPro={user?.planType === "PRO"}
        screenshotPreviewUrl={beforeTradeScreenshot?.dataUrl || null}
        onScreenshotFileChange={handleBeforeTradeScreenshotChange}
        onScreenshotRemove={() => setBeforeTradeScreenshot(null)}
      />

      <ConfluenceSummary
        totalScore={totalScore}
        setupQuality={setupQuality}
        riskManagementReady={riskManagementReady}
        onSave={handleSaveTrade}
        isSaving={saving}
        canCreateTrade={usage?.canCreateTrade ?? true}
        usage={usage}
        onUpgrade={() => navigate("/upgrade")}
      />
    </div>
  );
}
