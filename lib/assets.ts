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
  | "Reputation Management";

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
  "Portuguese",
  "German",
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

export interface Asset {
  id: string;
  slug: string;
  title: string;
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
  }
];

export function getAssetsByProductCategory(category: ProductCategory): Asset[] {
  return sampleAssets.filter((asset) => asset.productCategory === category);
}


/** Catalog loaded from assets.data.json (generated by npm run assets:import from data/assets.csv). See ADDING-CONTENT.md and data/assets-template.csv. */
import assetsData from "./assets.data.json";
export const sampleAssets: Asset[] = assetsData as Asset[];

export function getAssetBySlug(slug: string): Asset | undefined {
  return sampleAssets.find((asset) => asset.slug === slug);
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
  return [...sampleAssets]
    .sort((a, b) => (b.lastUpdated > a.lastUpdated ? 1 : -1))
    .slice(0, limit);
}

export function getMostViewedAssets(limit = 8): Asset[] {
  return [...sampleAssets]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export function getMostDownloadedAssets(limit = 8): Asset[] {
  return [...sampleAssets]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, limit);
}

