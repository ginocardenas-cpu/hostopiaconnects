"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import {
  appLocaleToDeckLang,
  DECK_LANG_OPTIONS,
  deckLangLabel,
  isLikelyHtmlDeckAsset,
  type DeckLang,
} from "@/lib/html-deck-i18n";

interface AddToCartButtonProps {
  assetId: string;
  /** Inventory Filename — enables language picker for Logo Design HTML decks. */
  fileName?: string;
}

export function AddToCartButton({ assetId, fileName = "" }: AddToCartButtonProps) {
  const t = useTranslations("asset");
  const portalLocale = useLocale();
  const { addItem, items } = useCart();
  const cartEntry = items.find((item) => item.assetId === assetId);
  const inCart = Boolean(cartEntry);
  const needsLangPick = useMemo(
    () => isLikelyHtmlDeckAsset(fileName),
    [fileName]
  );

  const [langDialogOpen, setLangDialogOpen] = useState(false);
  const [pendingLang, setPendingLang] = useState<DeckLang>(() =>
    appLocaleToDeckLang(portalLocale)
  );

  const handleAdd = (deckLang?: DeckLang) => {
    addItem(assetId, deckLang ? { deckLang } : undefined);
    setLangDialogOpen(false);
  };

  const handleClick = () => {
    if (inCart) return;
    if (needsLangPick) {
      setPendingLang(appLocaleToDeckLang(portalLocale));
      setLangDialogOpen(true);
      return;
    }
    handleAdd();
  };

  const addedLabel = cartEntry?.deckLang
    ? t("addedWithLanguage", { language: deckLangLabel(cartEntry.deckLang) })
    : t("addToResources");

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-bold shadow-md transition hover:shadow-lg disabled:opacity-60 disabled:cursor-default"
        style={{
          fontFamily: "Montserrat, sans-serif",
          backgroundColor: "#F8CF41",
          color: "#24282B",
        }}
        disabled={inCart}
      >
        {inCart ? addedLabel : t("addToResources")}
      </button>

      <Dialog.Root open={langDialogOpen} onOpenChange={setLangDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[110] bg-black/40" />
          <Dialog.Content
            className="fixed left-[50%] top-[50%] z-[111] w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black/10 bg-white p-6 shadow-xl"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <Dialog.Title
              className="text-base font-bold text-[#24282B] mb-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
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
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    pendingLang === opt.code
                      ? "bg-[#2CADB2] text-white"
                      : "bg-[#f7f6f2] text-gray-700 hover:bg-[#ecebe6]"
                  }`}
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close
                type="button"
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-[#f7f6f2]"
              >
                {t("addCancel")}
              </Dialog.Close>
              <button
                type="button"
                onClick={() => handleAdd(pendingLang)}
                className="rounded-full px-5 py-2 text-sm font-bold shadow-sm"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  backgroundColor: "#F8CF41",
                  color: "#24282B",
                }}
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
