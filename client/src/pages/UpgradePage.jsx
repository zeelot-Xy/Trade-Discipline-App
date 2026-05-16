import { Check, Crown, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import ErrorMessage from "../components/ErrorMessage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import billingService from "../services/billingService.js";
import { formatDateOnly } from "../utils/formatters.js";

const planFeatures = {
  FREE: [
    "Save up to 25 total trades",
    "Full access to dashboard, history, and trade corrections",
    "Perfect for evaluating the trading journal workflow",
  ],
  PRO: [
    "Unlimited saved trades",
    "Discipline score that separates process quality from setup quality",
    "Mistake tags with dashboard insight into repeated and costly errors",
    "Weekly review that highlights your strongest strategy and biggest discipline leaks",
    "Same full dashboard and history access with no trade cap",
    "Paystack-hosted subscription management for card updates and billing control",
  ],
};

export default function UpgradePage() {
  const { user, usage, refreshAuth } = useAuth();
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const isPro = user?.planType === "PRO";

  const usageText = useMemo(() => {
    if (usage?.tradeLimit === null) {
      return `${usage?.savedTrades || 0} trades saved with unlimited access`;
    }

    return `${usage?.savedTrades || 0} / ${usage?.tradeLimit || 25} free trades used`;
  }, [usage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutState = params.get("checkout");

    if (checkoutState === "success") {
      setMessage(
        "Paystack checkout completed. Your subscription is being confirmed and your plan will refresh automatically.",
      );
      refreshAuth().catch(() => {});
    } else if (checkoutState === "cancel") {
      setMessage("Paystack checkout was canceled. Your current free access is still available.");
    }
  }, [location.search, refreshAuth]);

  const handleUpgrade = async () => {
    try {
      setLoadingAction(true);
      setError("");
      const response = await billingService.createCheckoutSession();
      window.location.assign(response.url);
    } catch (requestError) {
      setError(requestError.message);
      setLoadingAction(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoadingAction(true);
      setError("");
      const response = await billingService.createCustomerPortalSession();
      window.location.assign(response.url);
    } catch (requestError) {
      setError(requestError.message);
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Upgrade</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Free when you start. Pro when you scale.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          The free plan gives you room to validate your process. Pro removes the 25-trade cap and
          adds discipline-focused insight so you can see whether losses came from the market, your
          strategy, or your behavior.
        </p>
      </section>

      <ErrorMessage message={error} />
      {message ? (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">
                Current Plan
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{user?.planType || "FREE"}</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Usage</p>
              <p className="mt-2 text-sm font-medium text-white">{usageText}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Subscription Status
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {user?.subscriptionStatus || "INACTIVE"}
              </p>
            </div>
            {isPro && user?.currentPeriodEnd ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Current Period Ends
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {formatDateOnly(user.currentPeriodEnd)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            {isPro ? (
              <button
                type="button"
                onClick={handleManageSubscription}
                disabled={loadingAction}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-100 disabled:opacity-70"
              >
                {loadingAction ? "Opening Subscription Manager..." : "Manage Subscription"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={loadingAction}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-70"
              >
                {loadingAction ? "Starting Paystack Checkout..." : "Upgrade to Pro Monthly"}
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Free</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">$0</h2>
            <p className="mt-2 text-sm text-slate-400">
              Perfect for testing the journal before you fully commit.
            </p>
            <div className="mt-6 space-y-3">
              {planFeatures.FREE.map((feature) => (
                <div
                  key={feature}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300"
                >
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 shadow-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              <Crown className="h-3.5 w-3.5" />
              Pro Monthly
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white">Unlimited</h2>
            <p className="mt-2 text-sm text-emerald-100/80">
              Built for traders who want the journal to stay available every time a setup appears.
            </p>
            <div className="mt-6 space-y-3">
              {planFeatures.PRO.map((feature) => (
                <div
                  key={feature}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-sm text-white"
                >
                  <Check className="mt-0.5 h-4 w-4 text-emerald-100" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
