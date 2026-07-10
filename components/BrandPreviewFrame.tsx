"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { BrandProfile } from "@/lib/brand-profile";
import {
  applyBrandToIframe,
  scheduleBrandApplyToIframe,
} from "@/lib/brand-apply";
import {
  appLocaleToDeckLang,
  applyAssetLang,
  DECK_LANG_OPTIONS,
  detectDeckI18nInIframe,
  detectIframeMissingAsset,
  preseedAssetLang,
  resolveAssetPreviewMeta,
  type DeckLang,
} from "@/lib/html-deck-i18n";

interface BrandPreviewFrameProps {
  fileUrl: string;
  title: string;
  fileName?: string;
  brandProfile: BrandProfile;
  className?: string;
}

export function BrandPreviewFrame({
  fileUrl,
  title,
  fileName,
  brandProfile,
  className,
}: BrandPreviewFrameProps) {
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

  const [deckLang, setDeckLang] = useState<DeckLang>(() =>
    appLocaleToDeckLang(portalLocale)
  );
  const [supportsI18n, setSupportsI18n] = useState(false);
  const [missingFile, setMissingFile] = useState(false);

  useEffect(() => {
    setDeckLang(appLocaleToDeckLang(portalLocale));
    setSupportsI18n(false);
    setMissingFile(false);
  }, [portalLocale, fileUrl]);

  useEffect(() => {
    if (previewMeta && supportsI18n) {
      preseedAssetLang(previewMeta.storageKey, deckLang);
    }
  }, [previewMeta, deckLang, fileUrl, supportsI18n]);

  const syncIframe = useCallback(
    (lang: DeckLang) => {
      applyAssetLang(iframeRef.current, lang, { hideToggle: true });
      scheduleBrandApplyToIframe(iframeRef.current, brandProfile);
    },
    [brandProfile]
  );

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (detectIframeMissingAsset(iframe)) {
      setMissingFile(true);
      setSupportsI18n(false);
      return;
    }

    const detected = detectDeckI18nInIframe(iframe);
    setSupportsI18n(detected);
    if (detected) {
      syncIframe(deckLang);
    } else {
      applyBrandToIframe(iframe, brandProfile);
    }
  }, [brandProfile, deckLang, syncIframe]);

  useEffect(() => {
    if (supportsI18n) {
      syncIframe(deckLang);
    } else {
      applyBrandToIframe(iframeRef.current, brandProfile);
    }
  }, [deckLang, supportsI18n, brandProfile, syncIframe]);

  const applyLang = useCallback(
    (lang: DeckLang) => {
      if (!supportsI18n) return;
      setDeckLang(lang);
      if (previewMeta) {
        preseedAssetLang(previewMeta.storageKey, lang);
      }
      syncIframe(lang);
    },
    [previewMeta, supportsI18n, syncIframe]
  );

  return (
    <div className={cn("flex h-[min(72vh,640px)] flex-col", className)}>
      {supportsI18n && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-black/8 bg-white px-4 py-2 font-raleway">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500">
            {t("previewDocumentLanguage")}
          </span>
          <div className="flex flex-wrap gap-1.5">
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
      <div className="relative min-h-0 flex-1">
        {missingFile && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white px-6 text-center font-raleway">
            <div className="max-w-md">
              <p className="text-base font-semibold text-charcoal font-montserrat">
                {t("previewFileMissingTitle")}
              </p>
              <p className="mt-2 text-sm text-gray-600">{t("previewFileMissingBody")}</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          title={title}
          src={fileUrl}
          onLoad={handleIframeLoad}
          className={cn(
            "h-full w-full border-0 bg-white",
            missingFile && "invisible"
          )}
          sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
