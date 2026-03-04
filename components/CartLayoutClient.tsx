"use client";

import type { ReactNode } from "react";
import { CartProvider } from "./CartProvider";

export function CartLayoutClient({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

