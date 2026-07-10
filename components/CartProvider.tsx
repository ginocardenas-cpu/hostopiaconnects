"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type Asset, getAssetById } from "@/lib/assets";
import type { ExportFormat } from "@/lib/export/formats";
import type { DeckLang } from "@/lib/html-deck-i18n";
import {
  clearCartStorage,
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/cart-storage";

export interface CartItem {
  assetId: string;
  /** Requested language for bundled HTML decks (applyLang export). */
  deckLang?: DeckLang;
  /** Requested download format for HTML bundles. */
  exportFormat?: ExportFormat;
}

export interface CartLineItem {
  asset: Asset;
  deckLang?: DeckLang;
  exportFormat?: ExportFormat;
}

interface CartContextValue {
  items: CartItem[];
  lineItems: CartLineItem[];
  assets: Asset[];
  hydrated: boolean;
  addItem: (
    assetId: string,
    options?: { deckLang?: DeckLang; exportFormat?: ExportFormat }
  ) => void;
  removeItem: (assetId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCartToStorage(items);
  }, [items, hydrated]);

  const addItem = (
    assetId: string,
    options?: { deckLang?: DeckLang; exportFormat?: ExportFormat }
  ) => {
    setItems((prev) => {
      if (prev.some((item) => item.assetId === assetId)) return prev;
      return [
        ...prev,
        {
          assetId,
          ...(options?.deckLang ? { deckLang: options.deckLang } : {}),
          ...(options?.exportFormat
            ? { exportFormat: options.exportFormat }
            : {}),
        },
      ];
    });
  };

  const removeItem = (assetId: string) => {
    setItems((prev) => prev.filter((item) => item.assetId !== assetId));
  };

  const clear = () => {
    setItems([]);
    clearCartStorage();
  };

  const lineItems = useMemo((): CartLineItem[] => {
    const rows: CartLineItem[] = [];
    for (const item of items) {
      const asset = getAssetById(item.assetId);
      if (asset) {
        rows.push({
          asset,
          deckLang: item.deckLang,
          exportFormat: item.exportFormat,
        });
      }
    }
    return rows;
  }, [items]);

  const assets = useMemo(() => lineItems.map((row) => row.asset), [lineItems]);

  const value: CartContextValue = {
    items,
    lineItems,
    assets,
    hydrated,
    addItem,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
