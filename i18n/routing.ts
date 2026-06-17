import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import {
  PORTAL_LOCALE_LABELS,
  PORTAL_LOCALE_ORDER,
  type PortalLocaleCode,
} from "@/lib/language-display";

/**
 * Supported portal UI locales (URL prefix + message catalog).
 * Keep in sync with `messages/{locale}.json` and the header language switcher.
 */
export const allLocales = [...PORTAL_LOCALE_ORDER] as const;

export type AppLocale = PortalLocaleCode;

export const routing = defineRouting({
  locales: [...allLocales],
  defaultLocale: "en",
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

/** Human-readable locale labels (header switcher). */
export const localeNames: Record<string, string> = { ...PORTAL_LOCALE_LABELS };

/** Short labels for compact UI. */
export const localeShortNames: Record<string, string> = {
  en: "EN",
  "fr-CA": "FR",
  "es-MX": "ES",
  de: "DE",
  "pt-BR": "PT",
};

export const tier1Locales: AppLocale[] = [...PORTAL_LOCALE_ORDER];

/** Reserved for future “extra” locales in the switcher; empty = single list only. */
export const tier2Locales: AppLocale[] = [];
