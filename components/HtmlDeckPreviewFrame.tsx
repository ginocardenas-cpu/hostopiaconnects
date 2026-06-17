"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  appLocaleToDeckLang,
  applyAssetLang,
  DECK_LANG_OPTIONS,
  detectDeckI18nInIframe,
  isHtmlDeckAsset,
  preseedAssetLang,
  resolveAssetPreviewMeta,
  type DeckLang,
} from "@/lib/html-deck-i18n";

interface HtmlDeckPreviewFrameProps {
  fileUrl: string;
  title: string;
  /** Inventory Filename — resolves storage key + deck i18n wiring. */
  fileName?: string;
  className?: string;
}

export function HtmlDeckPreviewFrame({
  fileUrl,
  title,
  fileName,
  className,
}: HtmlDeckPreviewFrameProps) {
  const t = useTranslations("asset");
  const portalLocale = useLocale();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sourceName = useMemo(() => {
    if (fileName?.trim()) return fileName.trim();
    try {
      const seg = fileUrl.split("?")[0]?.split("#")[0] ?? "";
      return decodeURIComponent(seg.split("/").pop() ?? "");
    } catch {
      return fileUrl.split("/").pop() ?? "";
    }
  }, [fileName, fileUrl]);

  const previewMeta = useMemo(
    () => resolveAssetPreviewMeta(sourceName),
    [sourceName]
  );
  const expectsI18n = useMemo(() => isHtmlDeckAsset(sourceName), [sourceName]);

  const [deckLang, setDeckLang] = useState<DeckLang>(() =>
    appLocaleToDeckLang(portalLocale)
  );
  const [supportsI18n, setSupportsI18n] = useState(expectsI18n);

  useEffect(() => {
    setDeckLang(appLocaleToDeckLang(portalLocale));
  }, [portalLocale, fileUrl]);

  useEffect(() => {
    if (previewMeta) {
      preseedAssetLang(previewMeta.storageKey, deckLang);
    }
  }, [previewMeta, deckLang, fileUrl]);

  const syncIframeLang = useCallback(
    (lang: DeckLang) => {
      applyAssetLang(iframeRef.current, lang, { hideToggle: true });
    },
    []
  );

  const handleIframeLoad = useCallback(() => {
    const detected = detectDeckI18nInIframe(iframeRef.current);
    if (detected || expectsI18n) {
      setSupportsI18n(true);
      syncIframeLang(deckLang);
    }
  }, [deckLang, expectsI18n, syncIframeLang]);

  useEffect(() => {
    if (supportsI18n) {
      syncIframeLang(deckLang);
    }
  }, [deckLang, supportsI18n, syncIframeLang]);

  const applyLang = useCallback(
    (lang: DeckLang) => {
      setDeckLang(lang);
      if (previewMeta) {
        preseedAssetLang(previewMeta.storageKey, lang);
      }
      syncIframeLang(lang);
    },
    [previewMeta, syncIframeLang]
  );

  return (
    <div className={cn("flex h-[min(72vh,640px)] flex-col", className)}>
      {supportsI18n && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-black/8 bg-white px-4 py-2 font-raleway">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">
            {t("previewDocumentLanguage")}
          </span>
          <div className="flex flex-wrap gap-1">
            {DECK_LANG_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => applyLang(opt.code)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold font-montserrat transition",
                  deckLang === opt.code
                    ? "bg-teal text-white"
                    : "bg-cream text-gray-700 hover:bg-cream-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={title}
        src={fileUrl}
        onLoad={handleIframeLoad}
        className="h-full w-full flex-1 border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
