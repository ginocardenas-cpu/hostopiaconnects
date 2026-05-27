"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { type Asset, getAssetById } from "@/lib/assets";
import type { DeckLang } from "@/lib/html-deck-i18n";

export interface CartItem {
  assetId: string;
  /** Requested language for bundled HTML decks (applyLang export). */
  deckLang?: DeckLang;
}

export interface CartLineItem {
  asset: Asset;
  deckLang?: DeckLang;
}

interface CartContextValue {
  items: CartItem[];
  lineItems: CartLineItem[];
  assets: Asset[];
  addItem: (assetId: string, options?: { deckLang?: DeckLang }) => void;
  removeItem: (assetId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (assetId: string, options?: { deckLang?: DeckLang }) => {
    setItems((prev) => {
      if (prev.some((item) => item.assetId === assetId)) return prev;
      return [
        ...prev,
        {
          assetId,
          ...(options?.deckLang ? { deckLang: options.deckLang } : {}),
        },
      ];
    });
  };

  const removeItem = (assetId: string) => {
    setItems((prev) => prev.filter((item) => item.assetId !== assetId));
  };

  const clear = () => setItems([]);

  const lineItems = useMemo((): CartLineItem[] => {
    const rows: CartLineItem[] = [];
    for (const item of items) {
      const asset = getAssetById(item.assetId);
      if (asset) rows.push({ asset, deckLang: item.deckLang });
    }
    return rows;
  }, [items]);

  const assets = useMemo(() => lineItems.map((row) => row.asset), [lineItems]);

  const value: CartContextValue = {
    items,
    lineItems,
    assets,
    addItem,
    removeItem,
    clear
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

