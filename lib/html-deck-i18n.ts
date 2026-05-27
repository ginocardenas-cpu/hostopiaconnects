/**
 * Built-in i18n for bundled Logo Design HTML decks (data-i18n + LANG.* + applyLang).
 * Portal locales map to deck language codes: en, es, fr, de.
 */

export type DeckLang = "en" | "es" | "fr" | "de";

export const DECK_LANG_OPTIONS: { code: DeckLang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

/** Map next-intl route locale → deck `applyLang` argument. */
export function appLocaleToDeckLang(locale: string): DeckLang {
  if (locale === "es-MX" || locale.startsWith("es")) return "es";
  if (locale === "fr-CA" || locale.startsWith("fr")) return "fr";
  if (locale === "de") return "de";
  return "en";
}

/** Filename heuristic until all Logo Design HTML exports include applyLang. */
export function isLikelyHtmlDeckAsset(fileName: string): boolean {
  const name = fileName.trim();
  if (!/\.html?$/i.test(name)) return false;
  return /professional\s+logo\s+design/i.test(name);
}

type DeckWindow = Window & {
  applyLang?: (lang: string) => void;
  LANG?: Record<string, unknown>;
};

export function detectDeckI18nInIframe(iframe: HTMLIFrameElement | null): boolean {
  try {
    const win = iframe?.contentWindow as DeckWindow | null;
    return typeof win?.applyLang === "function" && !!win.LANG;
  } catch {
    return false;
  }
}

/**
 * Call the deck's applyLang and hide the in-document #lang-toggle (portal provides its own).
 * Returns false if the iframe is not ready or does not expose applyLang.
 */
export function applyDeckLangToIframe(
  iframe: HTMLIFrameElement | null,
  lang: DeckLang
): boolean {
  if (!iframe) return false;
  try {
    const win = iframe.contentWindow as DeckWindow | null;
    if (typeof win?.applyLang !== "function") return false;
    win.applyLang(lang);
    const toggle = iframe.contentDocument?.getElementById("lang-toggle");
    if (toggle) toggle.style.display = "none";
    return true;
  } catch {
    return false;
  }
}

export function deckLangLabel(code: DeckLang): string {
  return DECK_LANG_OPTIONS.find((o) => o.code === code)?.label ?? code;
}
