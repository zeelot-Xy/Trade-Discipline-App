import ToggleSwitch from "./ToggleSwitch.jsx";
import { calculateSectionScore } from "../utils/calculateConfluence.js";

export default function ChecklistSection({ section, onToggle }) {
  const sectionScore = calculateSectionScore(section);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-2xl transition duration-300 hover:scale-[1.01]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{section.title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            Toggle each condition that is present in your current setup.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
            Section Score
          </p>
          <p className="text-lg font-semibold text-emerald-300">{sectionScore}</p>
        </div>
      </div>

      <div className="space-y-3">
        {section.conditions.map((condition) => (
          <div
            key={`${section.id}-${condition.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">{condition.label}</p>
              <p className="text-xs text-slate-400">
                Weight: {condition.weight}
                {condition.required ? " · Required confirmation" : ""}
              </p>
            </div>
            <ToggleSwitch
              checked={condition.checked}
              label={condition.label}
              onToggle={() => onToggle(section.id, condition.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
