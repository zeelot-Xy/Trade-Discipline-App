import { FileSpreadsheet, MoveHorizontal, ShieldCheck, UploadCloud } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import ErrorMessage from "../components/ErrorMessage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { genericImportFieldOptions } from "../data/tradeSources.js";
import importService from "../services/importService.js";
import { formatCurrency } from "../utils/formatters.js";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60";

const sourceOptions = [
  {
    key: "csv",
    label: "Generic CSV",
    description: "Map columns from almost any exported trade CSV before importing.",
  },
  {
    key: "mt",
    label: "MT4 / MT5 Statement",
    description: "Import the most common MetaTrader report or statement exports.",
  },
];

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.readAsText(file);
  });

const formatImportPreviewDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function ImportsPage() {
  const { user, usage, setUsage } = useAuth();
  const [sourceType, setSourceType] = useState("csv");
  const [fileMeta, setFileMeta] = useState(null);
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showScrollHint, setShowScrollHint] = useState(true);
  const previewTableRef = useRef(null);

  const isPro = user?.planType === "PRO";
  const canPreviewMappedCsv = useMemo(
    () => Boolean(mapping.symbol?.trim() && mapping.tradeDate?.trim()),
    [mapping],
  );
  const mappedProfitLossHeader = useMemo(() => mapping.profitLoss?.trim() || "", [mapping]);
  const previewHasMissingProfitLoss = useMemo(
    () =>
      Boolean(
        preview?.normalizedRows?.some(
          (row) => row.profitLoss === null || row.profitLoss === undefined,
        ),
      ),
    [preview],
  );

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const fileContent = await readFileAsText(file);
      setFileMeta({
        fileName: file.name,
        fileContent,
      });
      setPreview(null);
      setMapping({});
      setMessage("");
      setError("");
    } catch (fileError) {
      setError(fileError.message);
    }
  };

  const handleAnalyze = async () => {
    if (!fileMeta) {
      setError("Choose a CSV or statement file before analyzing.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response =
        sourceType === "csv"
          ? await importService.previewCsv({
              fileName: fileMeta.fileName,
              fileContent: fileMeta.fileContent,
            })
          : await importService.previewMt({
              fileName: fileMeta.fileName,
              fileContent: fileMeta.fileContent,
            });

      setPreview(response);
      if (response.suggestedMapping) {
        setMapping(response.suggestedMapping);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewMappedRows = async () => {
    if (!fileMeta || !canPreviewMappedCsv) {
      setError("Map at least Symbol and Trade Date before previewing the import.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await importService.previewCsv({
        fileName: fileMeta.fileName,
        fileContent: fileMeta.fileContent,
        mapping,
      });
      setPreview(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview?.normalizedRows?.length) {
      setError("Preview the imported trades before confirming.");
      return;
    }

    try {
      setConfirming(true);
      setError("");
      const response =
        sourceType === "csv"
          ? await importService.confirmCsv({ normalizedRows: preview.normalizedRows })
          : await importService.confirmMt({ normalizedRows: preview.normalizedRows });

      if (response.usage) {
        setUsage(response.usage);
      }

      setMessage(
        `Imported ${response.createdCount} trade(s). Skipped ${response.skippedCount} row(s), including ${response.duplicateCount} duplicate(s).`,
      );
      setPreview(null);
      setFileMeta(null);
      setMapping({});
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setConfirming(false);
    }
  };

  const handlePreviewTableScroll = () => {
    const element = previewTableRef.current;
    if (!element) {
      return;
    }

    const remainingScroll =
      element.scrollWidth - element.clientWidth - element.scrollLeft;

    setShowScrollHint(remainingScroll > 12);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">Trade Imports</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Bring historical trades in without faking checklist data
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          Use imports for already-executed trade history. Imported rows become journal records with
          honest source labels, while manual entries remain the full pre-trade checklist workflow.
        </p>
      </section>

      <ErrorMessage message={error} />
      {message ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2 text-white">
            <UploadCloud className="h-4 w-4 text-emerald-300" />
            <h2 className="text-xl font-semibold">Choose Source</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {sourceOptions.map((option) => {
              const selected = option.key === sourceType;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setSourceType(option.key);
                    setPreview(null);
                    setMapping({});
                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-3xl border p-4 text-left transition ${
                    selected
                      ? "border-emerald-400/40 bg-emerald-500/10"
                      : "border-white/10 bg-slate-950/45 hover:border-white/20"
                  }`}
                >
                  <p className="text-lg font-semibold text-white">{option.label}</p>
                  <p className="mt-2 text-sm text-slate-400">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <h2 className="text-xl font-semibold">Import Rules</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>Imported trades are saved as historical records, not checklist-backed live setups.</p>
            <p>Missing checklist, confluence, and setup quality values stay unrecorded for imported rows.</p>
            <p>Import preview is available to all signed-in users. Saving imported trades is a Pro feature.</p>
            {!isPro ? (
              <Link
                to="/upgrade"
                className="mt-3 inline-flex items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15"
              >
                Upgrade to unlock imports
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="text-sm font-medium text-white">Upload file</label>
            <input className={`${inputClassName} mt-3`} type="file" accept=".csv,.html,.htm,.txt" onChange={handleFileChange} />
            <p className="mt-2 text-xs text-slate-500">
              {fileMeta ? `Loaded ${fileMeta.fileName}` : "Accepted: CSV, HTML statements, and text exports."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!fileMeta || loading}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Analyzing..." : sourceType === "csv" ? "Detect Columns" : "Preview Statement"}
          </button>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
          <LoadingSpinner label="Preparing import preview..." />
        </div>
      ) : null}

      {preview?.requiresMapping ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-white">
            <FileSpreadsheet className="h-4 w-4 text-emerald-300" />
            <h2 className="text-xl font-semibold">Map CSV Columns</h2>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Match your CSV headers to the fields TradeCadet understands before normalizing the rows.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {genericImportFieldOptions.map((field) => (
              <label key={field.key} className="space-y-2 text-sm text-slate-300">
                <span>{field.label}</span>
                <select
                  className={inputClassName}
                  value={mapping[field.key] || ""}
                  onChange={(event) =>
                    setMapping((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                >
                  <option value="">Not mapped</option>
                  {preview.detectedColumns.map((column) => (
                    <option key={`${field.key}-${column}`} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              Parsed {preview.summary.parsedRows} row(s). Symbol and Trade Date are required.
            </p>
            <button
              type="button"
              onClick={handlePreviewMappedRows}
              disabled={!canPreviewMappedCsv || loading}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Preview Normalized Trades
            </button>
          </div>
        </section>
      ) : null}

      {preview?.normalizedRows?.length ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Import Preview</h2>
              <p className="mt-2 text-sm text-slate-400">
                Review normalized rows, duplicates, and missing values before saving them as imported trades.
              </p>
              {!mappedProfitLossHeader && previewHasMissingProfitLoss ? (
                <p className="mt-2 text-sm text-amber-200">
                  Profit / Loss is not mapped yet, so preview rows without imported P/L will show
                  as <span className="font-semibold">Not mapped</span> instead of a misleading zero.
                </p>
              ) : null}
            </div>
            <div className="grid gap-2 text-right text-sm text-slate-300">
              <p>Rows parsed: {preview.summary.parsedRows}</p>
              <p>Valid: {preview.summary.validRows}</p>
              <p>Duplicates: {preview.summary.duplicateRows}</p>
            </div>
          </div>

          <div className="relative mt-5">
            <div
              ref={previewTableRef}
              onScroll={handlePreviewTableScroll}
              className="overflow-x-auto rounded-2xl border border-white/10"
            >
              <table className="min-w-[760px] text-left text-sm xl:min-w-0 xl:w-full">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="whitespace-nowrap px-3 py-3">Row</th>
                  <th className="whitespace-nowrap px-3 py-3">Symbol</th>
                  <th className="whitespace-nowrap px-3 py-3">Direction</th>
                  <th className="whitespace-nowrap px-3 py-3">Date</th>
                  <th className="whitespace-nowrap px-3 py-3">P/L</th>
                  <th className="whitespace-nowrap px-3 py-3">Status</th>
                  <th className="whitespace-nowrap px-3 py-3">Issues</th>
                </tr>
              </thead>
              <tbody>
                {preview.normalizedRows.slice(0, 50).map((row) => (
                  <tr key={`preview-row-${row.rowNumber}`} className="border-b border-white/[0.06] text-slate-200">
                    <td className="whitespace-nowrap px-3 py-3 align-top">{row.rowNumber}</td>
                    <td className="whitespace-nowrap px-3 py-3 align-top">{row.symbol || "Missing"}</td>
                    <td className="whitespace-nowrap px-3 py-3 align-top">{row.direction || "--"}</td>
                    <td className="px-3 py-3 align-top">
                      <span className="inline-block whitespace-nowrap text-sm">
                        {row.tradeDate ? formatImportPreviewDate(row.tradeDate) : "Missing"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 align-top">
                      {row.profitLoss !== null && row.profitLoss !== undefined ? (
                        formatCurrency(row.profitLoss)
                      ) : (
                        <span className="text-amber-300">Not mapped</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 align-top">{row.status}</td>
                    <td className="px-3 py-3 align-top">
                      {row.duplicateOf ? (
                        <span className="text-amber-300">Duplicate of existing trade</span>
                      ) : row.issues?.length ? (
                        <span className="text-red-300">{row.issues.join(" ")}</span>
                      ) : row.profitLoss === null || row.profitLoss === undefined ? (
                        <span className="text-amber-300">Ready, but P/L missing</span>
                      ) : (
                        <span className="text-emerald-300">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
            {showScrollHint ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center xl:hidden">
                <div className="h-full w-16 bg-gradient-to-l from-slate-950/95 via-slate-950/70 to-transparent" />
                <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/85 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-lg backdrop-blur">
                  <MoveHorizontal className="h-3.5 w-3.5 text-emerald-300" />
                  Scroll
                </div>
              </div>
            ) : null}
          </div>

          {preview.normalizedRows.length > 50 ? (
            <p className="mt-3 text-xs text-slate-500">
              Showing the first 50 preview rows. The full batch will still be processed on confirm.
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              Imported rows will count toward saved trade usage and appear in history, dashboard, and trade detail with imported source badges.
            </p>
            {isPro ? (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={confirming || !preview.summary.validRows}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {confirming ? "Importing..." : "Confirm Import"}
              </button>
            ) : (
              <Link
                to="/upgrade"
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 font-semibold text-emerald-100 transition hover:bg-emerald-500/15"
              >
                Upgrade to Confirm Import
              </Link>
            )}
          </div>
        </section>
      ) : null}

      {usage?.tradeLimit !== null ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-2xl">
          <p className="text-sm text-slate-300">
            Current usage: {usage.savedTrades} / {usage.tradeLimit} saved trades on the Free plan.
          </p>
        </section>
      ) : null}
    </div>
  );
}
