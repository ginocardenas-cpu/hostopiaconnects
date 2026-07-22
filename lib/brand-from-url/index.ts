import {
  buildImportMeta,
  isBrandImportThin,
  normalizeWebsiteUrl,
  type BrandImportResult,
} from "./types";
import { scrapeBrandFromUrl } from "./scrape";
import { enrichBrandFromMicrolink, mergeEnrichment } from "./enrich";

export {
  applyBrandImportToProfile,
  buildImportMeta,
  isBrandImportThin,
  normalizeWebsiteUrl,
  BRAND_DIRECTION_STORAGE_KEY,
  type BrandImportResult,
  type BrandImportMeta,
  type BrandStudioDirection,
  type BrandFromUrlErrorBody,
} from "./types";

/**
 * Hybrid brand import: scrape first; enrich via Microlink when thin and keyed.
 */
export async function importBrandFromUrl(rawUrl: string): Promise<BrandImportResult> {
  const url = normalizeWebsiteUrl(rawUrl);
  let scraped: Omit<BrandImportResult, "meta">;
  try {
    scraped = await scrapeBrandFromUrl(url);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not scrape that website.";
    // If scrape fails entirely, still try enrichment when configured.
    const hasKey = Boolean(
      process.env.MICROLINK_API_KEY || process.env.BRAND_ENRICHMENT_API_KEY
    );
    if (!hasKey) throw new Error(message);
    scraped = { ctaLinks: { website: url.origin } };
    const enriched = await enrichBrandFromMicrolink(url.href, scraped);
    const merged = mergeEnrichment(scraped, enriched);
    if (!merged.companyName && !merged.logoDataUrl && !merged.colors?.primary) {
      throw new Error(message);
    }
    return {
      ...merged,
      meta: buildImportMeta(merged, "hybrid", url.href),
    };
  }

  let source: BrandImportResult["meta"]["source"] = "scrape";
  let result = scraped;

  if (isBrandImportThin(scraped)) {
    const enriched = await enrichBrandFromMicrolink(url.href, scraped);
    const merged = mergeEnrichment(scraped, enriched);
    if (
      merged.logoDataUrl !== scraped.logoDataUrl ||
      merged.companyName !== scraped.companyName ||
      JSON.stringify(merged.colors) !== JSON.stringify(scraped.colors) ||
      JSON.stringify(merged.ctaLinks) !== JSON.stringify(scraped.ctaLinks)
    ) {
      source = "hybrid";
      result = merged;
    }
  }

  return {
    ...result,
    meta: buildImportMeta(result, source, url.href),
  };
}
