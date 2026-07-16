"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { ContentType } from "@/lib/assets";
import {
  availableExportFormats,
  defaultExportFormat,
  type ExportFormat,
} from "@/lib/export/formats";
import { shouldApplyBrandOnExport, slimBrandProfileForExport } from "@/lib/brand-profile";
import { useBrandProfile } from "./BrandProfileProvider";
import { useCart } from "./CartProvider";
import {
  appLocaleToDeckLang,
  DECK_LANG_OPTIONS,
  deckLangLabel,
  assetSupportsDeckI18n,
  type DeckLang,
} from "@/lib/html-deck-i18n";

interface AddToCartButtonProps {
  assetId: string;
  /** Inventory Filename — enables language picker for HTML bundles with applyLang. */
  fileName?: string;
  contentType?: ContentType;
}

export function AddToCartButton({
  assetId,
  fileName = "",
  contentType = "Document",
}: AddToCartButtonProps) {
  const t = useTranslations("asset");
  const portalLocale = useLocale();
  const { addItem, items } = useCart();
  const { profile } = useBrandProfile();
  const cartEntry = items.find((item) => item.assetId === assetId);
  const inCart = Boolean(cartEntry);
  const needsLangPick = useMemo(
    () => assetSupportsDeckI18n(fileName),
    [fileName]
  );

  const formatOptions = useMemo(
    () => availableExportFormats(contentType, fileName),
    [contentType, fileName]
  );

  const [langDialogOpen, setLangDialogOpen] = useState(false);
  const [pendingLang, setPendingLang] = useState<DeckLang>(() =>
    appLocaleToDeckLang(portalLocale)
  );
  const [pendingFormat, setPendingFormat] = useState<ExportFormat>(() =>
    defaultExportFormat(contentType, fileName)
  );

  const handleAdd = (deckLang?: DeckLang, exportFormat?: ExportFormat) => {
    const attachBrand = shouldApplyBrandOnExport(profile);
    addItem(assetId, {
      ...(deckLang ? { deckLang } : {}),
      ...(exportFormat ? { exportFormat } : {}),
      ...(attachBrand ? { brandProfile: slimBrandProfileForExport(profile) } : {}),
    });
    setLangDialogOpen(false);
  };

  const handleClick = () => {
    if (inCart) return;
    if (needsLangPick) {
      setPendingLang(appLocaleToDeckLang(portalLocale));
      setPendingFormat(defaultExportFormat(contentType, fileName));
      setLangDialogOpen(true);
      return;
    }
    handleAdd();
  };

  const addedLabel =
    cartEntry?.deckLang || cartEntry?.exportFormat
      ? t("addedWithLanguageAndFormat", {
          language: cartEntry.deckLang
            ? deckLangLabel(cartEntry.deckLang)
            : t("exportFormatDefault"),
          format: cartEntry.exportFormat
            ? t(`exportFormat_${cartEntry.exportFormat}`)
            : t("exportFormatDefault"),
        })
      : t("addToResources");

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2 font-montserrat text-sm font-bold text-charcoal shadow-md transition hover:bg-gold-dark hover:shadow-lg disabled:cursor-default disabled:opacity-60"
        disabled={inCart}
      >
        {inCart ? addedLabel : t("addToResources")}
      </button>

      <Dialog.Root open={langDialogOpen} onOpenChange={setLangDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[110] bg-black/40" />
          <Dialog.Content
            className="fixed left-[50%] top-[50%] z-[111] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black/10 bg-white p-6 shadow-xl font-raleway max-h-[min(92vh,640px)] overflow-y-auto"
          >
            <Dialog.Title className="text-base font-bold text-charcoal mb-2 font-montserrat">
              {t("addChooseDocumentLanguage")}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              {t("addChooseDocumentLanguageHint")}
            </Dialog.Description>
            <div className="flex flex-wrap gap-2 mb-6">
              {DECK_LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setPendingLang(opt.code)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold font-montserrat transition ${
                    pendingLang === opt.code
                      ? "bg-teal text-white"
                      : "bg-cream text-gray-700 hover:bg-cream-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-charcoal mb-2 font-montserrat">
              {t("addChooseExportFormat")}
            </p>
            <p className="text-xs text-gray-600 mb-3">{t("addChooseExportFormatHint")}</p>
            <div className="space-y-2 mb-6">
              {formatOptions.map((fmt) => (
                <label
                  key={fmt}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                    pendingFormat === fmt
                      ? "border-teal bg-teal-light/40"
                      : "border-black/10 hover:border-teal/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={fmt}
                    checked={pendingFormat === fmt}
                    onChange={() => setPendingFormat(fmt)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-charcoal font-montserrat">
                      {t(`exportFormat_${fmt}`)}
                    </span>
                    <span className="block text-xs text-gray-600 mt-0.5">
                      {t(`exportFormatHint_${fmt}`)}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Dialog.Close
                type="button"
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-cream"
              >
                {t("addCancel")}
              </Dialog.Close>
              <button
                type="button"
                onClick={() => handleAdd(pendingLang, pendingFormat)}
                className="rounded-full bg-gold px-5 py-2 font-montserrat text-sm font-bold text-charcoal shadow-sm hover:bg-gold-dark"
              >
                {t("addConfirmLanguage")}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
