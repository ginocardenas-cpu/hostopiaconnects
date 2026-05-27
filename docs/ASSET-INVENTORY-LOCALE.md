# Hostopia asset inventory — multilingual reference

This document describes how the **Hostopia Asset Inventory v2** Excel workbook drives the catalog and **localized** asset previews in Hostopia Connects. For the broader “add files + manual catalog” flow, see **[`ADDING-CONTENT.md`](../ADDING-CONTENT.md)**.

---

## 1. Where to put the workbook

1. Save the `.xlsx` under **`Assets/HostopiaConnects/`** (same folder as other Hostopia handoff assets).
2. Prefer a filename that includes **`UPDATED`** and a **date** (e.g. `Hostopia_Asset_Inventory v2 - UPDATED 2026-05-26.xlsx`). The import script scores filenames so **newer dated** exports win when several `.xlsx` files exist.
3. Optional: point the importer at a specific file:
   - **Environment variable:** `ASSETS_INVENTORY_XLSX=C:\path\to\file.xlsx npm run assets:from-inventory`
   - **CLI argument:** `node scripts/inventory-to-assets.mjs "C:\path\to\file.xlsx"`

Implementation: `scripts/inventory-to-assets.mjs` (`resolvePrimaryWorkbook`, `CONNECT_DIR`).

---

## 2. Workbook tabs (typical v2 layout)

| Role | Example tab name | Purpose |
|------|------------------|--------|
| Summary / meta | `Summary` | Not used for the asset catalog. |
| **Canonical (English)** | `Asset Inventory English` | **Source of truth** for row order, **Filename**, filters (journey, product category, content type, use cases, language, region), slugs, and English display text. |
| Spanish (Mexico) | `Asset Inventory Spanish (MX)` | Merged into `i18n["es-MX"]` by **Filename** match. |
| French (Canada) | `Asset Inventory French (CAN)` … | Merged into `i18n["fr-CA"]`. |
| German | `Asset Inventory German` | Merged into `i18n["de"]`. |

**Important:** The importer **always prefers** a tab whose name matches **Asset Inventory … English** as the canonical base when present. Other localized tabs must **not** replace that role, or filters and slugs can break.

---

## 3. Row identity (matching across tabs)

- Rows are linked across languages by the **file name** in the file column (e.g. `Filename`, `File`, `Fichier`, `Datei` — the script normalizes these).
- The **basename** of that value (e.g. `Business Email Overview FINAL 2026-05-20.html`) must be **the same on every language tab** for the same asset so `i18n` overlays attach correctly.

---

## 4. Column mapping (what the portal reads)

Canonical **English** tab drives structured fields (`journey`, `productCategory`, `contentType`, `useCases`, etc.) via `rowToAsset()` in `scripts/inventory-to-assets.mjs`.

**Localized tabs** supply **display** strings stored under each asset’s `i18n[locale]` (same keys the UI reads via `getAssetDisplayForLocale()` in `lib/assets.ts`):

| Portal / UI | Typical English column | Typical Spanish | Typical French | Typical German |
|-------------|-------------------------|-----------------|----------------|----------------|
| File (download) | `File` / `Filename` | `Filename` | `Fichier` | `Datei` |
| Title | `Title` | `Título` | `Titre` | `Titel` |
| Journey (badge) | `Journey` | `Recorrido` | `Parcours` | `Kundenreise` |
| Product category (badge) | `Product Category` | `Categoría de producto` | `Catégorie de produit` | `Produktkategorie` |
| Content type (+ file type line) | `Content Type` + `File Type` | `Tipo de contenido` + `File Type` | … | `Content-Typ` + `File Type` |
| Primary use cases (sidebar) | `Primary Use Cases` (or `Use Cases`) | `Casos de uso` | `Cas d'usage principaux` | `Hauptanwendungsfälle` |
| What / Why / How (body) | `What it is`, `Why it's important`, `How to use it` | `Qué es`, `Por qué es importante`, `Cómo usarlo` | `De quoi s'agit-il`, … | `Was es ist`, `Warum es wichtig ist`, `Anwendung` |
| Language / region (badges + sidebar) | `Language`, `Region` | `Language`, `Region` | … | e.g. `Sprache / Region`, `Region` |

Older workbooks used merged headers like `Título | Resumen — Qué`; those are still supported in `cellSummary()`.

If you add new column spellings, extend the helpers in **`scripts/inventory-to-assets.mjs`** (`rowFilename`, `rowTitle`, `rowJourneyCell`, `rowProductCategoryCell`, `rowContentTypeCell`, `rowUseCasesCell`, `rowLanguageCell`, `rowRegionCell`, `cellSummary`).

---

## 5. Regenerate the catalog (required after workbook edits)

From the repo root:

```bash
npm run assets:from-inventory
```

This **overwrites**:

- **`lib/assets.data.json`** — full catalog + per-locale `i18n` objects.
- **`lib/product-page.copy.json`** — only if you maintain optional “product slug + intro” sheets (see script header and `PRODUCT_PAGE_COPY_SHEETS` in `inventory-to-assets.mjs`).

Then:

1. Ensure downloadable files exist under **`public/assets/`** with names matching the **Filename** column (URL encoding is applied in JSON, e.g. spaces → `%20`).
2. **Commit** `lib/assets.data.json` when you want the site (e.g. Vercel) to serve the new data without re-running the import in CI.

---

## 6. How the site picks a language

- URLs are locale-prefixed: **`/{locale}/assets/{slug}`**, **`/{locale}/library`**, etc. (`en`, `es-MX`, `fr-CA`, `de` — see `i18n/routing.ts`).
- **`getAssetDisplayForLocale(asset, locale)`** (`lib/assets.ts`) chooses:
  - **`asset.i18n[locale]`** fields when present (from the matching inventory tab),
  - otherwise falls back to the **canonical English** fields on the asset.

So to **see Spanish copy**, open **`/es-MX/...`**, not **`/en/...`**.

Pages that use this helper include: asset detail, product asset grids, library cards, search results, cart line items, and featured tiles.

---

## 7. Optional: product page intros (`/assets/product/{slug}`)

Separate from per-asset rows, you can maintain workbook tabs with **product slug + intro** columns to fill **`lib/product-page.copy.json`**. See **`ADDING-CONTENT.md`** and env **`PRODUCT_PAGE_COPY_SHEETS`** in `scripts/inventory-to-assets.mjs`.

---

## 8. Quick checklist

- [ ] New `.xlsx` saved under `Assets/HostopiaConnects/` with a clear **UPDATED YYYY-MM-DD** name.
- [ ] **English** inventory tab present and correct for filters and filenames.
- [ ] **Same Filename** (basename) across ES / FR / DE tabs for each asset.
- [ ] Run **`npm run assets:from-inventory`**.
- [ ] Files in **`public/assets/`** match the Filename column.
- [ ] Commit **`lib/assets.data.json`** (and workbook if you version it) when ready for production.

---

## Related files

| File | Role |
|------|------|
| `scripts/inventory-to-assets.mjs` | Reads XLSX, merges tabs, writes JSON. |
| `lib/assets.data.json` | Generated catalog (commit after import for deploys). |
| `lib/assets.ts` | Types, `sampleAssets` import, `getAssetDisplayForLocale`, `getAssetFieldsForLocale`. |
| `lib/product-page.copy.json` | Optional localized product-page intros. |
| `ADDING-CONTENT.md` | High-level content and import overview. |
