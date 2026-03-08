"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { localeNames, routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {(["en", "es-MX"] as const).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleChange(loc)}
          className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
            locale === loc
              ? "bg-[#2CADB2] text-white"
              : "text-gray-600 hover:text-[#2CADB2] hover:bg-[#2CADB2]/10"
          }`}
          aria-label={localeNames[loc]}
          aria-current={locale === loc ? "true" : undefined}
        >
          {loc === "en" ? "EN" : "ES"}
        </button>
      ))}
    </div>
  );
}
