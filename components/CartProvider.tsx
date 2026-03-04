"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { type Asset, getAssetBySlug } from "@/lib/assets";

export interface CartItem {
  assetId: string;
}

interface CartContextValue {
  items: CartItem[];
  assets: Asset[];
  addItem: (assetId: string) => void;
  removeItem: (assetId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (assetId: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.assetId === assetId)) return prev;
      return [...prev, { assetId }];
    });
  };

  const removeItem = (assetId: string) => {
    setItems((prev) => prev.filter((item) => item.assetId !== assetId));
  };

  const clear = () => setItems([]);

  const assets = useMemo(
    () =>
      items
        .map((item) => getAssetBySlug(item.assetId))
        .filter((asset): asset is Asset => Boolean(asset)),
    [items]
  );

  const value: CartContextValue = {
    items,
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

