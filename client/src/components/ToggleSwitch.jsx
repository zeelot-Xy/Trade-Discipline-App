export default function ToggleSwitch({ checked, onToggle, label }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-14 items-center rounded-full border transition duration-200 ${
        checked
          ? "border-emerald-400/60 bg-emerald-500"
          : "border-white/10 bg-slate-700/80"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-lg transition duration-200 ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}
