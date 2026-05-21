# Hostopia Connects Portal

This is a separate Next.js app that powers the **public-facing Hostopia Connects portal**, designed to match the visual language of the main Hostopia corporate site while focusing on:

- Modern UX for sales and partner enablement
- Structured content by product journey, content type, and use case
- **My Resources** flow: detail card + preview → add to collection → header count → request bundle (**email delivery & CRM still to be built**)

**Product flow (detail → preview → collect → request → tracking):** see **[`docs/MY-RESOURCES-AND-FULFILLMENT.md`](./docs/MY-RESOURCES-AND-FULFILLMENT.md)**. Shorter end-user copy also lives under `howItWorks` and `cart` in **`messages/en.json`**.

## Getting started

From the `HostopiaConnects` folder:

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

