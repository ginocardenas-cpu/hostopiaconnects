"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  appLocaleToDeckLang,
  applyDeckLangToIframe,
  DECK_LANG_OPTIONS,
  detectDeckI18nInIframe,
  type DeckLang,
} from "@/lib/html-deck-i18n";

interface HtmlDeckPreviewFrameProps {
  fileUrl: string;
  title: string;
  /** When true, show language toolbar and wire applyLang after load. */
  expectDeckI18n?: boolean;
  className?: string;
}

export function HtmlDeckPreviewFrame({
  fileUrl,
  title,
  expectDeckI18n = false,
  className,
}: HtmlDeckPreviewFrameProps) {
  const t = useTranslations("asset");
  const portalLocale = useLocale();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deckLang, setDeckLang] = useState<DeckLang>(() => appLocaleToDeckLang(portalLocale));
  const [supportsI18n, setSupportsI18n] = useState(expectDeckI18n);

  useEffect(() => {
    setDeckLang(appLocaleToDeckLang(portalLocale));
  }, [portalLocale, fileUrl]);

  const applyLang = useCallback((lang: DeckLang) => {
    setDeckLang(lang);
    applyDeckLangToIframe(iframeRef.current, lang);
  }, []);

  const handleIframeLoad = useCallback(() => {
    const detected = detectDeckI18nInIframe(iframeRef.current);
    if (detected) setSupportsI18n(true);
    if (detected || expectDeckI18n) {
      const lang = appLocaleToDeckLang(portalLocale);
      setDeckLang(lang);
      applyDeckLangToIframe(iframeRef.current, lang);
    }
  }, [expectDeckI18n, portalLocale]);

  useEffect(() => {
    if (supportsI18n) {
      applyDeckLangToIframe(iframeRef.current, deckLang);
    }
  }, [deckLang, supportsI18n]);

  return (
    <div className={cn("flex h-[min(72vh,640px)] flex-col", className)}>
      {supportsI18n && (
        <div
          className="flex shrink-0 flex-wrap items-center gap-2 border-b border-black/8 bg-white px-4 py-2"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
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
                  "rounded-full px-3 py-1 text-[11px] font-semibold transition",
                  deckLang === opt.code
                    ? "bg-[#2CADB2] text-white"
                    : "bg-[#f7f6f2] text-gray-700 hover:bg-[#ecebe6]"
                )}
                style={{ fontFamily: "Montserrat, sans-serif" }}
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
