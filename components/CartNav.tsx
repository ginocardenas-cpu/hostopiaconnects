"use client";

import Link from "next/link";
import { Home, LayoutGrid, FileText, Target, Sparkles, HelpCircle, ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartNav() {
  const { assets } = useCart();
  const count = assets.length;

  return (
    <nav
      className="hidden md:flex items-center gap-6 text-xs"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <Home size={16} />
        <span>Home</span>
      </Link>
      <Link href="/featured" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <Sparkles size={16} />
        <span>Featured</span>
      </Link>
      <a href="/#products" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <LayoutGrid size={16} />
        <span>Products</span>
      </a>
      <a href="/#browse-type" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <FileText size={16} />
        <span>Browse by Type</span>
      </a>
      <a href="/#browse-use-case" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <Target size={16} />
        <span>Browse by Use Case</span>
      </a>
      <Link href="/how-it-works" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <HelpCircle size={16} />
        <span>How it works</span>
      </Link>
      <Link
        href="/cart"
        className="relative inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors"
      >
        <ShoppingCart size={16} />
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

