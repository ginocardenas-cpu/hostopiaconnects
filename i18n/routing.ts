import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

/**
 * UI locales — the languages the portal chrome (nav, labels, buttons) is
 * translated into.  Tier 1 gets full translations; Tier 2 falls back to
 * English for UI but can still filter/download assets in their language.
 *
 * Tier 1 (full UI): en, fr-CA, es-MX, pt-BR
 * Tier 2 (UI in English, content available): de, it, el, ro, bg, hu, hr, nb, sv, sq
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

/** Tier 1 locales get full UI translations. */
export const tier1Locales: AppLocale[] = ["en", "fr-CA", "es-MX", "pt-BR"];

/** Tier 2 locales use English UI but have content available. */
export const tier2Locales: AppLocale[] = [
  "de", "it", "el", "ro", "bg", "hu", "hr", "nb", "sv", "sq",
];
