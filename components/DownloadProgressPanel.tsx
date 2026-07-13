"use client";

import { useTranslations } from "next-intl";
import type { DownloadProgress } from "@/lib/trigger-download";

interface DownloadProgressPanelProps {
  progress: DownloadProgress;
  busy: boolean;
}

export function DownloadProgressPanel({
  progress,
  busy,
}: DownloadProgressPanelProps) {
  const t = useTranslations("cart");

  if (!busy && progress.phase === "idle") return null;

  const phaseLabel = (() => {
    switch (progress.phase) {
      case "preparing":
        return t("progressPreparing");
      case "rendering":
        return t("progressRendering");
      case "downloading":
        return t("progressDownloading");
      case "packaging":
        return t("progressPackaging");
      case "complete":
        return t("progressComplete");
      case "error":
        return t("progressError");
      default:
        return t("progressPreparing");
    }
  })();

  const etaLabel =
    progress.etaSeconds != null &&
    progress.etaSeconds > 0 &&
    progress.phase !== "complete" &&
    progress.phase !== "error"
      ? t("progressEta", { seconds: progress.etaSeconds })
      : null;

  return (
    <div className="mt-4 rounded-xl border border-teal/25 bg-white/80 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-teal font-montserrat">
            {phaseLabel}
          </p>
          {progress.currentFile ? (
            <p className="text-[11px] text-gray-600 font-raleway mt-0.5 truncate">
              {progress.fileCount && progress.fileCount > 1
                ? t("progressFileOf", {
                    index: progress.fileIndex ?? 1,
                    count: progress.fileCount,
                    name: progress.currentFile,
                  })
                : progress.currentFile}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-xs font-bold text-charcoal font-montserrat tabular-nums">
          {Math.min(100, Math.max(0, progress.percent))}%
        </p>
      </div>

      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-cream"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${
            progress.phase === "error" ? "bg-red-500" : "bg-teal"
          }`}
          style={{ width: `${Math.min(100, Math.max(2, progress.percent))}%` }}
        />
      </div>

      {etaLabel ? (
        <p className="mt-2 text-[11px] text-gray-500 font-raleway">{etaLabel}</p>
      ) : null}
    </div>
  );
}
