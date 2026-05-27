# Internationalization (i18n) and Sanity CMS

## Current i18n setup (four portal locales)

- **Locales:** `en` (default), `fr-CA`, `es-MX`, `de` — defined in **`i18n/routing.ts`** (`allLocales`, `localeNames`, `tier1Locales` / `tier2Locales`).
- **URLs:** All routes use a locale prefix, e.g. `/en`, `/es-MX`, `/fr-CA`, `/de`, `/en/cart`, `/es-MX/how-it-works`.
- **Middleware:** `middleware.ts` uses `next-intl` with that routing config (unknown locale segments are not valid routes).
- **Translations:** UI strings live in **`messages/{locale}.json`** for each supported locale. Keep keys aligned with **`messages/en.json`**.
- **Language switcher:** Header dropdown lists only the four supported locales (see **`components/LanguageSwitcher.tsx`**). Switching updates the URL and keeps the same path (e.g. `/en/cart` → `/es-MX/cart`).

## Adding or restoring a locale

1. Add the locale code to **`i18n/routing.ts`** (`allLocales`, `localeNames`, `localeShortNames`, and `tier1Locales` or `tier2Locales` as appropriate).
2. Add **`messages/<locale>.json`** with the same keys as `en.json`.
3. If the inventory script validates UI locales, update **`APP_LOCALES`** in **`scripts/inventory-to-assets.mjs`** to match.
4. Add a flag entry in **`LanguageSwitcher.tsx`** (`UI_LOCALE_FLAGS`) if needed.

## Filtering assets by language

The app’s `Asset` type has a `language` field (content language of the file, e.g. `"English" | "Spanish"`). That is separate from the **portal UI locale** (`en`, `es-MX`, …). Localized **copy** from the asset inventory is merged into `asset.i18n[locale]`; see **`docs/ASSET-INVENTORY-LOCALE.md`**.

## Sanity as headless CMS for HostopiaConnects

When you move content and assets into Sanity:

### 1. Document types and language

- **Asset / Resource document type:** Add a `language` field (e.g. string or reference to a “Language” document). Use values that match the app’s content-language model and inventory.
- **Page or marketing content:** For copy that varies by locale, either use a `language` field (one document per language) or object fields keyed by locale (e.g. `title: { en: "...", "es-MX": "..." }`).

### 2. Suggested Sanity schema (asset example)

```js
// asset or resource type
{
  name: 'asset',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'slug', type: 'slug', required: true },
    { name: 'language', type: 'string', options: { list: ['en', 'es', 'es-MX', 'fr', 'de'] } },
    { name: 'file', type: 'file' },
    { name: 'journey', type: 'string' },
    { name: 'productCategory', type: 'string' },
    { name: 'contentType', type: 'string' },
    { name: 'summaryWhat', type: 'text' },
    { name: 'summaryWhy', type: 'text' },
    { name: 'summaryHow', type: 'text' },
  ],
}
```

- **Query by language:** In GROQ, filter with `language == $locale` (or your mapped value). Fetch assets for the current locale and, if desired, fall back to English when a localized version is missing.

### 3. Machine translation (optional)

For assets that exist only in English, you can add an optional machine-translation step and store results in Sanity or cache; label machine-generated copy clearly in the UI.
