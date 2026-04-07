# Bulk import: hundreds of assets in one push

Use a **CSV file** and one command to add or update all assets, then push once to deploy.

---

## 1. Get the template

- Open **`data/assets-template.csv`** in Excel, Google Sheets, or any spreadsheet app.
- Or copy it and save as **`data/assets.csv`** (this is the file the script reads).

**CSV columns (one row per asset):**

| Column | Example | Notes |
|--------|---------|--------|
| `filename` | `domain-registration-overview.docx` | Exact file name in `public/assets/`. Use `%20` for spaces (e.g. `My%20Doc.docx`). |
| `title` | Domain Registration Overview | Display title on the asset page. |
| `journey` | Build a Brand | One of: Build a Brand, Get Online, Get Found, Grow their Business |
| `productCategory` | Domains | e.g. Domains, SSL, Website, Logo, Email, Ecommerce, Online Fax, Directory Listings, Reputation Management |
| `contentType` | Document | Video, Presentation, Document, Case Study, Playbook, Training, Tool |
| `useCases` | Sales; Training & Onboarding | Semicolon-separated. Values: Sales, Marketing, Training & Onboarding, Support |
| `summaryWhat` | A concise overview of… | What it is (1–2 sentences). Use quotes in CSV if the text contains commas. |
| `summaryWhy` | Your domain is the foundation… | Why it matters. Use quotes if the text contains commas. |
| `summaryHow` | Sales tool: Quickly position… | How to use it. Use quotes if the text contains commas. Newlines in quoted cells are kept. |
| `language` | English | English, French, Spanish, Portuguese |
| `region` | Global | Global, North America, EMEA, APAC |
| `gated` | false | `true` or `false` |
| `lastUpdated` | 2026-03-10 | YYYY-MM-DD |

---

## 2. Put all files in `public/assets/`

- Copy every PDF, Word doc, PowerPoint, video, etc. into **`HostopiaConnects/public/assets/`**.
- **Filenames must match** the `filename` column in your CSV (including spaces → `%20` or use no spaces).

---

## 3. Fill the CSV

- Add one row per asset.
- You can start from `data/assets-template.csv` (it has the current 7 assets) and add your hundreds of rows below.
- Save as **`data/assets.csv`** in the same folder (or keep your own path and pass it to the script in step 4).

---

## 4. Generate the catalog

From the **HostopiaConnects** folder:

```bash
cd HostopiaConnects
npm install
npm run assets:import
```

Or with a custom CSV path:

```bash
node scripts/csv-to-assets.js path/to/your-assets.csv
```

This writes **`lib/assets.data.json`** (the app loads the catalog from this file).

---

## 5. One big push

From the **hostopia-website-2** repo root:

```bash
git add HostopiaConnects/public/assets/ HostopiaConnects/data/ HostopiaConnects/lib/assets.data.json HostopiaConnects/scripts/ HostopiaConnects/package.json HostopiaConnects/package-lock.json
git status
git commit -m "Bulk import: add assets and catalog"
git push origin main
git subtree push --prefix=HostopiaConnects hostopiaconnects main
```

- **Large files:** GitHub rejects files over 100 MB. The repo already ignores `*.mp4`, `*.mov`, `*.webm` in `public/assets/`; add other large extensions to **HostopiaConnects/.gitignore** if needed, or host big files elsewhere and put their URLs in a custom column later.
- **Repo size:** Hundreds of small PDFs/Word/PPT are usually fine. If the repo gets too large, consider Git LFS or hosting files on a CDN and storing URLs in the CSV (script can be extended for that).

---

## Summary

| Step | What you do |
|------|-------------|
| 1 | Use **data/assets-template.csv** (columns above). |
| 2 | Put every file in **public/assets/** with the same name as in the CSV. |
| 3 | Fill **data/assets.csv** with one row per asset (or your own CSV path). |
| 4 | Run **npm run assets:import** in HostopiaConnects to regenerate **lib/assets.data.json**. |
| 5 | **git add** the assets folder, data folder, **lib/assets.data.json**, scripts, **package.json** (and lockfile), then **commit** and **push** (including **git subtree push** to hostopiaconnects). |

After that, the live site and Browse/Preview will use all assets from the new catalog in one go.
