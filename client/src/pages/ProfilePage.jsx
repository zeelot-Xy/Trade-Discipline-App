import { CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import billingService from "../services/billingService.js";
import { formatDateOnly } from "../utils/formatters.js";

const getInitials = (fullName = "") =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

export default function ProfilePage() {
  const { user, usage } = useAuth();
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");
  const location = useLocation();
  const initials = getInitials(user?.fullName);
  const isPro = user?.planType === "PRO";
  const usageText =
    usage?.tradeLimit === null
      ? `${usage?.savedTrades || 0} trades saved with unlimited Pro access`
      : `${usage?.savedTrades || 0} / ${usage?.tradeLimit || 25} free trades used`;

  const handleManageSubscription = async () => {
    try {
      setBillingLoading(true);
      setBillingError("");
      const response = await billingService.createCustomerPortalSession();
      window.location.assign(response.url);
    } catch (requestError) {
      setBillingError(requestError.message);
      setBillingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">
          Profile
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Your trading identity
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          Keep your account details, plan status, and upgrade path in one place
          while the trading journal continues to grow.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-2xl font-bold text-slate-950 shadow-lg shadow-emerald-950/30">
              {initials || "TT"}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">
                Account Overview
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {user?.fullName || "Trader"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {user?.email || "No email available"}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                {user?.planType || "FREE"} Plan
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Full Name
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {user?.fullName || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Email
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {user?.email || "Not set"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Member Since
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {user?.createdAt
                  ? formatDateOnly(user.createdAt)
                  : "Not available"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Plan & Usage
              </p>
              <p className="mt-2 text-sm font-medium text-white">{usageText}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">
                Account & Billing
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Ready for SaaS Growth
              </h2>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="font-semibold">
                  {isPro
                    ? "Your Pro subscription is active"
                    : "Free plan with a 25-trade cap"}
                </p>
                <p className="mt-1 text-emerald-100/80">
                  {isPro
                    ? user?.currentPeriodEnd
                      ? `Your current billing period renews on ${formatDateOnly(user.currentPeriodEnd)}.`
                      : "You have unlimited trade saves while your subscription stays active."
                    : "Upgrade to Pro whenever you want unlimited trade saves and uninterrupted journaling."}
                </p>
                {!isPro ? (
                  <p className="mt-2 text-emerald-100/80">
                    Pro also unlocks discipline score analytics and structured
                    mistake review.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {isPro ? (
                <button
                  type="button"
                  onClick={handleManageSubscription}
                  disabled={billingLoading}
                  className="rounded-2xl bg-white px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-100 disabled:opacity-70">
                  {billingLoading ? "Opening portal..." : "Manage Subscription"}
                </button>
              ) : (
                <Link
                  to="/upgrade"
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                  Upgrade to Pro
                </Link>
              )}
            </div>
            {billingError ? (
              <p className="mt-3 text-sm text-red-200">{billingError}</p>
            ) : null}
            {location.search.includes("billing=portal") ? (
              <p className="mt-3 text-sm text-cyan-100">
                Returned from Paystack subscription manager.
              </p>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            {[
              "Profile editing for name and account preferences",
              "Security controls such as password change",
              "Trading preference defaults and strategy presets",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
