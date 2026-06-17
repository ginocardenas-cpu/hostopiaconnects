/**
 * Built-in i18n for Hostopia Connects HTML bundles (applyLang + localStorage + #lang-toggle).
 * @see docs/portal-i18n-integration-brief.md
 */

export type DeckLang = "en" | "es" | "de" | "fr" | "pt";

export type AssetDeliverable = "Deck" | "Slick" | "Overview";

export const SUPPORTED_LANGS: DeckLang[] = ["en", "es", "de", "fr", "pt"];

export const DECK_LANG_OPTIONS: { code: DeckLang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português (BR)" },
];

/** Longest-first product matchers → storage prefix (§5). */
const PRODUCT_MATCHERS: { pattern: RegExp; prefix: string }[] = [
  { pattern: /reputation and listing management/i, prefix: "rlm" },
  { pattern: /custom website development/i, prefix: "cwd" },
  { pattern: /professional logo design/i, prefix: "logo" },
  { pattern: /search engine optimization/i, prefix: "seo" },
  { pattern: /social media management/i, prefix: "smm" },
  { pattern: /website builder/i, prefix: "wb" },
  { pattern: /website design/i, prefix: "wd" },
  { pattern: /brand monitoring/i, prefix: "bm" },
  { pattern: /business email/i, prefix: "be" },
  { pattern: /directory listings/i, prefix: "dir" },
  { pattern: /domain services/i, prefix: "ds" },
  { pattern: /email marketing/i, prefix: "em" },
  { pattern: /marketing 360/i, prefix: "m360" },
  { pattern: /online fax/i, prefix: "fax" },
  { pattern: /ssl services/i, prefix: "ssl" },
  { pattern: /hosting/i, prefix: "hosting" },
  { pattern: /ecommerce/i, prefix: "ec" },
];

export function normalizeLang(code: string): DeckLang {
  const c = String(code || "").trim().toLowerCase();
  if (c === "pt-br" || c === "pt_br") return "pt";
  return SUPPORTED_LANGS.includes(c as DeckLang) ? (c as DeckLang) : "en";
}

/** Map next-intl route locale → deck `applyLang` argument. */
export function appLocaleToDeckLang(locale: string): DeckLang {
  if (locale === "es-MX" || locale.startsWith("es")) return "es";
  if (locale === "fr-CA" || locale.startsWith("fr")) return "fr";
  if (locale === "de") return "de";
  if (locale === "pt-BR" || locale.startsWith("pt")) return "pt";
  return "en";
}

/** Legacy Spanish-only export — exclude from preview (§6). */
export function isExcludedLegacyAsset(fileName: string): boolean {
  return /professional\s+logo\s+design\s+presentation\s+es\s+final/i.test(fileName.trim());
}

/** All 51 HTML bundles honor the applyLang contract except the legacy Logo ES file. */
export function isHtmlDeckAsset(fileName: string): boolean {
  const name = fileName.trim();
  if (!/\.html?$/i.test(name)) return false;
  if (isExcludedLegacyAsset(name)) return false;
  return true;
}

/** @deprecated Use {@link isHtmlDeckAsset} */
export function isLikelyHtmlDeckAsset(fileName: string): boolean {
  return isHtmlDeckAsset(fileName);
}

export function resolveDeliverable(fileName: string): AssetDeliverable | null {
  const name = fileName.trim();
  if (/presentation/i.test(name)) return "Deck";
  if (/sales\s+slick/i.test(name)) return "Slick";
  if (/overview/i.test(name)) return "Overview";
  return null;
}

export function resolveProductPrefix(fileName: string): string | null {
  const name = fileName.trim();
  for (const { pattern, prefix } of PRODUCT_MATCHERS) {
    if (pattern.test(name)) return prefix;
  }
  return null;
}

export function assetStorageKey(
  productPrefix: string,
  deliverable: AssetDeliverable
): string {
  return `${productPrefix}${deliverable}Lang`;
}

export function resolveAssetPreviewMeta(fileName: string): {
  productPrefix: string;
  deliverable: AssetDeliverable;
  storageKey: string;
} | null {
  const deliverable = resolveDeliverable(fileName);
  const productPrefix = resolveProductPrefix(fileName);
  if (!deliverable || !productPrefix) return null;
  return {
    productPrefix,
    deliverable,
    storageKey: assetStorageKey(productPrefix, deliverable),
  };
}

export function deckLangLabel(code: DeckLang): string {
  return DECK_LANG_OPTIONS.find((o) => o.code === code)?.label ?? code;
}

/** Pre-seed before iframe insert — same-origin only (§3). */
export function preseedAssetLang(storageKey: string, lang: string): void {
  try {
    localStorage.setItem(storageKey, normalizeLang(lang));
  } catch {
    /* private mode / blocked storage */
  }
}

type DeckWindow = Window & {
  applyLang?: (lang: string) => void;
  LANG?: Record<string, unknown>;
};

/** Apply language in iframe and hide in-asset toggle (§3 / §8a). */
export function applyAssetLang(
  iframeEl: HTMLIFrameElement | null,
  lang: string,
  { hideToggle = true }: { hideToggle?: boolean } = {}
): boolean {
  const win = iframeEl?.contentWindow as DeckWindow | null;
  if (!win) return false;
  try {
    if (typeof win.applyLang === "function") {
      win.applyLang(normalizeLang(lang));
    }
    if (hideToggle && win.document) {
      let styleEl = win.document.getElementById("__portal_hide_toggle");
      if (!styleEl) {
        styleEl = win.document.createElement("style");
        styleEl.id = "__portal_hide_toggle";
        styleEl.textContent = "#lang-toggle{display:none!important}";
        win.document.head.appendChild(styleEl);
      }
    }
    return typeof win.applyLang === "function";
  } catch {
    return false;
  }
}

export function detectDeckI18nInIframe(iframe: HTMLIFrameElement | null): boolean {
  try {
    const win = iframe?.contentWindow as DeckWindow | null;
    return typeof win?.applyLang === "function";
  } catch {
    return false;
  }
}

/** @deprecated Use {@link applyAssetLang} */
export function applyDeckLangToIframe(
  iframe: HTMLIFrameElement | null,
  lang: DeckLang
): boolean {
  return applyAssetLang(iframe, lang, { hideToggle: true });
}
