"use client";

import Link from "next/link";
import { Home, HelpCircle, Briefcase, FileSearch } from "lucide-react";
import { useCart } from "./CartProvider";
import { useBrowse } from "./BrowseProvider";

export function CartNav() {
  const { assets } = useCart();
  const { resultSlugs, unseenCount } = useBrowse();
  const count = assets.length;
  const hasSearchResults = resultSlugs.length > 0;

  return (
    <nav
      className="hidden md:flex items-center gap-6 text-xs relative"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <Home size={16} />
        <span>Home</span>
      </Link>

      {hasSearchResults && (
        <Link
          href="/#browse-options"
          className="relative inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors"
        >
          <FileSearch size={16} />
          <span>{unseenCount > 0 ? `${unseenCount} to view` : "Search results"}</span>
          {unseenCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-[#2CADB2] text-white text-[10px] px-2 py-[2px]">
              {unseenCount}
            </span>
          )}
        </Link>
      )}

      <Link href="/how-it-works" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <HelpCircle size={16} />
        <span>How it works</span>
      </Link>

      <Link
        href="/cart"
        className="relative inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors"
      >
        <Briefcase size={16} />
        <span>My Resources</span>
        {count > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-[#2CADB2] text-white text-[10px] px-2 py-[2px]">
            {count}
          </span>
        )}
      </Link>
    </nav>
  );
}

