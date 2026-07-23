/**
 * Homepage “Featured Asset” carousel — curated separately from What’s New / Popular / Downloaded.
 * Attach real Connects asset slugs in `href` when files are catalogued (e.g. `/assets/your-slug`).
 */
export interface FeaturedHomeAsset {
  id: string;
  title: string;
  description: string;
  /** Category label under the type chip (e.g. product family). */
  categoryLabel: string;
  /** Content type label (Document, Report, Study, …). */
  contentTypeLabel: string;
  imageSrc: string;
  imageAlt: string;
  /**
   * Detail or download path. Leave empty until the file is in the catalog;
   * UI falls back to Library.
   */
  href?: string;
}

export const FEATURED_HOME_ASSETS: FeaturedHomeAsset[] = [
  {
    id: "product-guide-2026",
    title: "2026 Hostopia Product Guide",
    description:
      "A complete guide to Hostopia's digital solutions, mapping products to every stage of the SMB lifecycle—from building a brand and getting online to attracting customers and accelerating growth.",
    categoryLabel: "Hostopia",
    contentTypeLabel: "Product Guide",
    imageSrc: "/product-guide-2026.png",
    imageAlt: "2026 Hostopia Product Guide cover",
    href: "",
  },
  {
    id: "world-cup-smb-readiness",
    title: "World Cup SMB Digital Readiness Report",
    description:
      "Insights into how SMBs performed during the World Cup, what separated successful businesses from the rest, and how to prepare for the next major global event.",
    categoryLabel: "Research",
    contentTypeLabel: "Report",
    imageSrc: "/featured-world-cup-smb.png",
    imageAlt: "World Cup SMB Digital Readiness Report cover",
    href: "",
  },
  {
    id: "smb-digital-trends-ai",
    title: "SMB Digital Trends & AI Study",
    description:
      "Research into SMB attitudes toward AI, top business challenges, digital priorities, buying preferences, and demand for self-service versus managed solutions.",
    categoryLabel: "Research",
    contentTypeLabel: "Study",
    imageSrc: "/featured-smb-ai-trends.png",
    imageAlt: "SMB Digital Trends & AI Study cover",
    href: "",
  },
];
