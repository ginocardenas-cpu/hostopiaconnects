"use client";

import { useLocale, useTranslations } from "next-intl";
import { HeroPill } from "@/components/ui/hero-pill";

export function TickerBar() {
  const locale = useLocale();
  const t = useTranslations("ticker");

  return (
    <div
      className="flex items-center justify-center px-6 py-2.5 border-b border-white/10"
      style={{ backgroundColor: "#24282B" }}
    >
      <HeroPill
        href={`/${locale}/#featured`}
        label={t("label")}
        announcement={t("announcement")}
        className="bg-[#2CADB2]/20 ring-1 ring-white/20 [&_div]:bg-white/95 [&_div]:text-[#2CADB2] [&_p]:text-white [&_svg]:text-white"
      />
    </div>
  );
}
