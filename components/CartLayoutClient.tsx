"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./CartProvider";
import { BrowseProvider } from "./BrowseProvider";

export function CartLayoutClient({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <BrowseProvider>{children}</BrowseProvider>
    </CartProvider>
  );
}

