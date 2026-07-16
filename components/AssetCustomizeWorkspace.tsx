"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Asset } from "@/lib/assets";
import { getAssetSourceFileName } from "@/lib/assets";
import { assetSupportsDeckI18n } from "@/lib/html-deck-i18n";
import {
  availableExportFormats,
  defaultExportFormat,
  type ExportFormat,
} from "@/lib/export/formats";
import { shouldApplyBrandOnExport, slimBrandProfileForExport } from "@/lib/brand-profile";
import { useBrandProfile } from "@/components/BrandProfileProvider";
import { useCart } from "@/components/CartProvider";
import { BrandPreviewFrame } from "@/components/BrandPreviewFrame";
import { BrandStudioControls } from "@/components/BrandStudioControls";
import type { DeckLang } from "@/lib/html-deck-i18n";
import { appLocaleToDeckLang } from "@/lib/html-deck-i18n";
import { useLocale } from "next-intl";

interface AssetCustomizeWorkspaceProps {
  asset: Asset;
  displayTitle: string;
}

export function AssetCustomizeWorkspace({
  asset,
  displayTitle,
}: AssetCustomizeWorkspaceProps) {
  const t = useTranslations("brandStudio");
  const tAsset = useTranslations("asset");
  const portalLocale = useLocale();
  const { profile, updateProfile, saveProfile, resetProfile } = useBrandProfile();
  const { addItem, items } = useCart();
  const sourceFile = getAssetSourceFileName(asset);
  const supportsHtml = assetSupportsDeckI18n(sourceFile);

  const [draftProfile, setDraftProfile] = useState(profile);
  const [deckLang, setDeckLang] = useState<DeckLang>(() =>
    appLocaleToDeckLang(portalLocale)
  );

  useEffect(() => {
    setDraftProfile(profile);
  }, [profile]);
  // HTML is the reliable path for branded exports (no Playwright on serverless).
  const [exportFormat, setExportFormat] = useState<ExportFormat>(() =>
    supportsHtml ? "html" : defaultExportFormat(asset.contentType, sourceFile)
  );

  const formatOptions = useMemo(
    () => availableExportFormats(asset.contentType, sourceFile),
    [asset.contentType, sourceFile]
  );

  const inCart = items.some((item) => item.assetId === asset.id);
  const applyBrand = shouldApplyBrandOnExport(draftProfile);

  const handleApplyDraft = () => {
    updateProfile(draftProfile);
    saveProfile(draftProfile);
  };

  const handleAddToCart = () => {
    handleApplyDraft();
    addItem(asset.id, {
      deckLang,
      exportFormat,
      ...(applyBrand ? { brandProfile: slimBrandProfileForExport(draftProfile) } : {}),
    });
  };

  if (!supportsHtml) {
    return (
      <p className="text-sm text-gray-600 font-raleway">
        {t("htmlOnly")}{" "}
        <Link href={`/assets/${asset.slug}`} className="text-teal underline">
          {t("backToAsset")}
        </Link>
      </p>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <div className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm">
          <BrandStudioControls
            profile={draftProfile}
            onChange={(patch) =>
              setDraftProfile((prev) => ({
                ...prev,
                ...patch,
                colors: { ...prev.colors, ...(patch.colors ?? {}) },
                content: { ...prev.content, ...(patch.content ?? {}) },
                cta: patch.cta
                  ? {
                      ...prev.cta,
                      ...patch.cta,
                      links: patch.cta.links ?? prev.cta.links,
                    }
                  : prev.cta,
              }))
            }
            onSave={handleApplyDraft}
            onReset={() => {
              resetProfile();
              setDraftProfile(profile);
            }}
          />
        </div>

        <div className="rounded-2xl border border-black/6 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 font-montserrat">
            {t("exportSection")}
          </h2>

          <label className="block text-sm font-raleway">
            <span className="mb-1 block text-gray-600">{tAsset("addChooseDocumentLanguage")}</span>
            <select
              value={deckLang}
              onChange={(e) => setDeckLang(e.target.value as DeckLang)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            >
              {["en", "fr", "es", "de", "pt"].map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-raleway">
            <span className="mb-1 block text-gray-600">{tAsset("addChooseExportFormat")}</span>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            >
              {formatOptions.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {tAsset(`exportFormat_${fmt}`)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {tAsset(`exportFormatHint_${exportFormat}`)}
            </p>
            {applyBrand ? (
              <p className="mt-2 text-xs text-teal font-medium">{t("brandedFormatHint")}</p>
            ) : null}
          </label>

          <button
            type="button"
            disabled={inCart}
            onClick={handleAddToCart}
            className="w-full inline-flex items-center justify-center rounded-full bg-teal px-5 py-3 text-xs font-bold text-white font-montserrat hover:bg-teal-dark transition disabled:opacity-60"
          >
            {inCart ? tAsset("addedWithLanguageAndFormat", {
              language: deckLang.toUpperCase(),
              format: tAsset(`exportFormat_${exportFormat}`),
            }) : t("addCustomized")}
          </button>
        </div>
      </aside>

      <div className="rounded-2xl border border-black/6 bg-white p-3 shadow-sm min-h-[480px]">
        <BrandPreviewFrame
          fileUrl={asset.fileUrl}
          title={displayTitle}
          fileName={sourceFile}
          brandProfile={draftProfile}
          className="h-[min(78vh,760px)]"
        />
      </div>
    </div>
  );
}
