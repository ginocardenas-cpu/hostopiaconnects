"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { HtmlDeckPreviewFrame } from "@/components/HtmlDeckPreviewFrame";

function fileExtensionFromUrl(url: string): string {
  try {
    const pathOnly = url.split("?")[0]?.split("#")[0] ?? "";
    const seg = pathOnly.split("/").pop() ?? "";
    const decoded = decodeURIComponent(seg);
    const m = decoded.match(/\.([a-z0-9]+)$/i);
    return m ? m[1].toLowerCase() : "";
  } catch {
    return "";
  }
}

function isExternalPlayerUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.includes("sundaysky.com") ||
      host.includes("youtube.com") ||
      host.includes("youtu.be") ||
      host.includes("vimeo.com")
    );
  } catch {
    return false;
  }
}

type PreviewMode = "iframe" | "image" | "video" | "embed" | "none";

function previewModeFor(
  fileUrl: string,
  previewUrl?: string
): { mode: PreviewMode; src: string; ext: string } {
  if (previewUrl?.trim()) {
    return { mode: "embed", src: previewUrl.trim(), ext: "" };
  }
  const ext = fileExtensionFromUrl(fileUrl);
  if (isExternalPlayerUrl(fileUrl)) {
    return { mode: "embed", src: fileUrl, ext };
  }
  if (["html", "htm", "pdf"].includes(ext)) {
    return { mode: "iframe", src: fileUrl, ext };
  }
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
    return { mode: "image", src: fileUrl, ext };
  }
  if (["mp4", "webm", "ogg"].includes(ext)) {
    return { mode: "video", src: fileUrl, ext };
  }
  return { mode: "none", src: fileUrl, ext };
}

export function AssetPreviewButton({
  fileUrl,
  title,
  fileName,
  previewUrl,
  className,
}: {
  fileUrl: string;
  title: string;
  /** Inventory Filename; wires preview-mode applyLang for HTML bundles. */
  fileName?: string;
  /** Optional multi-language player (e.g. SundaySky). Preferred over fileUrl for Preview. */
  previewUrl?: string;
  /** Tailwind + layout classes for the trigger (match surrounding buttons). */
  className?: string;
}) {
  const t = useTranslations("asset");
  const [open, setOpen] = useState(false);
  const { mode, src, ext } = useMemo(
    () => previewModeFor(fileUrl, previewUrl),
    [fileUrl, previewUrl]
  );
  const sourceName = useMemo(() => {
    if (fileName?.trim()) return fileName.trim();
    try {
      const seg = fileUrl.split("?")[0]?.split("#")[0] ?? "";
      return decodeURIComponent(seg.split("/").pop() ?? "");
    } catch {
      return fileUrl.split("/").pop() ?? "";
    }
  }, [fileName, fileUrl]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-charcoal/20 bg-white px-6 py-2 font-montserrat text-sm font-semibold text-charcoal transition hover:border-teal hover:bg-cream",
            className
          )}
        >
          <FileText size={16} aria-hidden />
          {t("preview")}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[100] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 font-raleway"
        />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[101] flex max-h-[min(92vh,900px)] w-[min(96vw,56rem)] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/8 px-5 py-4">
            <Dialog.Title
              className="pr-8 text-base font-bold leading-snug text-charcoal md:text-lg font-montserrat"
            >
              {title}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {t("previewFooterHint")}
            </Dialog.Description>
            <Dialog.Close
              type="button"
              className="rounded-full p-2 text-gray-500 transition hover:bg-cream hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              aria-label={t("previewClose")}
            >
              <X className="h-5 w-5" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden bg-[#f4f4f2]">
            {mode === "embed" && (
              <div className="flex h-[min(72vh,640px)] flex-col bg-black">
                <iframe
                  title={title}
                  src={src}
                  className="h-full w-full flex-1 border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <p className="shrink-0 border-t border-white/10 bg-charcoal px-4 py-2 text-xs text-white/80 font-raleway">
                  {t("previewVideoPlayerHint")}
                </p>
              </div>
            )}
            {mode === "iframe" && ext === "html" && (
              <HtmlDeckPreviewFrame
                fileUrl={src}
                title={title}
                fileName={sourceName}
              />
            )}
            {mode === "iframe" && ext !== "html" && (
              <div className="flex h-[min(72vh,640px)] flex-col">
                <iframe
                  title={title}
                  src={src}
                  className="h-full w-full flex-1 border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"
                />
                {ext === "pdf" && (
                  <p
                    className="shrink-0 border-t border-black/8 bg-white px-4 py-2 text-xs text-gray-600 font-raleway"
                  >
                    {t("previewPdfToolbarNote")}
                  </p>
                )}
              </div>
            )}
            {mode === "image" && (
              <div className="flex max-h-[min(72vh,640px)] justify-center overflow-auto p-4">
                <img
                  src={src}
                  alt=""
                  className="max-h-full max-w-full object-contain shadow-sm"
                />
              </div>
            )}
            {mode === "video" && (
              <div className="flex max-h-[min(72vh,640px)] items-center justify-center overflow-auto bg-black p-2">
                <video
                  controls
                  controlsList="nodownload noplaybackrate"
                  className="max-h-full max-w-full"
                  src={src}
                />
              </div>
            )}
            {mode === "none" && (
              <div
                className="flex max-h-[min(72vh,640px)] items-center justify-center px-6 py-16 text-center text-sm text-gray-700 font-raleway"
              >
                {t("previewUnavailable")}
              </div>
            )}
          </div>

          <div
            className="shrink-0 border-t border-black/8 bg-white px-5 py-3 text-center text-xs text-gray-600 font-raleway"
          >
            {t("previewFooterHint")}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
