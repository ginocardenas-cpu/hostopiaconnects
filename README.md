# Hostopia Connects Portal

This is a separate Next.js app that powers the **public-facing Hostopia Connects portal**, designed to match the visual language of the main Hostopia corporate site while focusing on:

- Modern UX for sales and partner enablement
- Structured content by product journey, content type, and use case
- **Brand Studio** — customize logos, colors, and copy on HTML decks, then download **PDF** (default) or **HTML**
- **My Resources** flow: detail card + preview → customize / add to collection → header count → lead form → immediate download (**CRM sync still to be built**)

**How the product works (full detail):** see **[`docs/MY-RESOURCES-AND-FULFILLMENT.md`](./docs/MY-RESOURCES-AND-FULFILLMENT.md)**.  
**Adding a new product’s Overview / Slick / Presentation:** see **[`docs/NEW-PRODUCT-DOCUMENT-PROCESS.md`](./docs/NEW-PRODUCT-DOCUMENT-PROCESS.md)**.  
**Homepage What’s New / Popular / Downloaded:** see **[`docs/HOME-HIGHLIGHTS-AND-TRACKING.md`](./docs/HOME-HIGHLIGHTS-AND-TRACKING.md)**.  
**Video (SundaySky preview + MP4 download):** see **[`docs/VIDEO-ASSETS.md`](./docs/VIDEO-ASSETS.md)**.  
Shorter end-user copy also lives under `howItWorks`, `cart`, and `brandStudio` in **`messages/en.json`**.

**Production:** [https://hostopiaconnects-self.vercel.app](https://hostopiaconnects-self.vercel.app)

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` to view the portal shell.

## Claude Design handoff (HTML prototype)

Static export from **Claude Design** (product template family index) lives at:

- **`/design-handoff/project/index.html`** — family index (17 product rows + working files)
- **`/design-handoff/project/system.css`** — design tokens and shared components

Card links point at `Hostopiaconnects-mac/assets/...` HTML files from the bundle. To make those links work locally, extract the full `Hostopia Connects-handoff.tar.gz` from the design export and copy the `Hostopiaconnects-mac` tree under **`public/design-handoff/project/`** (see `public/design-handoff/README.md`).
