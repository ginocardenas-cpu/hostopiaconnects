# Hostopia Connects · Portal Preview-Mode i18n Integration Brief

**Scope of this round:** scale the proven single-product preview-mode integration to **all 51 assets in all 5 languages**.

You already wired one product's preview into the customer portal and it worked. Nothing about the contract below has changed — this brief just (a) confirms the contract still holds for every asset, (b) gives you the complete inventory and the per-asset language-storage-key map, and (c) lists the edge cases that only show up at full scale.

---

## 1. What the assets are

17 products × 3 deliverables = **51 self-contained HTML files**. Each file is fully inlined (CSS, fonts, images, translation table all embedded) — no external requests, safe to serve as-is and embed in an `<iframe>` in preview mode.

Bundles live in three folders under `Assets/HostopiaConnects/`:

| Deliverable | Folder |
|---|---|
| Sales Deck (presentation) | `Presentations V2/` |
| Sales Slick (leave-behind) | `Sales Slicks/` |
| Product Overview | `Overview Docs V2/` |

Filenames carry a human product name + `FINAL <date>.html` (e.g. `Marketing 360 Presentation FINAL 2026-05-29.html`). Match by product, not by date — dates vary per product and may change on future re-bundles.

---

## 2. The language contract (unchanged — every asset honors it)

Every one of the 51 bundles exposes the **same** three hooks. This is the contract your portal integrates against:

1. **`window.applyLang(lang)`** — global function. Call it with one of `'en' | 'es' | 'de' | 'fr' | 'pt'` and the whole document re-renders in that language (text + inline HTML), sets `document.documentElement.lang`, and highlights the matching toggle button. Unknown codes are ignored (no throw).
2. **A per-document `localStorage` key** — on load, the asset reads its key and, if it holds a valid lang, applies it before paint. It writes the key whenever the in-asset toggle is clicked. **Keys are unique per file** — see the map in §5.
3. **`#lang-toggle`** — a floating button row (`<button data-lang="…">`) in the top-right. Five buttons now: **EN · ES · DE · FR · PT**.

Supported languages (all five live on every asset): English, Spanish (ES), German (DE), French (FR), **Brazilian Portuguese (PT)** — PT is the new one this round.

---

## 3. Preview-mode integration (the pattern that already works)

Because the bundles are same-origin, the portal drives language **directly** — same as the single-product test:

```js
// After the preview iframe's load event:
const win = previewIframe.contentWindow;
win.applyLang(customerLang);     // customerLang ∈ {'en','es','de','fr','pt'}
```

Recommended additions when applying to all assets:

- **Hide the in-asset toggle in portal preview** (the portal's own language selector is the source of truth). Inject one rule into the iframe after load:
  ```js
  const s = win.document.createElement('style');
  s.textContent = '#lang-toggle{display:none!important}';
  win.document.head.appendChild(s);
  ```
- **Avoid the pre-paint flash:** call `applyLang` in the iframe's `load` handler (or pre-seed localStorage — see §5).
- **Optional pre-seed:** `localStorage.setItem(assetStorageKey, customerLang)` before inserting the iframe.

**Do not** rebuild the language tables in the portal — language lives entirely inside each asset.

---

## 4. Full asset inventory (17 products)

Each product has all three deliverables, all five languages. See §1 for bundle folders.

1. Professional Logo Design
2. Domain Services
3. Online Fax
4. Ecommerce
5. SSL Services
6. Do-It-For-Me Website Design
7. Custom Website Development
8. Brand Monitoring
9. Marketing 360
10. Email Marketing
11. Website Builder
12. Reputation and Listing Management
13. Social Media Management
14. Business Email
15. Search Engine Optimization
16. Hosting (Shared / WordPress / VPS / Dedicated)
17. Directory Listings

---

## 5. Per-asset `localStorage` language-key map

Pattern: `<productPrefix><Deliverable>Lang`. Implemented in `lib/html-deck-i18n.ts` → `resolveAssetPreviewMeta()`.

| Product | Deck key | Slick key | Overview key |
|---|---|---|---|
| Brand Monitoring | `bmDeckLang` | `bmSlickLang` | `bmOverviewLang` |
| Business Email | `beDeckLang` | `beSlickLang` | `beOverviewLang` |
| Custom Website Development | `cwdDeckLang` | `cwdSlickLang` | `cwdOverviewLang` |
| Directory Listings | `dirDeckLang` | `dirSlickLang` | `dirOverviewLang` |
| Domain Services | `dsDeckLang` | `dsSlickLang` | `dsOverviewLang` |
| Ecommerce | `ecDeckLang` | `ecSlickLang` | `ecOverviewLang` |
| Email Marketing | `emDeckLang` | `emSlickLang` | `emOverviewLang` |
| Hosting | `hostingDeckLang` | `hostingSlickLang` | `hostingOverviewLang` |
| Professional Logo Design | `logoDeckLang` | `logoSlickLang` | `logoOverviewLang` |
| Marketing 360 | `m360DeckLang` | `m360SlickLang` | `m360OverviewLang` |
| Online Fax | `faxDeckLang` | `faxSlickLang` | `faxOverviewLang` |
| Reputation and Listing Management | `rlmDeckLang` | `rlmSlickLang` | `rlmOverviewLang` |
| Search Engine Optimization | `seoDeckLang` | `seoSlickLang` | `seoOverviewLang` |
| Social Media Management | `smmDeckLang` | `smmSlickLang` | `smmOverviewLang` |
| SSL Services | `sslDeckLang` | `sslSlickLang` | `sslOverviewLang` |
| Do-It-For-Me Website Design | `wdDeckLang` | `wdSlickLang` | `wdOverviewLang` |
| Website Builder | `wbDeckLang` | `wbSlickLang` | `wbOverviewLang` |

---

## 6. Edge cases at full scale

- **Legacy stray file:** `Presentations V2/Professional Logo Design Presentation ES FINAL 2026-05-14.html` — **excluded** via `isExcludedLegacyAsset()`.
- **Decks vs. docs:** Sales Decks use slide nav; Slicks/Overviews scroll. `applyLang` works identically on all three.
- **PT label:** button reads **PT**; content is Brazilian Portuguese (`lang="pt"`).

---

## 7. Portal implementation (this repo)

| File | Role |
|------|------|
| `lib/html-deck-i18n.ts` | Contract: `normalizeLang`, `preseedAssetLang`, `applyAssetLang`, storage keys |
| `components/HtmlDeckPreviewFrame.tsx` | Preview iframe + portal language toolbar |
| `components/AssetPreviewButton.tsx` | Opens preview modal for HTML bundles |
| `components/AddToCartButton.tsx` | Document language picker on add to My Resources |
| `scripts/sync-public-assets.mjs` | Copy bundles → `public/assets/` |
| `i18n/routing.ts` | Portal locales incl. `pt-BR` → deck `pt` |

---

## 8. Deploy checklist

```bash
npm run assets:from-inventory   # refresh catalog from XLSX (if updated)
npm run assets:sync-public      # copy HTML into public/assets/
npm run build
```

Commit `lib/assets.data.json` and synced files under `public/assets/` for Vercel.
