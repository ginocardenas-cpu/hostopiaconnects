"use client";

import React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { localeNames } from "@/i18n/routing";

type ActiveLocale = "en" | "es-MX";

const ACTIVE_LOCALES: { locale: ActiveLocale; flag: string; label: string }[] = [
  {
    locale: "en",
    flag: "🇺🇸",
    label: "English (US/Canada)",
  },
  {
    locale: "es-MX",
    flag: "🇲🇽",
    label: "Español (México)",
  },
];

const COMING_SOON: { flag: string; label: string }[] = [
  { flag: "🇨🇦", label: "Français (Canada)" },
  { flag: "🇧🇷", label: "Português (Brasil)" },
];

export function LanguageSwitcher() {
  const locale = useLocale() as ActiveLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const handleChange = (newLocale: ActiveLocale) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  const current = ACTIVE_LOCALES.find((item) => item.locale === locale) ?? ACTIVE_LOCALES[0];

  return (
    <div className="relative text-xs font-heading">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/90 px-3 py-1 font-semibold text-gray-700 shadow-sm hover:border-teal/60 hover:text-teal transition-colors"
        aria-label={localeNames[locale]}
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.label}</span>
        <span className="ml-1 text-[10px] text-gray-500">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-xl border border-black/10 bg-white/95 py-2 shadow-lg">
          {ACTIVE_LOCALES.map((item) => (
            <button
              key={item.locale}
              type="button"
              onClick={() => handleChange(item.locale)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-teal/10 ${
                locale === item.locale ? "font-bold text-teal" : "text-gray-700"
              }`}
            >
              <span className="text-base leading-none">{item.flag}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <div className="mt-1 border-t border-gray-100 pt-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Coming soon
            </p>
            {COMING_SOON.map((item) => (
              <div
                key={item.label}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-gray-400"
              >
                <span className="text-base leading-none">{item.flag}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

