# Adding your docs and videos to Hostopia Connects

Use this flow to add real documents and videos so you can test browse, preview, and download.

## 1. Put files in `public/assets/`

- **Documents:** PDF, DOCX, etc. → e.g. `public/assets/my-sales-deck.pdf`
- **Videos:** MP4, WebM, etc. → e.g. `public/assets/product-demo.mp4`

The site will serve them at `/assets/your-filename.pdf` (or `.mp4`).

## 2. Add (or edit) entries in the catalog

Edit **`lib/assets.ts`** and add an object to the **`sampleAssets`** array. Each asset needs:

| Field | Example | Notes |
|-------|---------|--------|
| `id` | `"my-sales-deck"` | Unique ID (often same as slug) |
| `slug` | `"my-sales-deck"` | URL slug → `/assets/my-sales-deck` |
| `title` | `"Q1 Sales Overview Deck"` | Display title |
| `journey` | `"Build a Brand"` | One of: Build a Brand, Get Online, Get Found, Grow their Business |
| `productCategory` | `"Logo"` | e.g. Domains, SSL, Website, Logo, Email, Ecommerce, … |
| `contentType` | `"Presentation"` | Video, Presentation, Document, Playbook, Training, Case Study, Tool |
| `useCases` | `["Sales", "Marketing"]` | Array of: Sales, Marketing, Training & Onboarding, Support |
| `summaryWhat` | Short description of what it is | 1–2 sentences |
| `summaryWhy` | Why it matters | 1–2 sentences |
| `summaryHow` | How to use it | 1–2 sentences |
| `language` | `"English"` | English, French, Spanish, Portuguese |
| `region` | `"Global"` | Global, North America, EMEA, APAC |
| `gated` | `true` or `false` | Lead-gated vs direct download |
| `internalOnly` | `false` | Usually false for partner-facing |
| `fileUrl` | `"/assets/my-sales-deck.pdf"` | Must match file under `public/assets/` |
| `lastUpdated` | `"2026-03-10"` | Date string (YYYY-MM-DD) |
| `viewCount` | `0` | Can start at 0 |
| `downloadCount` | `0` | Can start at 0 |

## Example: a PDF deck

```ts
{
  id: "my-sales-deck",
  slug: "my-sales-deck",
  title: "Q1 Sales Overview Deck",
  journey: "Build a Brand",
  productCategory: "Logo",
  contentType: "Presentation",
  useCases: ["Sales", "Training & Onboarding"],
  summaryWhat: "Quarterly sales overview and positioning for logo design.",
  summaryWhy: "Keeps reps aligned on messaging and proof points.",
  summaryHow: "Use in team meetings and as a leave-behind for prospects.",
  language: "English",
  region: "Global",
  gated: true,
  internalOnly: false,
  fileUrl: "/assets/my-sales-deck.pdf",
  lastUpdated: "2026-03-10",
  viewCount: 0,
  downloadCount: 0
}
```

## Example: a video

```ts
{
  id: "product-demo-mar-2026",
  slug: "product-demo-mar-2026",
  title: "Product demo March 2026",
  journey: "Get Online",
  productCategory: "Website",
  contentType: "Video",
  useCases: ["Sales", "Training & Onboarding"],
  summaryWhat: "Short walkthrough of the latest website builder features.",
  summaryWhy: "Helps reps and partners demo the product confidently.",
  summaryHow: "Share before calls or use in training sessions.",
  language: "English",
  region: "Global",
  gated: false,
  internalOnly: false,
  fileUrl: "/assets/product-demo-mar-2026.mp4",
  lastUpdated: "2026-03-10",
  viewCount: 0,
  downloadCount: 0
}
```

## 3. Check that it works

- **Browse:** Use **Browse by** in the nav → pick journey/product/content type/use case → **Show matching assets**. Your new asset should appear if it matches the filters.
- **Detail:** Open `/assets/your-slug` (e.g. `/assets/my-sales-deck`). Preview opens `fileUrl` in a new tab; Add to Cart adds it to the Download Cart.
- **Home:** “What’s New” / “Most Popular” / “Most Downloaded” pull from the same `sampleAssets` list.

Once your files are in `public/assets/` and their entries are in `sampleAssets`, the portal will use them for browse, preview, and download flows.
