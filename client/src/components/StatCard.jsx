export default function StatCard({ label, value, accent = "emerald", helper }) {
  const accentClassMap = {
    emerald: "text-emerald-300 border-emerald-500/10 bg-emerald-500/8",
    red: "text-red-300 border-red-500/10 bg-red-500/8",
    cyan: "text-cyan-300 border-cyan-500/10 bg-cyan-500/8",
    amber: "text-amber-300 border-amber-500/10 bg-amber-500/8"
  };

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-2xl">
      <div
        className={`inline-flex rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.2em] ${
          accentClassMap[accent]
        }`}
      >
        {label}
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </article>
  );
}
