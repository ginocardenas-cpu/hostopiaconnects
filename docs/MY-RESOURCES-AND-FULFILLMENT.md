# My Resources — intended product flow

This document is the **source of truth** for how Hostopia Connects is meant to work for end users: discovery, preview, collection, lead capture, download, and **tracking** of which materials are most in demand.

Related UI copy lives in **`messages/en.json`** under `howItWorks` and `cart` (and mirrored in other locale files).

---

## 1. Discover and read the detail card

- Users browse the library (journeys, products, search, etc.) and open an **asset detail** view.
- The **detail card** shows structured metadata and the three narrative blocks:
  - **What it is**
  - **Why it’s important**
  - **How to use it**
- Catalog text comes from the asset inventory pipeline (see **`ADDING-CONTENT.md`** and **`Assets/HostopiaConnects/README.md`**).

---

## 2. Preview (in-app modal)

- **Preview** opens a **modal** over the page (no new tab). The modal shows the asset title, a **close** control, and the file in an embedded viewer when the format supports it (**HTML**, **PDF**, common **images**, **video**).
- **Hostopia Connects does not render a Download button** in this modal; fulfillment stays oriented toward **Add to My Resources** (see footer hint in the modal).
- **PDF caveat:** When the file is a PDF, many browsers still inject **their own** PDF toolbar (which may include download). That is browser UI, not something we add.
- **Word / PowerPoint:** In-browser preview usually requires **conversion to PDF** on the server or a third-party viewer; until then, users see a short message to use **My Resources** to download the file.

---

## 3. “Add to My Resources” (collection, not instant download)

- To **obtain a copy** of the file (or to bundle several files), the user uses **Add to My Resources**.
- Each add puts the asset into a **client-side collection** (briefcase), keyed by asset id/slug, persisted in **`localStorage`**.
- For HTML bundles with built-in i18n, the user picks the **document language** at add time.
- Adding does **not** download the file yet — the user must complete the lead form on `/cart` first.

---

## 4. Header: “My Resources” and count

- The header shows **My Resources** and indicates **how many** items are in the collection (badge).
- Clicking through goes to the **My Resources** page (`/cart`) where the user **reviews** the list, can remove items, and continues to the unlock step.

---

## 5. Unlock downloads (form gate — **implemented**)

- On My Resources, the user submits **contact fields** (Full Name, Company, Email) plus optional marketing opt-in.
- **Current behavior:**
  - `POST /api/bundle-request` validates the lead + asset list and **logs the request** server-side (Vercel function logs).
  - The user is taken to a **download-ready screen** on the same page with per-file **Download** buttons and **Download all as ZIP** when more than one file is selected.
  - Files are served from `public/assets/` (same-origin direct download).
- **Email is not used for delivery** — avoids spam-folder risk and gives immediate gratification.
- Email is still collected for **lead identity** and future CRM sync.

---

## 6. Why operate this way — **tracking and demand**

- By steering users through **Add to My Resources → Form → Download**, you can record:
  - **Which assets** were included in each request.
  - **Who** requested them (lead identity + optional opt-in).
  - **Which document language** was chosen for HTML bundles.
- The catalog includes **`viewCount`** / **`downloadCount`** fields on each asset for future use when you increment them from real events (preview, form submit, download clicked, etc.).

---

## 7. Implementation checklist (engineering)

| Area | Status |
|------|--------|
| Detail card (what / why / how) | Implemented |
| Preview modal | Implemented |
| Add to My Resources + header affordance | Implemented |
| Cart persistence (`localStorage`) | Implemented |
| My Resources review page | Implemented (`/cart`) |
| Lead form UI | Implemented |
| Form-gated immediate download | Implemented |
| HTML export (language + format) | Implemented (`/api/export`, `public/assets/editable/`) |
| Bundle request API (logging) | Implemented (`/api/bundle-request`) |
| CRM / lead sync | **Not built** |
| Server-side tracking counters | **Not built** (fields exist on `Asset`) |
| Signed / expiring download URLs | **Not built** (direct public URLs today) |

When you add CRM, hook into **`/api/bundle-request`** so every logged request also posts lead + asset ids to your CRM webhook.
