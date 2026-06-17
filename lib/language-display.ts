import type { AssetLanguage } from "./assets";

/** Canonical portal UI locale order (header switcher). */
export const PORTAL_LOCALE_ORDER = [
  "en",
  "fr-CA",
  "es-MX",
  "de",
  "pt-BR",
] as const;

export type PortalLocaleCode = (typeof PORTAL_LOCALE_ORDER)[number];

export const PORTAL_LOCALE_LABELS: Record<PortalLocaleCode, string> = {
  en: "English (American)",
  "fr-CA": "French (Canadian)",
  "es-MX": "Spanish (Mexican)",
  de: "Deutsch (German)",
  "pt-BR": "Portuguese (Brazilian)",
};

/** Document preview language codes — same sequence as portal locales. */
export type DeckLangCode = "en" | "fr" | "es" | "de" | "pt";

export const DECK_LANG_ORDER: DeckLangCode[] = ["en", "fr", "es", "de", "pt"];

export const DECK_LANG_LABELS: Record<DeckLangCode, string> = {
  en: "English (American)",
  fr: "French (Canadian)",
  es: "Spanish (Mexican)",
  de: "Deutsch (German)",
  pt: "Portuguese (Brazilian)",
};

/** Primary asset content languages (library filter) — same sequence. */
export const PRIMARY_ASSET_LANGUAGE_ORDER: AssetLanguage[] = [
  "English",
  "French",
  "Spanish",
  "German",
  "Portuguese",
];

export const ASSET_LANGUAGE_LABELS: Partial<Record<AssetLanguage, string>> = {
  English: "English (American)",
  French: "French (Canadian)",
  Spanish: "Spanish (Mexican)",
  German: "Deutsch (German)",
  Portuguese: "Portuguese (Brazilian)",
};

export function assetLanguageLabel(lang: AssetLanguage): string {
  return ASSET_LANGUAGE_LABELS[lang] ?? lang;
}

/** Library filter list: primary five first (canonical order), then any others. */
export function orderedLibraryLanguages(allLanguages: AssetLanguage[]): AssetLanguage[] {
  const primary = PRIMARY_ASSET_LANGUAGE_ORDER.filter((lang) =>
    allLanguages.includes(lang)
  );
  const rest = allLanguages.filter(
    (lang) => !PRIMARY_ASSET_LANGUAGE_ORDER.includes(lang)
  );
  return [...primary, ...rest];
}

export const DECK_LANG_OPTIONS = DECK_LANG_ORDER.map((code) => ({
  code,
  label: DECK_LANG_LABELS[code],
}));
