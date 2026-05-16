import { ImagePlus, Lock, Trash2 } from "lucide-react";

import { getServerAssetUrl } from "../utils/serverAssets.js";

export default function ScreenshotUploader({
  title,
  helper,
  isPro,
  previewUrl,
  onFileChange,
  onRemove,
  disabled = false,
}) {
  const resolvedPreviewUrl = getServerAssetUrl(previewUrl);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{helper}</p>
        </div>
        {!isPro ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
            <Lock className="h-3.5 w-3.5" />
            Pro
          </span>
        ) : null}
      </div>

      {resolvedPreviewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
          <img
            src={resolvedPreviewUrl}
            alt={title}
            className="h-56 w-full object-cover"
          />
        </div>
      ) : (
        <div className="mt-4 flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 text-sm text-slate-500">
          No screenshot uploaded yet
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
            isPro && !disabled
              ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
              : "cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500"
          }`}
        >
          <ImagePlus className="h-4 w-4" />
          {resolvedPreviewUrl ? "Replace Screenshot" : "Upload Screenshot"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={!isPro || disabled}
            onChange={onFileChange}
          />
        </label>

        {resolvedPreviewUrl ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={!isPro || disabled}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              isPro && !disabled
                ? "border border-red-500/20 bg-red-500/10 text-red-100 hover:bg-red-500/15"
                : "cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        ) : null}
      </div>

      {!isPro ? (
        <p className="mt-3 text-xs text-slate-500">
          Screenshot journaling is available on the Pro plan.
        </p>
      ) : null}
    </div>
  );
}
