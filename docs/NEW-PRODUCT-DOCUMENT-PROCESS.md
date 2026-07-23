# New product documents — create, translate, publish

**Purpose:** Repeatable process to ship a new Hostopia product as the same **three-document set** already live in Hostopia Connects, with the same look/feel, languages, Brand Studio, and PDF download path.

**Audience:** Content / design owners who author the HTML, plus whoever updates the inventory and deploys the portal.

**Gold standard:** Clone structure and chrome from an existing complete product (e.g. **Professional Logo Design** or **Domain Services**) — do not invent a new layout system.

---

## 1. What “done” looks like

Every product ships **exactly three** self-contained HTML deliverables:

| Deliverable | Role | Content type in catalog | Source folder |
|-------------|------|-------------------------|---------------|
| **Overview** | Scrollable product overview / training leave-behind | `Document` | `Assets/HostopiaConnects/Overview Docs V2/` |
| **Sales Slick** | Short scrollable sales leave-behind | `Document` | `Assets/HostopiaConnects/Sales Slicks/` |
| **Sales Presentation** | Slide deck (keyboard / click nav) | `Presentation` | `Assets/HostopiaConnects/Presentations V2/` |

Together with the other products, that is **3 files × N products** in the library.

Each file must:

1. Match Hostopia visual language (teal / charcoal / cream, Montserrat + Raleway patterns used in existing decks).
2. Be a **single HTML file** (CSS, fonts, images, and translations inlined — safe in an iframe).
3. Support **five languages** inside the file: `en` · `es` · `de` · `fr` · `pt` (Brazilian Portuguese).
4. Expose the portal language contract (`applyLang`, `#lang-toggle`, per-file `localStorage` key).
5. Work with **Customize design** (Brand Studio) and **PDF** (default) / **HTML** export.

Portal details: [`portal-i18n-integration-brief.md`](./portal-i18n-integration-brief.md), [`MY-RESOURCES-AND-FULFILLMENT.md`](./MY-RESOURCES-AND-FULFILLMENT.md).

---

## 2. Design & format rules (keep look/feel consistent)

### 2.1 Start from a template, don’t redesign

1. Pick a **reference product** that already looks correct in preview + branded PDF.
2. Copy its three HTML files.
3. Rename for the new product (see naming below).
4. Swap product copy, proof points, and imagery — **keep** section/slide structure, chrome classes, and CSS tokens.

### 2.2 Naming (required for sync + catalog)

Use this pattern (date = ship date):

```text
{Product Name} Overview FINAL YYYY-MM-DD.html
{Product Name} Sales Slick FINAL YYYY-MM-DD.html
{Product Name} Presentation FINAL YYYY-MM-DD.html
```

Examples that already work with `npm run assets:sync-public`:

- `Domain Services Overview FINAL 2026-05-18.html`
- `Domain Services Sales Slick FINAL 2026-05-18.html`
- `Domain Services Presentation FINAL 2026-05-18.html`

Rules:

- Product name in the filename must be **stable and human** (same stem across all three).
- Deliverable keywords must appear exactly: **`Overview`**, **`Sales Slick`**, **`Presentation`**.
- Prefer `FINAL YYYY-MM-DD` so re-bundles can bump the date without changing the matching stem.

### 2.3 Structural must-haves (all three types)

| Requirement | Why |
|-------------|-----|
| Hostopia chrome: brandmark / top chrome + bottom chrome (`chrome-bot` / `page-chrome-bot` / `pchrome-bot`) | Brand Studio injects logo, page label, copyright |
| Eyebrow + clear hierarchy on content pages | Matches existing decks; portal CSS scales eyebrow for brand apply |
| First page = cover; last page = closing | Brand Studio puts large centered logos on first/last only; middle pages use footer logo |
| CSS variables for brand colors (`--teal`, `--ink`, `--cream`, etc.) | Brand Studio remaps palette without rewriting every rule |
| Images inlined or relative and bundled | Preview + PDF export stay offline-safe |
| No dependency on external app APIs | iframe / Vercel export must not call your laptop |

**Presentation-only:** slide sections (`section.slide`), slide navigation, keyboard support — same pattern as existing Presentations V2 files.

**Overview / Slick:** scrolling pages (`div.page` / `section.page` pattern used in those folders) — not slide clickers.

### 2.4 Visual language (quick checklist)

- Palette defaults: Hostopia teal `#2CADB2` / deep teal, charcoal text, cream / white surfaces, gold sparingly (see [`hostopia-design-system.md`](./hostopia-design-system.md) for brand tokens; decks may use their own CSS vars that Brand Studio overrides).
- Typography: heading vs body separation consistent with the reference deck.
- One job per section/slide; avoid inventing new card systems or purple/gradient themes.
- Lifecycle / journey colors (Build a Brand / Get Online / Get Found / Grow) only when the content itself is about portfolio fit — use the fixed accents in the design system doc.

### 2.5 Brand Studio readiness

Authors do **not** need to implement Brand Studio. They must not break the hooks it relies on:

- Keep chrome class names and a replaceable brandmark.
- Avoid hard-coded absolute logo images that sit outside chrome / cover / closing slots.
- Prefer theme colors via CSS variables so partner colors apply cleanly.

After publish, partners use **Customize design** → PDF/HTML. See Brand Studio section in [`MY-RESOURCES-AND-FULFILLMENT.md`](./MY-RESOURCES-AND-FULFILLMENT.md).

---

## 3. Process A — Create the three documents

```text
Owner: Content / design (HTML author)
```

| Step | Action | Output |
|------|--------|--------|
| **A1** | Confirm product name, journey lane, and messaging outline (What / Why / How for the portal card). | Brief approved |
| **A2** | Clone the three reference HTML files; rename with the naming pattern. | Three draft HTML files |
| **A3** | Replace English copy and images; keep layout, chrome, and `applyLang` machinery. | EN-complete drafts |
| **A4** | Smoke-test locally: open each HTML in a browser — cover, middle pages, closing, nav (presentation). | Pass / fix list |
| **A5** | Drop files into the correct folders under `Assets/HostopiaConnects/` (see table in §1). | Source tree updated |

**Do not** ship PPTX/DOCX/PDF as the primary Connects asset for this program. The portal path for branding + multi-language + PDF generation is the **HTML bundle**.

---

## 4. Process B — Translate (five languages in one file)

```text
Owner: Localization + HTML author
```

Languages (every file, every product):

| Code | Language |
|------|----------|
| `en` | English (source) |
| `es` | Spanish |
| `de` | German |
| `fr` | French |
| `pt` | Brazilian Portuguese |

### 4.1 Contract each HTML must keep

Every bundle must expose:

1. **`window.applyLang(lang)`** — switches all UI strings / inline HTML for `en|es|de|fr|pt`.
2. **`#lang-toggle`** — five buttons with `data-lang="…"`.
3. **Unique `localStorage` key** per file (pattern `<prefix>DeckLang` / `SlickLang` / `OverviewLang`).

Full contract: [`portal-i18n-integration-brief.md`](./portal-i18n-integration-brief.md).

### 4.2 Translation workflow (simple)

| Step | Action |
|------|--------|
| **B1** | Freeze English strings in the reference deck’s translation table / `LANG` object (whatever pattern the cloned file uses). |
| **B2** | Export string list for translators (or edit the embedded table directly). |
| **B3** | Paste translations for `es`, `de`, `fr`, `pt`. Keep HTML fragments (bold, links, line breaks) intact where the EN source uses them. |
| **B4** | Click each language in `#lang-toggle` and spot-check every page/slide for overflow, truncation, and broken markup. |
| **B5** | Confirm `applyLang('pt')` shows Brazilian Portuguese and that unknown codes do not throw. |

**Portal catalog copy** (title, What/Why/How on the asset card) is separate: maintain localized inventory tabs per [`ASSET-INVENTORY-LOCALE.md`](./ASSET-INVENTORY-LOCALE.md). In-document language ≠ portal UI locale, but both should be updated for a complete launch.

### 4.3 New product → portal storage prefix

If the product name is **new**, add a matcher + prefix in `lib/html-deck-i18n.ts` (`PRODUCT_MATCHERS`) so preview can pre-seed language without flash. Follow existing rows (e.g. Logo → `logo`, Domain Services → `ds`). Update the map table in [`portal-i18n-integration-brief.md`](./portal-i18n-integration-brief.md) when you do.

---

## 5. Process C — Add to Hostopia Connects (catalog + deploy)

```text
Owner: Portal / ops (can be same person as author)
```

Goal: the three files appear in browse, detail, preview, Customize design, My Resources, and PDF download — with minimal manual coding.

### 5.1 Inventory (catalog metadata)

1. Open the latest workbook under `Assets/HostopiaConnects/` (prefer `*UPDATED*YYYY*`).
2. Add **three rows** (one per deliverable) on **`NEW Assets`** (or the localized inventory tabs — see [`ASSET-INVENTORY-LOCALE.md`](./ASSET-INVENTORY-LOCALE.md)).
3. Fill at least:

   | Field | Notes |
   |-------|--------|
   | **Title** | Distinct per deliverable (e.g. “Acme Sales Presentation”) |
   | **Filename** | Exact HTML filename including `FINAL` date |
   | **Journey** | Build a Brand / Get Online / Get Found / Grow their Business |
   | **Product category** | Matches product family |
   | **Content type** | Presentation vs Document (Overview + Slick = Document) |
   | **Use cases** | Usually includes Sales |
   | **What / Why / How** | Short portal card copy |
   | **Language / Region** | Catalog defaults (e.g. English / Global); multi-lang lives in HTML |
   | **Gated** | Usually `true` for partner downloads |
   | **Last updated** | Ship date |

4. Run:

   ```bash
   npm run assets:from-inventory
   ```

   This refreshes `lib/assets.data.json` (and optional product page copy).

Details: [`ADDING-CONTENT.md`](../ADDING-CONTENT.md), [`Assets/HostopiaConnects/README.md`](../Assets/HostopiaConnects/README.md).

### 5.2 Sync HTML into the app

```bash
npm run assets:sync-public
```

This:

- Copies matched HTML from `Assets/HostopiaConnects/` → `public/assets/` using **product + deliverable** (ignores date drift when matching sources).
- Rebuilds `lib/asset-deck-i18n.json` (`filesWithApplyLang`) so **Customize design** and language export unlock only for files that expose `applyLang`.

If the script reports **Missing source**, fix folder placement or filename keywords (`Overview` / `Sales Slick` / `Presentation`).

### 5.3 Optional: pre-generate exports

```bash
npm run assets:export-all
```

Warms `public/assets/editable/` for faster downloads. On-demand `GET /api/export` still works if you skip this.

### 5.4 Ship

```bash
npm run build
git add lib/assets.data.json lib/asset-deck-i18n.json lib/html-deck-i18n.ts public/assets/
# plus inventory workbook / source HTML under Assets/ if those are versioned in your workflow
git commit -m "Add {Product} overview, slick, and presentation to Connects."
git push
# deploy production (e.g. npx vercel --prod) per team practice
```

### 5.5 End-to-end QA (keep it short)

For **each** of the three assets:

| Check | Pass criteria |
|-------|----------------|
| Detail page | Card copy correct; **Customize design** link visible |
| Preview | Opens in modal; portal language switch changes deck language |
| Customize | Logo / colors apply in live preview |
| My Resources | Add with document language + **PDF** default |
| Download | Lead form → branded **PDF** downloads; HTML alternate works |
| Non-EN | Spot-check `es` and `pt` in preview |

---

## 6. Roles & hand-offs (RACI-lite)

| Stage | Content/Design | Localization | Portal ops |
|-------|----------------|--------------|------------|
| Create EN HTML trio | **Owns** | Consult | — |
| Translate in-file + QA langs | Supports | **Owns** | — |
| Inventory rows + sync + deploy | Supports | — | **Owns** |
| Brand Studio / PDF smoke test | Supports | — | **Owns** |

---

## 7. Simplicity rules (do not skip)

1. **Always ship the set of three** — never only a presentation if the product is meant to match the current library pattern.
2. **Always clone** an existing good file — never start from a blank HTML or a PowerPoint export unless you re-apply the full contract.
3. **One filename pattern** — sync and inventory depend on it.
4. **Languages live inside the HTML** — do not create five separate files per deliverable.
5. **Catalog is Excel-first** — prefer `assets:from-inventory` over hand-editing JSON except for emergency fixes.
6. **Customize + PDF are automatic** once `applyLang` is present and the file is synced — no per-asset export code.

---

## 8. Quick reference commands

```bash
# 1) Catalog from Excel
npm run assets:from-inventory

# 2) Copy HTML → public + refresh applyLang manifest
npm run assets:sync-public

# 3) Optional prebuild PDF/HTML variants
npm run assets:export-all

# 4) Verify app build
npm run build
```

---

## 9. Related docs

| Doc | Use when |
|-----|----------|
| [`ADDING-CONTENT.md`](../ADDING-CONTENT.md) | Inventory import & generic file drop-in |
| [`ASSET-INVENTORY-LOCALE.md`](./ASSET-INVENTORY-LOCALE.md) | Localized portal card copy (en / es-MX / fr-CA / de / pt-BR) |
| [`portal-i18n-integration-brief.md`](./portal-i18n-integration-brief.md) | `applyLang` contract & storage keys |
| [`HTML-DECK-I18N.md`](./HTML-DECK-I18N.md) | Portal preview / export language behavior |
| [`MY-RESOURCES-AND-FULFILLMENT.md`](./MY-RESOURCES-AND-FULFILLMENT.md) | Partner flow: customize, My Resources, PDF |
| [`hostopia-design-system.md`](./hostopia-design-system.md) | Brand tokens & lifecycle colors |
| [`Assets/HostopiaConnects/README.md`](../Assets/HostopiaConnects/README.md) | Workbook location & sheet rules |
