# Internationalization (i18n) and Sanity CMS

## Current i18n setup (English + Mexican Spanish)

- **Locales:** `en` (default), `es-MX` (Mexican Spanish).
- **URLs:** All routes are under a locale segment, e.g. `/en`, `/es-MX`, `/en/cart`, `/es-MX/how-it-works`.
- **Middleware:** Redirects `/` to the default locale (`/en`) or the user’s preferred locale (cookie/header).
- **Translations:** UI strings live in `messages/en.json` and `messages/es-MX.json`. Use the same keys in both files.
- **Language switcher:** In the header (EN / ES). Switching updates the URL and keeps the same path (e.g. `/en/cart` → `/es-MX/cart`).
- **Adding a locale:** Add the code to `i18n/routing.ts` (`locales` and `localeNames`), create `messages/<locale>.json`, and add the language switcher label.

## Filtering assets by language

The app’s `Asset` type already has a `language` field (`"English" | "French" | "Spanish" | "Portuguese"`). To show only assets for the current UI locale:

- Map locale to content language, e.g. `en` → `"English"`, `es-MX` → `"Spanish"`.
- When listing assets (e.g. in the browse wizard, featured, or product/journey pages), filter with `asset.language === mappedLanguage`, and optionally fall back to English when there is no translation.

## Sanity as headless CMS for HostopiaConnects

When you move content and assets into Sanity:

### 1. Document types and language

- **Asset / Resource document type:** Add a `language` field (e.g. string or reference to a “Language” document). Use values that match the app’s locale mapping (e.g. `en`, `es`, `es-MX`).
- **Page or marketing content:** For copy that varies by locale, either:
  - Use a `language` field and one document per language, or
  - Use object/array fields keyed by locale (e.g. `title: { en: "...", "es-MX": "..." }`).

### 2. Suggested Sanity schema (asset example)

```js
// asset or resource type
{
  name: 'asset',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'slug', type: 'slug', required: true },
    { name: 'language', type: 'string', options: { list: ['en', 'es', 'es-MX', 'fr', 'de', 'it'] } },
    { name: 'file', type: 'file' },
    { name: 'journey', type: 'string' },
    { name: 'productCategory', type: 'string' },
    { name: 'contentType', type: 'string' },
    { name: 'summaryWhat', type: 'text' },
    { name: 'summaryWhy', type: 'text' },
    { name: 'summaryHow', type: 'text' },
    // ... useCases, gated, etc.
  ],
}
```

- **Query by language:** In GROQ, filter with `language == $locale` (or your mapped value). Fetch assets for the current locale and, if desired, fall back to `language == "en"` when a localized version is missing.

### 3. Machine translation (optional)

- For assets/documents that exist only in English, you can add an optional “machine translation” step (e.g. Google Cloud Translation or DeepL API) to generate a Spanish (or other) version on demand.
- Store the result (e.g. in Sanity as a new draft document or in cache) and label it as “Machine translated” in the UI.
- Prefer human-translated or uploaded Spanish (and other) documents when possible; use machine translation for missing languages or as a stopgap.

## Adding more languages

1. Add the locale to `i18n/routing.ts` (`locales` and `localeNames`).
2. Add `messages/<locale>.json` with the same keys as `en.json`.
3. In Sanity, add the corresponding language value to the `language` list and create/filter documents by that value in your queries.
