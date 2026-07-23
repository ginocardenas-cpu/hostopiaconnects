# Home highlights & engagement tracking

**UI:** Homepage **What’s New / Most Popular / Most Downloaded** (`components/HomeHighlights.tsx`).

---

## 1. Ranking rules (product definition)

| Tab | Driven by | Definition |
|-----|-----------|------------|
| **What’s New** | Catalog recency | Newest assets **added or updated** in Hostopia Connects (`lastUpdated`, then inventory import date when available). Prefer variety across products when dates tie. |
| **Most Popular** | Preview engagement | Total **preview opens** (asset preview modal / in-app preview), not detail-page visits alone. |
| **Most Downloaded** | Fulfilled gated requests | Count when a user **submits contact info** on the My Resources / lead form **and** a download is issued for that asset (pre–paywall / form-gated fulfillment). Do **not** count ungated direct file hits or abandoned carts. |

These three signals must stay **independent** — previewing does not increment downloads; downloading does not increment previews.

---

## 2. Current interim behavior (seed)

Until server-side counters exist, rankings come from **`lib/home-highlights-seed.json`**:

- `mode: "seed"` — home tabs use curated ID lists (diverse products + Overview / Presentation / Slick mix) and seeded `viewCount` / `downloadCount` / optional `lastUpdated` overlays.
- `mode: "live"` — tabs sort all assets by `lastUpdated` / `viewCount` / `downloadCount` only.

Seed lists are applied in `lib/assets.ts` (`getLatestAssets`, `getMostViewedAssets`, `getMostDownloadedAssets`). Inventory re-import resets catalog counters to `0`; the seed file survives so the homepage still looks populated.

**Edit the seed** when you want different demo assets; keep three different products per list and mix deliverable types.

---

## 3. Tracking plan (to build next)

### 3.1 Data model (suggested)

Per asset (and optionally per day for trends):

| Field | Event |
|-------|--------|
| `previewCount` | Preview modal opened for asset |
| `downloadCount` | Lead form submitted + download started for asset |
| `lastPreviewAt` / `lastDownloadAt` | Optional timestamps |
| `lastUpdated` | Already on catalog from inventory |

Store in a durable store (DB / KV / analytics warehouse)—**not** only `assets.data.json` (that file is regenerated from Excel).

### 3.2 Instrumentation points

| Event | Where to hook |
|-------|----------------|
| **Preview** | `AssetPreviewButton` / `HtmlDeckPreviewFrame` when the preview modal successfully opens |
| **Download (gated)** | `/api/bundle-request` after a successful lead + item resolution (same moment fulfillment begins) |
| **What’s New** | Inventory `Last Updated` / new rows on import — no click tracking required |

### 3.3 API sketch

- `POST /api/engagement` `{ assetId, event: "preview" | "download" }` — or fold download into existing bundle-request logging.
- `GET` path not required for home if counters are denormalized onto a small rankings cache refreshed periodically.

### 3.4 Privacy & product notes

- Preview can be anonymous (increment counter only).
- Download is tied to lead PII already captured on the form — reuse that request log for CRM later.
- Dedupe optional later (e.g. one preview per session per asset) — start with raw counts.

### 3.5 Flip to live

1. Ship counters + hooks above.
2. Backfill or start from zero.
3. Set `"mode": "live"` in `home-highlights-seed.json` (or remove seed lists).
4. Confirm homepage + library “popular / downloaded” sorts use the same fields.

---

## 4. Related docs

| Doc | Topic |
|-----|--------|
| [`MY-RESOURCES-AND-FULFILLMENT.md`](./MY-RESOURCES-AND-FULFILLMENT.md) | Form → download funnel |
| [`ADDING-CONTENT.md`](../ADDING-CONTENT.md) | Catalog / inventory |
| [`NEW-PRODUCT-DOCUMENT-PROCESS.md`](./NEW-PRODUCT-DOCUMENT-PROCESS.md) | Shipping new Overview / Slick / Presentation |
