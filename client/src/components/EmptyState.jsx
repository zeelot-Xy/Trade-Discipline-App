import { FolderOpen } from "lucide-react";

export default function EmptyState({ title, description, icon: Icon = FolderOpen }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-2xl">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.08] text-slate-200">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
