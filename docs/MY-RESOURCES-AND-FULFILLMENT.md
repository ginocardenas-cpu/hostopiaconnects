# Hostopia Connects — how it works

This document is the **source of truth** for how the Hostopia Connects portal works for end users and engineers: discovery, Brand Studio customization, My Resources, lead capture, download/export, and what is still unfinished.

Related UI copy lives in **`messages/en.json`** (and locale mirrors) under `howItWorks`, `cart`, and `brandStudio`.

**Production:** [https://hostopiaconnects-self.vercel.app](https://hostopiaconnects-self.vercel.app)  
**Repo:** `ginocardenas-cpu/hostopiaconnects` · Vercel project `hostopiaconnects`  
*(Git push does not always auto-deploy; use `npx vercel --prod` when needed.)*

---

## End-to-end user journey

```mermaid
flowchart LR
  A[Browse library] --> B[Asset detail]
  B --> C[Preview modal]
  B --> D[Customize design]
  D --> E[Brand Studio]
  E --> F[Add customized to My Resources]
  B --> G[Add to My Resources]
  F --> H[/cart]
  G --> H
  H --> I[Lead form]
  I --> J[Download PDF or HTML]
```

---

## 1. Discover and read the detail card

- Users browse the library (journeys, products, search, etc.) and open an **asset detail** view.
- The **detail card** shows structured metadata and three narrative blocks:
  - **What it is**
  - **Why it’s important**
  - **How to use it**
- Catalog text comes from the asset inventory pipeline (see **`ADDING-CONTENT.md`** and **`Assets/HostopiaConnects/README.md`**).

---

## 2. Preview (in-app modal)

- **Preview** opens a **modal** over the page (no new tab). The modal shows the asset title, a **close** control, and the file in an embedded viewer when the format supports it (**HTML**, **PDF**, common **images**, **video**).
- Hostopia Connects does **not** put a Download button in this modal; fulfillment stays oriented toward **Add to My Resources**.
- **PDF caveat:** Browsers may still inject their own PDF toolbar (which can include download). That is browser UI, not ours.
- **Word / PowerPoint:** In-browser preview usually needs conversion or a third-party viewer; until then, users see a short message to download via My Resources.

---

## 3. Brand Studio (customize design)

HTML decks that support i18n can be **branded in-platform** before download.

### Entry points

| Entry | Route / UI |
|-------|------------|
| Per-asset customize | `/[locale]/assets/[slug]/customize` — live preview + download settings |
| Global brand profile | `/[locale]/brand-studio` — edit defaults without an asset |

Both entry points use **`BrandStudioShell`**: a Getting Started chooser, then the same form.

### Getting Started (two paths, one form)

1. **Update your own branding** — open the existing Brand Studio form with current/default values; user fills everything manually.
2. **Let us scrape it for you** — enter a website URL → **`POST /api/brand-from-url`** → prefills company name, logo, colors, website, and social CTA links → same form for review/edit.

Content fields (cover title, subtitle, description, audience) are **never** auto-filled from the website.

**Disclaimer** (shown on scrape import): scraping is imperfect; the user must validate logo, colors, website, and socials before saving.

Chosen direction is stored in **`sessionStorage`** (`hostopia-connects-brand-direction`). **Reset to Hostopia defaults** clears direction + profile.

### Hybrid brand import

Implemented in **`lib/brand-from-url/`**:

1. Normalize URL; block private/localhost hosts.
2. **Scrape** HTML for `og:image` / icons / logo imgs, theme-color + CSS hex colors, and social `a[href]` / JSON-LD `sameAs` links. Uses browser-like headers; if the origin returns **401/403/429/503** (common for Akamai-protected sites like Telus from Vercel IPs), retries via a public HTML reader proxy, then falls back to Clearbit/favicon logo URLs when needed.
3. If results are thin (no logo, &lt;2 colors, or no socials) and **`MICROLINK_API_KEY`** or **`BRAND_ENRICHMENT_API_KEY`** is set in Vercel env, enrich via Microlink and fill only missing fields.

### Profile fields (`BrandStudioControls`)

Stored in **`localStorage`** via `lib/brand-profile.ts`:

- **Company name** (used in chrome replacement + copyright)
- **Logo** (uploaded / data URL; compressed for export payloads)
- **Colors** (primary, secondary, accent, slide background, text)
- **Font family**
- **Content:** cover title, cover subtitle, presentation description, audience  
  *(Contact email under Audience was removed — email lives only in CTA.)*
- **CTA links:** website, email, phone, socials (optional footer chrome / closing slide)

**Save brand profile** persists to storage and shows confirmation. **Reset to Hostopia defaults** clears customization.

### Live preview

`BrandPreviewFrame` loads the HTML deck in an iframe and applies branding through `lib/brand-apply.ts` (`applyBrandToIframe` → CSS overrides + DOM rewrites).

### Download settings (customize workspace)

For Brand Studio HTML assets:

| Format | Role |
|--------|------|
| **PDF** | **Default** — print-fidelity shareable file |
| **HTML** | Offline interactive bundle with brand + language pinned |

Word (`.docx`) and PowerPoint (`.pptx`) are **not** offered for branded HTML assets (layout fidelity + serverless constraints). See `availableExportFormats` in `lib/export/formats.ts`.

User also chooses **document language** (`deckLang`: en / fr / es / de / pt).

---

## 4. Branding rules applied to documents

Implemented in **`lib/brand-apply.ts`** (preview iframe, pinned HTML export, and Playwright PDF path share the same script/CSS).

### Logo placement

| Page | Logo |
|------|------|
| **First** (cover) and **last** (closing) | One **large centered** logo in the content only — no top/bottom chrome logos |
| **Middle pages** | Logo in the **bottom-left footer** only — top chrome brandmark hidden |

### Section titles (no duplication)

- Chrome-top labels like `05 — THE PRODUCT` are **hidden**.
- The content **eyebrow** (e.g. `THE PRODUCT`) is kept and sized ~**50% larger** (16.5px vs 11px).

### Footer layout (all pages)

Evenly spaced three-column chrome:

```
[LOGO]     04 / 13   SLIDE NAME     © 2026 [COMPANY] | All Rights Reserved
```

- Logo is **50% larger** than the original chrome glyph (~42px).
- Year is **automatic** (`new Date().getFullYear()`).
- `[COMPANY]` comes from Brand Studio **company name**.
- Large content photos get bottom clearance so they don’t cover the footer.
- **Dark slides** (`.ink` / `.teal` / `.dark`, or luminance-detected dark backgrounds): footer text and logo render **white** for contrast.

### Cover & closing

- Standardized cover from Brand Studio title/subtitle fields.
- Closing slide/page: centered logo, contact from **CTA email** (fallback: legacy `content.contactEmail`), phone/website/socials when enabled.

---

## 5. “Add to My Resources” (collection, not instant download)

- Obtaining a file (or bundling several) uses **Add to My Resources**.
- Each add goes into a **client-side collection** (briefcase), keyed by asset id, persisted in **`localStorage`**.
- For HTML bundles, the user picks **document language** (and on customize, **export format** + optional **brand profile**).
- Adding does **not** download yet — the user completes the lead form on `/cart` first.

---

## 6. Header: My Resources and count

- The header shows **My Resources** with an item **count** badge.
- Clicking opens **`/cart`** to review, remove items, and unlock downloads.

---

## 7. Unlock downloads (lead form)

- On My Resources, the user submits **Full Name**, **Company**, **Email**, plus optional marketing opt-in.
- **Current behavior:**
  - `POST /api/bundle-request` validates the lead + asset list and **logs** the request (Vercel function logs).
  - The user gets a **download-ready** screen with per-file **Download** and **Download all as ZIP** when multiple files are selected.
- Email is for **lead identity** (and future CRM), not for file delivery.

---

## 8. Download / export pipeline

### Client

- `lib/trigger-download.ts` posts to **`/api/export`** when `useExportPost` is set (HTML decks, branded or language-converted).
- Request body: `{ assetId, deckLang, format, brandProfile? }`.
- Response headers: `Content-Type`, `Content-Disposition`, `X-Export-Format` (actual format delivered).

### Server (`app/api/export/route.ts`)

| Path | Behavior |
|------|----------|
| **HTML** | Load source deck → inject pinned brand/lang script (`injectPinnedHtmlExport`) |
| **PDF** (branded or generated) | Launch Chromium → apply lang + brand → `page.pdf()` |
| Unbranded cached | Redirect to pre-generated file under `public/assets/editable/` when present |

**PDF on Vercel:** uses `@sparticuz/chromium` + `playwright-core` (`lib/export/playwright.ts`). Locally uses full `playwright`.  
Traced into the function: HTML sources, `lib/export/extract-fn.browser.js`, Chromium package (`next.config.mjs` → `experimental.outputFileTracingIncludes`).

Hobby plan function memory is capped at **2048 MB** (`vercel.json`).

Failed PDF requests return an **error** (they no longer silently fall back to HTML).

### Key modules

| Module | Role |
|--------|------|
| `lib/brand-profile.ts` | Profile shape, storage, slim-for-export |
| `lib/brand-apply.ts` | CSS + DOM brand rules, pin script |
| `lib/export/generate.ts` | Format dispatch |
| `lib/export/generate-pdf.ts` | Print CSS + PDF sizing |
| `lib/export/generate-html.ts` | Pinned HTML |
| `lib/export/load-html-source.ts` | Read deck from disk (avoids Vercel auth wall on HTTP) |
| `lib/html-deck-i18n.ts` | Deck language support |

---

## 9. Why operate this way — tracking and demand

Steering users through **Add → Form → Download** records:

- **Which assets** were requested  
- **Who** requested them  
- **Which language / format** (and whether branding was applied)

Asset catalog fields `viewCount` / `downloadCount` exist for future event increments.

---

## 10. Implementation checklist

| Area | Status |
|------|--------|
| Detail card (what / why / how) | Implemented |
| Preview modal | Implemented |
| Brand Studio profile + live preview | Implemented |
| Getting Started DIY vs scrape (same form) | Implemented (`BrandStudioShell`, `/api/brand-from-url`) |
| Customize workspace (lang + PDF/HTML) | Implemented |
| Logo / footer / copyright / dark-chrome rules | Implemented |
| Add to My Resources + header count | Implemented |
| Cart persistence (`localStorage`) | Implemented |
| Lead form + form-gated download | Implemented |
| Branded / localized **PDF** on Vercel | Implemented (`@sparticuz/chromium`) |
| Branded / localized **HTML** pin export | Implemented |
| Bundle request API (logging) | Implemented |
| CRM / lead sync | **Not built** |
| Server-side tracking counters | **Not built** |
| Signed / expiring download URLs | **Not built** (public URLs today) |
| Word / PPTX branded export UI | **Removed** (engine code may still exist) |

When adding CRM, hook **`/api/bundle-request`** so every logged request also posts lead + asset ids to the CRM webhook.

---

## Related docs

| Doc | Topic |
|-----|--------|
| [`ADDING-CONTENT.md`](../ADDING-CONTENT.md) | Inventory import, placing files in `public/assets/` |
| [`docs/HTML-DECK-I18N.md`](./HTML-DECK-I18N.md) | Multi-language HTML decks |
| [`docs/ASSET-INVENTORY-LOCALE.md`](./ASSET-INVENTORY-LOCALE.md) | Localized inventory tabs |
| [`docs/I18N-AND-SANITY.md`](./I18N-AND-SANITY.md) | App locale / Sanity notes |
| [`Assets/HostopiaConnects/README.md`](../Assets/HostopiaConnects/README.md) | Source asset tree |
