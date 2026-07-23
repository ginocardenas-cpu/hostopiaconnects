/** Catalog from inventory. Regenerate with `npm run assets:from-inventory` or `npm run assets:import`. See ADDING-CONTENT.md. */
import assetsData from "./assets.data.json";
/** Interim What’s New / Popular / Downloaded curation — see docs/HOME-HIGHLIGHTS-AND-TRACKING.md. */
import homeHighlightsSeed from "./home-highlights-seed.json";

export type ProductJourney =
  | "Build a Brand"
  | "Get Online"
  | "Get Found"
  | "Grow their Business";

export type ProductCategory =
  | "Domains"
  | "SSL"
  | "Website"
  | "Logo"
  | "Email"
  | "Ecommerce"
  | "Online Fax"
  | "Directory Listings"
  | "Reputation Management"
  /** Online Marketing Center — inventory “Product Category” values */
  | "Brand Monitoring"
  | "Marketing 360";

export type ContentType =
  | "Video"
  | "Presentation"
  | "Document"
  | "Case Study"
  | "Playbook"
  | "Training"
  | "Tool";

export type UseCase = "Sales" | "Marketing" | "Training & Onboarding" | "Support";

/**
 * Asset language — the language the asset content is written/recorded in.
 * This is separate from the portal UI locale. A French-speaking partner
 * might browse the portal in French but download an English sales deck.
 *
 * 14 languages matching Hostopia's 34-country footprint:
 * Tier 1: English, French, Spanish, Portuguese
 * Tier 2: German, Italian, Greek, Romanian, Bulgarian, Hungarian, Croatian, Norwegian, Swedish, Albanian
 */
export type AssetLanguage =
  | "English"
  | "French"
  | "Spanish"
  | "Portuguese"
  | "German"
  | "Italian"
  | "Greek"
  | "Romanian"
  | "Bulgarian"
  | "Hungarian"
  | "Croatian"
  | "Norwegian"
  | "Swedish"
  | "Albanian";

/** All asset languages for use in filter UIs. */
export const allAssetLanguages: AssetLanguage[] = [
  "English",
  "French",
  "Spanish",
  "German",
  "Portuguese",
  "Italian",
  "Greek",
  "Romanian",
  "Bulgarian",
  "Hungarian",
  "Croatian",
  "Norwegian",
  "Swedish",
  "Albanian",
];

/** Optional per-UI-locale copy merged from localized Asset Inventory workbook tabs (see inventory script). */
export type AssetLocaleFields = {
  title?: string;
  summaryWhat?: string;
  summaryWhy?: string;
  summaryHow?: string;
  /** Raw journey label from that locale’s sheet (e.g. Recorrido). */
  journeyDisplay?: string;
  /** Raw product category label from the sheet (e.g. Correo empresarial). */
  productCategoryDisplay?: string;
  /** Raw content type (+ optional file type) from the sheet. */
  contentTypeDisplay?: string;
  /** Primary use cases line as in the sheet (e.g. Ventas · Marketing). */
  useCasesDisplay?: string;
  /** Language cell from the sheet (may differ from canonical `asset.language`). */
  languageDisplay?: string;
  /** Region cell from the sheet. */
  regionDisplay?: string;
};

/** All user-visible strings for an asset for the active portal locale (inventory is source of truth when `i18n[locale]` is set). */
export type AssetDisplayForLocale = {
  title: string;
  summaryWhat: string;
  summaryWhy: string;
  summaryHow: string;
  journey: string;
  productCategory: string;
  contentType: string;
  useCasesLine: string;
  language: string;
  region: string;
};

export interface Asset {
  id: string;
  slug: string;
  title: string;
  /** Original file name from inventory (Filename column); shown on the asset card. */
  fileName?: string;
  journey: ProductJourney;
  productCategory: ProductCategory;
  contentType: ContentType;
  useCases: UseCase[];
  summaryWhat: string;
  summaryWhy: string;
  summaryHow: string;
  language: AssetLanguage;
  region: "Global" | "North America" | "EMEA" | "APAC" | "LATAM";
  gated: boolean; // Download Gate Status: true = gated, false = free/direct
  internalOnly: boolean;
  fileUrl: string;
  lastUpdated: string; // ISO date
  viewCount: number;
  downloadCount: number;
  /** Localized title/summaries keyed by app locale (e.g. `fr-CA`, `es-MX`, `de`). */
  i18n?: Record<string, AssetLocaleFields>;
}

/** Display name for the downloadable file (inventory Filename, or decoded from `fileUrl`). */
export function getAssetSourceFileName(asset: Asset): string {
  const fromInventory = asset.fileName?.trim();
  let fromUrl: string | null = null;
  if (asset.fileUrl?.trim()) {
    try {
      const seg = asset.fileUrl.split("?")[0]?.split("#")[0]?.split("/").pop() ?? "";
      fromUrl = decodeURIComponent(seg);
    } catch {
      fromUrl = asset.fileUrl.split("/").pop() ?? null;
    }
  }

  // When catalog Filename drifts from the deployed public asset, trust fileUrl.
  if (fromUrl && fromInventory && fromUrl !== fromInventory) {
    return fromUrl;
  }
  if (fromInventory) return fromInventory;
  if (fromUrl) return fromUrl;

  const seg = asset.fileUrl.split("/").pop() ?? "";
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

/** Title + summaries for the current portal locale when present in `asset.i18n`. */
export function getAssetFieldsForLocale(
  asset: Asset,
  locale: string
): Pick<Asset, "title" | "summaryWhat" | "summaryWhy" | "summaryHow"> {
  const pack = asset.i18n?.[locale];
  if (!pack) {
    return {
      title: asset.title,
      summaryWhat: asset.summaryWhat,
      summaryWhy: asset.summaryWhy,
      summaryHow: asset.summaryHow
    };
  }
  return {
    title: pack.title?.trim() || asset.title,
    summaryWhat: pack.summaryWhat?.trim() || asset.summaryWhat,
    summaryWhy: pack.summaryWhy?.trim() || asset.summaryWhy,
    summaryHow: pack.summaryHow?.trim() || asset.summaryHow
  };
}

const USE_CASE_SEP = " · ";

/**
 * Journey, category, content type, use cases, language, and region for the active locale,
 * falling back to canonical English fields on the asset when no overlay exists.
 */
export function getAssetDisplayForLocale(asset: Asset, locale: string): AssetDisplayForLocale {
  const fields = getAssetFieldsForLocale(asset, locale);
  const pack = asset.i18n?.[locale];
  return {
    title: fields.title,
    summaryWhat: fields.summaryWhat,
    summaryWhy: fields.summaryWhy,
    summaryHow: fields.summaryHow,
    journey: pack?.journeyDisplay?.trim() || asset.journey,
    productCategory: pack?.productCategoryDisplay?.trim() || String(asset.productCategory),
    contentType: pack?.contentTypeDisplay?.trim() || String(asset.contentType),
    useCasesLine: pack?.useCasesDisplay?.trim() || asset.useCases.join(USE_CASE_SEP),
    language: pack?.languageDisplay?.trim() || asset.language,
    region: pack?.regionDisplay?.trim() || asset.region
  };
}

export const journeys: { label: ProductJourney; slug: string }[] = [
  { label: "Build a Brand", slug: "build-a-brand" },
  { label: "Get Online", slug: "get-online" },
  { label: "Get Found", slug: "get-found" },
  { label: "Grow their Business", slug: "grow-their-business" }
];

export function journeyFromSlug(slug: string): ProductJourney | undefined {
  const match = journeys.find((j) => j.slug === slug);
  return match?.label;
}

export const journeyProducts: {
  journey: ProductJourney;
  label: string;
  slug: string;
  category: ProductCategory;
  description: string;
}[] = [
  // Build a Brand
  {
    journey: "Build a Brand",
    label: "Domains",
    slug: "domains",
    category: "Domains",
    description: "Domain naming and registration assets for first conversations."
  },
  {
    journey: "Build a Brand",
    label: "Logo Design",
    slug: "logo",
    category: "Logo",
    description: "Logo design decks, playbooks, and discovery guides."
  },
  {
    journey: "Build a Brand",
    label: "Business Email",
    slug: "email",
    category: "Email",
    description: "Business email positioning, training, and launch materials."
  },
  // Get Online
  {
    journey: "Get Online",
    label: "SSL",
    slug: "ssl",
    category: "SSL",
    description: "SSL value stories, objection handling, and quick-reference docs."
  },
  {
    journey: "Get Online",
    label: "Hosting",
    slug: "hosting",
    category: "Website",
    description: "Hosting overviews, technical one-pagers, and SLAs."
  },
  {
    journey: "Get Online",
    label: "Website Builder & Design",
    slug: "website",
    category: "Website",
    description: "Website builder demos, design examples, and sales enablement."
  },
  // Get Found
  {
    journey: "Get Found",
    label: "Directory Listings",
    slug: "directory-listings",
    category: "Directory Listings",
    description: "Listings coverage maps, value props, and sales tools."
  },
  {
    journey: "Get Found",
    label: "SEO",
    slug: "seo",
    category: "Website",
    description: "SEO positioning, playbooks, and campaign assets."
  },
  {
    journey: "Get Found",
    label: "Reputation Management",
    slug: "reputation-management",
    category: "Reputation Management",
    description: "Reviews, ratings, and reputation playbooks and case studies."
  },
  // Grow their Business
  {
    journey: "Grow their Business",
    label: "Ecommerce",
    slug: "ecommerce",
    category: "Ecommerce",
    description: "Ecommerce demos, ROI stories, and upsell frameworks."
  },
  {
    journey: "Grow their Business",
    label: "Custom Website Development",
    slug: "custom-website-development",
    category: "Website",
    description: "Custom design proposals, scoping guides, and success stories."
  },
  {
    journey: "Grow their Business",
    label: "Online Fax",
    slug: "online-fax",
    category: "Online Fax",
    description: "Online Fax use cases, training, and sales tools."
  },
  {
    journey: "Grow their Business",
    label: "Brand Monitoring",
    slug: "brand-monitoring",
    category: "Brand Monitoring",
    description: "OMC starter tier — alerts, unified feed, and competitor tracking enablement."
  },
  {
    journey: "Grow their Business",
    label: "Marketing 360",
    slug: "marketing-360",
    category: "Marketing 360",
    description: "OMC top tier — paid media, social, reputation, and reporting enablement."
  }
];

export function getAssetsByProductCategory(category: ProductCategory): Asset[] {
  return sampleAssets.filter((asset) => asset.productCategory === category);
}

type HomeHighlightMetric = {
  viewCount?: number;
  downloadCount?: number;
  lastUpdated?: string;
};

type HomeHighlightsSeed = {
  mode: "seed" | "live";
  whatsNew?: string[];
  mostPopular?: string[];
  mostDownloaded?: string[];
  metrics?: Record<string, HomeHighlightMetric>;
};

const highlightsSeed = homeHighlightsSeed as HomeHighlightsSeed;

function applyEngagementSeed(assets: Asset[]): Asset[] {
  const metrics = highlightsSeed.metrics;
  if (!metrics) return assets;
  return assets.map((asset) => {
    const overlay = metrics[asset.id];
    if (!overlay) return asset;
    return {
      ...asset,
      viewCount: overlay.viewCount ?? asset.viewCount,
      downloadCount: overlay.downloadCount ?? asset.downloadCount,
      lastUpdated: overlay.lastUpdated ?? asset.lastUpdated,
    };
  });
}

/** Catalog from inventory JSON + optional home engagement seed overlays. */
export const sampleAssets: Asset[] = applyEngagementSeed(assetsData as Asset[]);

function assetsBySeedIds(ids: string[] | undefined, limit: number): Asset[] | null {
  if (highlightsSeed.mode !== "seed" || !ids?.length) return null;
  const found: Asset[] = [];
  for (const id of ids) {
    const asset = sampleAssets.find((a) => a.id === id || a.slug === id);
    if (asset) found.push(asset);
    if (found.length >= limit) break;
  }
  return found.length ? found : null;
}

export function getAssetBySlug(slug: string): Asset | undefined {
  return sampleAssets.find((asset) => asset.slug === slug);
}

export function getAssetById(id: string): Asset | undefined {
  return sampleAssets.find((asset) => asset.id === id);
}

export function getAssetsByJourney(journey: ProductJourney): Asset[] {
  return sampleAssets.filter((asset) => asset.journey === journey);
}

export function getAssetsByContentType(type: ContentType): Asset[] {
  return sampleAssets.filter((asset) => asset.contentType === type);
}

export function getAssetsByUseCase(useCase: UseCase): Asset[] {
  return sampleAssets.filter((asset) => asset.useCases.includes(useCase));
}

/** Filter assets by multiple criteria (drill-down). Empty arrays = no filter on that dimension. */
export function filterAssets(filters: {
  journeys?: ProductJourney[];
  productCategories?: ProductCategory[];
  contentTypes?: ContentType[];
  useCases?: UseCase[];
  languages?: AssetLanguage[];
  query?: string;
}): Asset[] {
  const {
    journeys = [],
    productCategories = [],
    contentTypes = [],
    useCases = [],
    languages = [],
    query = "",
  } = filters;

  const q = query.toLowerCase().trim();

  return sampleAssets.filter((asset) => {
    if (journeys.length && !journeys.includes(asset.journey)) return false;
    if (productCategories.length && !productCategories.includes(asset.productCategory))
      return false;
    if (contentTypes.length && !contentTypes.includes(asset.contentType)) return false;
    if (useCases.length && !asset.useCases.some((u) => useCases.includes(u))) return false;
    if (languages.length && !languages.includes(asset.language)) return false;
    if (q) {
      const haystack = [
        asset.title,
        getAssetSourceFileName(asset),
        asset.productCategory,
        asset.contentType,
        asset.summaryWhat,
        asset.summaryWhy,
        asset.summaryHow,
        asset.journey,
        asset.language,
        ...asset.useCases,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/** Full-text search across all asset fields. Returns ranked results (title matches first). */
export function searchAssets(query: string, limit = 20): Asset[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  type Scored = { asset: Asset; score: number };
  const scored: Scored[] = sampleAssets
    .map((asset) => {
      let score = 0;
      const title = asset.title.toLowerCase();
      const product = asset.productCategory.toLowerCase();

      if (title.includes(q)) score += 10;
      if (title.startsWith(q)) score += 5;
      if (getAssetSourceFileName(asset).toLowerCase().includes(q)) score += 6;
      if (product.includes(q)) score += 8;
      if (asset.contentType.toLowerCase().includes(q)) score += 4;
      if (asset.summaryWhat.toLowerCase().includes(q)) score += 2;
      if (asset.summaryWhy.toLowerCase().includes(q)) score += 1;
      if (asset.summaryHow.toLowerCase().includes(q)) score += 1;
      if (asset.journey.toLowerCase().includes(q)) score += 3;
      if (asset.useCases.some((u) => u.toLowerCase().includes(q))) score += 2;

      return { asset, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.asset);
}

/** Autocomplete suggestions for the search bar. Groups by product, asset, and type. */
export function getSearchSuggestions(query: string): {
  products: string[];
  assets: Asset[];
  contentTypes: ContentType[];
} {
  const q = query.toLowerCase().trim();
  if (!q) return { products: [], assets: [], contentTypes: [] };

  const products = [
    ...new Set(
      journeyProducts
        .filter((p) => p.label.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
        .map((p) => p.label)
    ),
  ];

  const assets = searchAssets(q, 5);

  const contentTypeValues: ContentType[] = [
    "Video", "Presentation", "Document", "Case Study", "Playbook", "Training", "Tool",
  ];
  const contentTypes = contentTypeValues.filter((ct) => ct.toLowerCase().includes(q));

  return { products, assets, contentTypes };
}

/** Latest assets by lastUpdated (newest first), for "What's New" / Featured. */
export function getLatestAssets(limit = 8): Asset[] {
  const seeded = assetsBySeedIds(highlightsSeed.whatsNew, limit);
  if (seeded) return seeded;
  return [...sampleAssets]
    .sort((a, b) => (b.lastUpdated > a.lastUpdated ? 1 : -1))
    .slice(0, limit);
}

export function getMostViewedAssets(limit = 8): Asset[] {
  const seeded = assetsBySeedIds(highlightsSeed.mostPopular, limit);
  if (seeded) return seeded;
  return [...sampleAssets]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export function getMostDownloadedAssets(limit = 8): Asset[] {
  const seeded = assetsBySeedIds(highlightsSeed.mostDownloaded, limit);
  if (seeded) return seeded;
  return [...sampleAssets]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, limit);
}

