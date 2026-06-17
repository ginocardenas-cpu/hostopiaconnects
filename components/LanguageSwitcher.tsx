"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  localeNames,
  tier1Locales,
  tier2Locales,
  type AppLocale,
} from "@/i18n/routing";
import { PORTAL_LOCALE_FLAGS } from "@/lib/language-display";

export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (newLocale: AppLocale) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  const flag = PORTAL_LOCALE_FLAGS[locale] ?? "🌐";
  const label = localeNames[locale] ?? locale;

  return (
    <div ref={ref} className="relative text-xs font-montserrat">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-1 font-semibold text-gray-700 shadow-sm hover:border-teal/60 hover:text-teal transition-colors"
        aria-label={label}
        aria-expanded={open}
      >
        <span className="text-lg emoji-flag leading-none shrink-0" aria-hidden>
          {flag}
        </span>
        <span className="max-w-[11rem] sm:max-w-[14rem] truncate">{label}</span>
        <span className="ml-0.5 text-[10px] text-gray-500 shrink-0">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-72 max-w-[85vw] rounded-xl border border-black/10 bg-white py-2 shadow-lg max-h-[min(70vh,420px)] overflow-y-auto">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            {t("primaryLanguages")}
          </p>
          {tier1Locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleChange(loc)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-teal/10 ${
                locale === loc ? "font-bold text-teal" : "text-gray-700"
              }`}
            >
              <span className="text-lg emoji-flag leading-none shrink-0" aria-hidden>
                {PORTAL_LOCALE_FLAGS[loc]}
              </span>
              <span>{localeNames[loc]}</span>
            </button>
          ))}

          {tier2Locales.length > 0 && (
          <div className="mt-1 border-t border-gray-100 pt-1">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              {t("additionalLanguages")}
            </p>
            {tier2Locales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleChange(loc)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-teal/10 ${
                  locale === loc ? "font-bold text-teal" : "text-gray-700"
                }`}
              >
                <span className="text-lg emoji-flag leading-none shrink-0" aria-hidden>
                  {PORTAL_LOCALE_FLAGS[loc]}
                </span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
