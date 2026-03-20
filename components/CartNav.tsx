"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "./CartProvider";

export function CartNav() {
  const t = useTranslations("nav");
  const { assets } = useCart();
  const count = assets.length;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-1.5 text-white/70 hover:text-[#2CADB2] transition-colors text-xs font-heading"
      aria-label={t("myResources")}
    >
      <i className="fa-solid fa-briefcase text-sm" />
      <span className="hidden lg:inline">{t("myResources")}</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center rounded-full bg-[#F8CF41] text-[#24282B] text-[9px] font-bold min-w-[18px] h-[18px] px-1">
          {count}
        </span>
      )}
    </Link>
  );
}

