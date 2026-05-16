import { useId } from "react";
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
  const inputId = useId();
  const resolvedPreviewUrl = getServerAssetUrl(previewUrl);
  const canUpload = isPro && !disabled;

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

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={!canUpload}
        onChange={onFileChange}
      />

      {resolvedPreviewUrl ? (
        <label
          htmlFor={canUpload ? inputId : undefined}
          className={`mt-4 block overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 transition ${
            canUpload ? "cursor-pointer hover:border-emerald-400/30" : ""
          }`}
        >
          <img
            src={resolvedPreviewUrl}
            alt={title}
            className="h-56 w-full object-cover"
          />
        </label>
      ) : (
        <label
          htmlFor={canUpload ? inputId : undefined}
          className={`mt-4 flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 text-sm text-slate-500 transition ${
            canUpload ? "cursor-pointer hover:border-emerald-400/30 hover:text-slate-300" : ""
          }`}
        >
          No screenshot uploaded yet
        </label>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <label
          htmlFor={canUpload ? inputId : undefined}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
            canUpload
              ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
              : "cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500"
          }`}
        >
          <ImagePlus className="h-4 w-4" />
          {resolvedPreviewUrl ? "Replace Screenshot" : "Upload Screenshot"}
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
