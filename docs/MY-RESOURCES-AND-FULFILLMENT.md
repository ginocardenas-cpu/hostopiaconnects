# My Resources — intended product flow

This document is the **source of truth** for how Hostopia Connects is meant to work for end users: discovery, preview, collection, fulfillment, and **tracking** of which materials are most in demand.

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

## 2. Preview (optional)

- **Preview** lets users open the asset file in a new tab (e.g. PDF, HTML, video) to **review** before committing to a download request.
- Today this uses the asset’s `fileUrl` (served from **`public/assets/`**). If you later require that files are **only** available after fulfillment, the preview step would need to move behind signed URLs or a viewer—**not implemented yet**.

---

## 3. “Add to My Resources” (collection, not instant download)

- To **obtain a copy** of the file (or to bundle several files), the user uses **Add to My Resources**.
- Each add puts the asset into a **client-side collection** (briefcase), keyed by asset id/slug.
- The user is **not** meant to treat “Add to My Resources” as a silent direct download of the bundle from the server in one click; the **business intent** is to stage files, then **request** them so the system can log who asked for what.

---

## 4. Header: “My Resources” and count

- The header shows **My Resources** and indicates **how many** items are in the collection (e.g. badge or label).
- Clicking through goes to the **My Resources** page (`/cart` in the app) where the user **reviews** the list, can remove items, and continues to the request step.

---

## 5. Request fulfillment (email — **not built end-to-end yet**)

- On My Resources, the user submits **contact fields** (e.g. name, company, email) and confirms **Request your download links** (or equivalent).
- **Intended backend behavior (TBD):**
  - Send an email with **secure, time-limited download links** for each selected asset, **or** attach files—**product decision pending**.
  - Optionally sync the lead and asset list to **CRM** for follow-up (`README.md` mentions CRM integration).
- **Today:** submitting the form clears the local collection and shows a **placeholder success** message; there is **no** live email service or analytics pipeline wired in until you build that layer (API route, queue, ESP, CRM, etc.).

---

## 6. Why operate this way — **tracking and demand**

- By forcing (or strongly steering) users through **Add to My Resources → Request**, you can record:
  - **Which assets** were included in each request.
  - **Who** requested them (lead identity).
  - Aggregates such as **most requested** / **most fulfilled** materials—stronger for enablement planning than anonymous direct clicks alone.
- The catalog already includes **`viewCount`** / **`downloadCount`** fields on each asset for future use when you increment them from real events (preview, add-to-resources, email sent, link clicked, etc.).

---

## 7. Implementation checklist (engineering)

| Area | Status |
|------|--------|
| Detail card (what / why / how) | Implemented |
| Preview (new tab) | Implemented (`fileUrl`) |
| Add to My Resources + header affordance | Implemented (client state) |
| My Resources review page | Implemented (`/cart`) |
| Request form UI | Implemented |
| Email with links or attachments | **Not built** |
| CRM / lead sync | **Not built** |
| Server-side tracking counters | **Not built** (fields exist on `Asset`) |

When you implement fulfillment, prefer a single module (e.g. “bundle request” API) that logs asset ids + user identity, then sends email—so tracking stays consistent with this document.
