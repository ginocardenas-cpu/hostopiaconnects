"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { HtmlDeckPreviewFrame } from "@/components/HtmlDeckPreviewFrame";
import { isLikelyHtmlDeckAsset } from "@/lib/html-deck-i18n";

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

type PreviewMode = "iframe" | "image" | "video" | "none";

function previewModeForExt(ext: string): PreviewMode {
  if (["html", "htm", "pdf"].includes(ext)) return "iframe";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "ogg"].includes(ext)) return "video";
  return "none";
}

export function AssetPreviewButton({
  fileUrl,
  title,
  fileName,
  className,
}: {
  fileUrl: string;
  title: string;
  /** Inventory Filename; used to detect Logo Design HTML decks with applyLang. */
  fileName?: string;
  /** Tailwind + layout classes for the trigger (match surrounding buttons). */
  className?: string;
}) {
  const t = useTranslations("asset");
  const [open, setOpen] = useState(false);
  const ext = useMemo(() => fileExtensionFromUrl(fileUrl), [fileUrl]);
  const mode = useMemo(() => previewModeForExt(ext), [ext]);
  const sourceName = useMemo(() => {
    if (fileName?.trim()) return fileName.trim();
    try {
      const seg = fileUrl.split("?")[0]?.split("#")[0] ?? "";
      return decodeURIComponent(seg.split("/").pop() ?? "");
    } catch {
      return fileUrl.split("/").pop() ?? "";
    }
  }, [fileName, fileUrl]);
  const expectDeckI18n = useMemo(
    () => ext === "html" && isLikelyHtmlDeckAsset(sourceName),
    [ext, sourceName]
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold border border-[#24282B]/20 bg-white transition hover:bg-[#f7f6f2] hover:border-[#2CADB2]",
            className
          )}
          style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
        >
          <FileText size={16} aria-hidden />
          {t("preview")}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[100] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ fontFamily: "Raleway, sans-serif" }}
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
              className="pr-8 text-base font-bold leading-snug text-[#24282B] md:text-lg"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {title}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {t("previewFooterHint")}
            </Dialog.Description>
            <Dialog.Close
              type="button"
              className="rounded-full p-2 text-gray-500 transition hover:bg-[#f7f6f2] hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2CADB2]"
              aria-label={t("previewClose")}
            >
              <X className="h-5 w-5" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden bg-[#f4f4f2]">
            {mode === "iframe" && ext === "html" && (
              <HtmlDeckPreviewFrame
                fileUrl={fileUrl}
                title={title}
                expectDeckI18n={expectDeckI18n}
              />
            )}
            {mode === "iframe" && ext !== "html" && (
              <div className="flex h-[min(72vh,640px)] flex-col">
                <iframe
                  title={title}
                  src={fileUrl}
                  className="h-full w-full flex-1 border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"
                />
                {ext === "pdf" && (
                  <p
                    className="shrink-0 border-t border-black/8 bg-white px-4 py-2 text-xs text-gray-600"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {t("previewPdfToolbarNote")}
                  </p>
                )}
              </div>
            )}
            {mode === "image" && (
              <div className="flex max-h-[min(72vh,640px)] justify-center overflow-auto p-4">
                {/* Same-origin catalog files under /assets — img is appropriate for modal preview. */}
                <img src={fileUrl} alt="" className="max-h-full max-w-full object-contain shadow-sm" />
              </div>
            )}
            {mode === "video" && (
              <div className="flex max-h-[min(72vh,640px)] items-center justify-center overflow-auto bg-black p-2">
                <video
                  controls
                  controlsList="nodownload noplaybackrate"
                  className="max-h-full max-w-full"
                  src={fileUrl}
                />
              </div>
            )}
            {mode === "none" && (
              <div
                className="flex max-h-[min(72vh,640px)] items-center justify-center px-6 py-16 text-center text-sm text-gray-700"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {t("previewUnavailable")}
              </div>
            )}
          </div>

          <div
            className="shrink-0 border-t border-black/8 bg-white px-5 py-3 text-center text-xs text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {t("previewFooterHint")}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
