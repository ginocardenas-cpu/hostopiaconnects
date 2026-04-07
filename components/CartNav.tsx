"use client";

import { useTranslations } from "next-intl";
import { Home, HelpCircle, Briefcase, FileSearch } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart } from "./CartProvider";
import { useBrowse } from "./BrowseProvider";

export function CartNav() {
  const t = useTranslations("nav");
  const { assets } = useCart();
  const { resultSlugs, unseenCount } = useBrowse();
  const count = assets.length;
  const hasSearchResults = resultSlugs.length > 0;

  return (
    <nav className="relative hidden items-center gap-6 text-xs font-heading md:flex">
      <Link href="/" className="inline-flex items-center gap-1.5 hover:text-teal transition-colors">
        <Home size={16} />
        <span>{t("home")}</span>
      </Link>

      {hasSearchResults && (
        <Link
          href="/#browse-options"
          className="relative inline-flex items-center gap-1.5 hover:text-teal transition-colors"
        >
          <FileSearch size={16} />
          <span>{unseenCount > 0 ? t("toView", { count: unseenCount }) : t("searchResults")}</span>
          {unseenCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-teal text-white text-[10px] px-2 py-[2px]">
              {unseenCount}
            </span>
          )}
        </Link>
      )}

      <Link href="/how-it-works" className="inline-flex items-center gap-1.5 hover:text-teal transition-colors">
        <HelpCircle size={16} />
        <span>{t("howItWorks")}</span>
      </Link>

      <Link
        href="/cart"
        className="relative inline-flex items-center gap-1.5 hover:text-teal transition-colors"
      >
        <Briefcase size={16} />
        <span>{t("myResources")}</span>
        {count > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-teal text-white text-[10px] px-2 py-[2px]">
            {count}
          </span>
        )}
      </Link>
    </nav>
  );
}

