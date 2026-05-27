# HTML deck i18n (Logo Design)

Some Logo Design assets ship as a single `.html` file with built-in translations (`data-i18n`, `LANG.en|es|fr|de`, `window.applyLang`).

## Portal behavior

| Step | Behavior |
|------|----------|
| **Preview** | `HtmlDeckPreviewFrame` loads the deck in an iframe and shows EN / ES / FR / DE toggles. The initial language follows the portal route (`/es-MX/` → Spanish). The in-document `#lang-toggle` is hidden. |
| **Add to My Resources** | For filenames matching `Professional Logo Design` + `.html`, a dialog asks which **document language** to fulfill. The choice is stored on the cart line as `deckLang`. |
| **My Resources** | Each line shows `Requested file language: …` when `deckLang` is set. |

Portal UI locale (`en`, `es-MX`, `fr-CA`, `de`) is separate from deck codes (`en`, `es`, `fr`, `de`). Mapping lives in `lib/html-deck-i18n.ts` (`appLocaleToDeckLang`).

## Fulfillment (future)

When generating download bundles, inject a startup script that calls `applyLang(deckLang)` and removes `#lang-toggle`, so the delivered file is single-language with no switcher—same pattern as static exports.

## Extending to more assets

1. Ensure the HTML exposes `applyLang` and `LANG.*`.
2. Broaden `isLikelyHtmlDeckAsset()` in `lib/html-deck-i18n.ts` (or detect at runtime via `detectDeckI18nInIframe`).
3. Copy files under `public/assets/` with stable URLs referenced from the inventory.
