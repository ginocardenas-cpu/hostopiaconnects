"use client";

import type { ReactNode } from "react";
import { BrandProfileProvider } from "./BrandProfileProvider";
import { CartProvider } from "./CartProvider";
import { BrowseProvider } from "./BrowseProvider";

export function CartLayoutClient({ children }: { children: ReactNode }) {
  return (
    <BrandProfileProvider>
      <CartProvider>
        <BrowseProvider>{children}</BrowseProvider>
      </CartProvider>
    </BrandProfileProvider>
  );
}

