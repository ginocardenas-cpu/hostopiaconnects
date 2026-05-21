# Hostopia Connects — inventory workbooks

Place the latest **`Hostopia_Asset_Inventory v2 - UPDATED 2026-05-21.xlsx`** (or any name containing **`UPDATED`** and **`2026`**) in this folder. The importer prefers that file over `Hostopia_Asset_Inventory v2.xlsx` when both exist.

## How `npm run assets:from-inventory` uses sheets

1. **`Asset Inventory`** — full catalog (baseline). If your workbook only has **two** tabs (e.g. Summary + Asset Inventory), that sheet is still picked up: we match the exact name **Asset Inventory**, or any tab whose name contains **inventory** but not **new** (case-insensitive).
2. **`NEW Assets`** (optional) — audit / updates. Rows with the same **Title** as a baseline row **replace** that row’s fields (filename, summaries, gated, last updated, etc.). Rows whose **Title** is new are **appended**.

If your **UPDATED** workbook only fills **`NEW Assets`** and leaves **`Asset Inventory`** empty, the script also reads **`Hostopia_Asset_Inventory v2.xlsx`** from this folder for the baseline and merges **`NEW Assets`** from the primary file on top.

## Override path

```bash
set ASSETS_INVENTORY_XLSX=C:\path\to\your.xlsx
npm run assets:from-inventory
```

Or pass the path as the first argument to `node scripts/inventory-to-assets.mjs`.
