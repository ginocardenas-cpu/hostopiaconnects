"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Compass, FileText, Target, HelpCircle, ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartNav() {
  const { assets } = useCart();
  const count = assets.length;
  const [browseOpen, setBrowseOpen] = useState(false);

  return (
    <nav
      className="hidden md:flex items-center gap-6 text-xs relative"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors">
        <Home size={16} />
        <span>Home</span>
      </Link>

      <button
        type="button"
        onClick={() => setBrowseOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 hover:text-[#2CADB2] transition-colors"
      >
        <Compass size={16} />
        <span>Browse by</span>
      </button>

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

      {browseOpen && (
        <div className="absolute right-0 top-full mt-3 w-[520px] rounded-2xl border border-black/10 bg-white shadow-xl p-5 z-30">
          <div
            className="grid grid-cols-3 gap-4 text-xs"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <div>
              <p className="font-semibold mb-2 text-gray-900 uppercase tracking-[0.18em] text-[11px]">
                Journey
              </p>
              <ul className="space-y-1.5 text-gray-700">
                <li>
                  <Link href="/assets/journey/build-a-brand" className="hover:text-[#2CADB2]">
                    Build a Brand
                  </Link>
                </li>
                <li>
                  <Link href="/assets/journey/get-online" className="hover:text-[#2CADB2]">
                    Get Online
                  </Link>
                </li>
                <li>
                  <Link href="/assets/journey/get-found" className="hover:text-[#2CADB2]">
                    Get Found
                  </Link>
                </li>
                <li>
                  <Link href="/assets/journey/grow-their-business" className="hover:text-[#2CADB2]">
                    Grow their Business
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2 text-gray-900 uppercase tracking-[0.18em] text-[11px]">
                Use Case
              </p>
              <ul className="space-y-1.5 text-gray-700">
                <li className="flex items-center gap-1.5">
                  <Target size={12} /> Sales
                </li>
                <li className="flex items-center gap-1.5">
                  <Target size={12} /> Marketing
                </li>
                <li className="flex items-center gap-1.5">
                  <Target size={12} /> Training &amp; Onboarding
                </li>
                <li className="flex items-center gap-1.5">
                  <Target size={12} /> Support
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2 text-gray-900 uppercase tracking-[0.18em] text-[11px]">
                Content Type
              </p>
              <ul className="space-y-1.5 text-gray-700">
                <li className="flex items-center gap-1.5">
                  <FileText size={12} /> Decks &amp; Presentations
                </li>
                <li className="flex items-center gap-1.5">
                  <FileText size={12} /> One-pagers &amp; Playbooks
                </li>
                <li className="flex items-center gap-1.5">
                  <FileText size={12} /> Videos &amp; Training
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

