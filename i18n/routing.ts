import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

/**
 * UI locales — languages the portal chrome (nav, labels, buttons) can use.
 * Tier 1: full message catalogs in `messages/{locale}.json` (shown first in switcher).
 * Tier 2: routed locales with no catalog yet — UI falls back to English until
 * `messages/{locale}.json` is added; asset content may still be available in those languages.
 *
 * Tier 1: en, fr-CA, es-MX, pt-BR, de, it
 * Tier 2: el, ro, bg, hu, hr, nb, sv, sq
 */
export const allLocales = [
  "en",
  "fr-CA",
  "es-MX",
  "pt-BR",
  "de",
  "it",
  "el",
  "ro",
  "bg",
  "hu",
  "hr",
  "nb",
  "sv",
  "sq",
] as const;

export type AppLocale = (typeof allLocales)[number];

export const routing = defineRouting({
  locales: [...allLocales],
  defaultLocale: "en",
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

/** Human-readable locale labels, grouped by tier. */
export const localeNames: Record<string, string> = {
  en: "English (US/Canada)",
  "fr-CA": "Français (Canada)",
  "es-MX": "Español (México)",
  "pt-BR": "Português (Brasil)",
  de: "Deutsch",
  it: "Italiano",
  el: "Ελληνικά",
  ro: "Română",
  bg: "Български",
  hu: "Magyar",
  hr: "Hrvatski",
  nb: "Norsk",
  sv: "Svenska",
  sq: "Shqip",
};

/** Short labels for the compact language switcher dropdown. */
export const localeShortNames: Record<string, string> = {
  en: "EN",
  "fr-CA": "FR",
  "es-MX": "ES",
  "pt-BR": "PT",
  de: "DE",
  it: "IT",
  el: "EL",
  ro: "RO",
  bg: "BG",
  hu: "HU",
  hr: "HR",
  nb: "NO",
  sv: "SV",
  sq: "SQ",
};

/** Locales with full UI message files (primary list in language switcher). */
export const tier1Locales: AppLocale[] = [
  "en",
  "fr-CA",
  "es-MX",
  "pt-BR",
  "de",
  "it",
];

/** Routed locales without a full catalog yet — English UI until translated. */
export const tier2Locales: AppLocale[] = [
  "el",
  "ro",
  "bg",
  "hu",
  "hr",
  "nb",
  "sv",
  "sq",
];
