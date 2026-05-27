import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

/**
 * Supported portal UI locales (URL prefix + message catalog).
 * Keep in sync with `messages/{locale}.json` and the header language switcher.
 *
 * Currently: US English, Canadian French, Mexican Spanish, German.
 */
export const allLocales = ["en", "fr-CA", "es-MX", "de"] as const;

export type AppLocale = (typeof allLocales)[number];

export const routing = defineRouting({
  locales: [...allLocales],
  defaultLocale: "en",
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

/** Human-readable locale labels (header switcher). */
export const localeNames: Record<string, string> = {
  en: "US English (US/Canada)",
  "fr-CA": "CA Français (Canada)",
  "es-MX": "MX Español (México)",
  de: "DE Deutsch",
};

/** Short labels for the compact language switcher dropdown. */
export const localeShortNames: Record<string, string> = {
  en: "EN",
  "fr-CA": "FR",
  "es-MX": "ES",
  de: "DE",
};

/** Locales listed first in the language switcher (all supported locales today). */
export const tier1Locales: AppLocale[] = ["en", "fr-CA", "es-MX", "de"];

/** Reserved for future “extra” locales in the switcher; empty = single list only. */
export const tier2Locales: AppLocale[] = [];
