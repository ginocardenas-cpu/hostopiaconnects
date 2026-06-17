# HTML deck i18n (all 51 assets)

All 51 HTML bundles honor the same preview contract. See **`docs/portal-i18n-integration-brief.md`** for the full hand-off.

## Portal behavior

| Step | Behavior |
|------|----------|
| **Preview** | `HtmlDeckPreviewFrame` loads the bundle in an iframe. Portal toolbar offers EN / ES / DE / FR / PT. Calls `applyAssetLang()` on load and on language change. Hides in-asset `#lang-toggle`. |
| **Pre-seed** | `preseedAssetLang(storageKey, lang)` before paint when storage key resolves from filename (§5 map in brief). |
| **Add to My Resources** | HTML bundles prompt for **document language** (`deckLang`: `en` \| `es` \| `de` \| `fr` \| `pt`). |
| **Legacy exclusion** | `Professional Logo Design Presentation ES FINAL 2026-05-14.html` is excluded — use the 5-language deck instead. |

Portal UI locale (`en`, `es-MX`, `fr-CA`, `de`, `pt-BR`) maps to deck codes via `appLocaleToDeckLang()` in `lib/html-deck-i18n.ts`.

## Sync files for deploy

```bash
npm run assets:sync-public
```

Copies bundles from `Assets/HostopiaConnects/` → `public/assets/` by product + deliverable match.

## Fulfillment (future)

When generating download bundles, inject a startup script that calls `applyLang(deckLang)` and removes `#lang-toggle`.
