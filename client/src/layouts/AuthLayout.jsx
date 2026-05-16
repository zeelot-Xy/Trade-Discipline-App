import { Outlet } from "react-router-dom";
import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import TradeCadetLogo from "../components/TradeCadetLogo.jsx";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(160deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.12),_transparent_20%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:block">
          <div className="max-w-xl">
            <TradeCadetLogo
              showWordmark
              className="h-14 w-14"
              titleClassName="text-2xl font-semibold text-white"
              subtitleClassName="text-xs uppercase tracking-[0.3em] text-emerald-300/75"
              subtitle="Journal"
            />
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-white">
              Validate every setup before you ever click the trigger.
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              TradeCadet Journal gives you a weighted confluence engine, journaling
              workflow, and performance dashboard in one calm, focused workspace.
            </p>
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.28em] text-emerald-300/80">
              Record. Review. Refine.
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            {[
              {
                icon: ShieldCheck,
                title: "Checklist-first execution",
                text: "Build discipline into your process with required risk confirmations and structured scoring."
              },
              {
                icon: BarChart3,
                title: "Journal plus analytics",
                text: "Turn every saved setup into measurable performance data across outcome, streaks, and confluence."
              },
              {
                icon: Sparkles,
                title: "Disciplined trader workspace",
                text: "A calm review environment helps you record, review, and refine each trade with focus."
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl"
              >
                <item.icon className="h-5 w-5 text-emerald-300" />
                <h2 className="mt-3 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
