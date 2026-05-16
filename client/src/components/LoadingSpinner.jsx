export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
      <span>{label}</span>
    </div>
  );
}
