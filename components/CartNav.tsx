"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartNav() {
  const { assets } = useCart();
  const count = assets.length;

  return (
    <nav
      className="hidden md:flex items-center gap-6 text-xs"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <Link href="/" className="hover:text-[#2CADB2] transition-colors">
        Home
      </Link>
      <a href="#products" className="hover:text-[#2CADB2] transition-colors">
        Products
      </a>
      <a href="#browse-type" className="hover:text-[#2CADB2] transition-colors">
        Browse by Type
      </a>
      <a href="#browse-use-case" className="hover:text-[#2CADB2] transition-colors">
        Browse by Use Case
      </a>
      <Link
        href="/cart"
        className="relative inline-flex items-center gap-1 hover:text-[#2CADB2] transition-colors"
      >
        <span>Download Cart</span>
        {count > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-[#2CADB2] text-white text-[10px] px-2 py-[2px]">
            {count}
          </span>
        )}
      </Link>
    </nav>
  );
}

