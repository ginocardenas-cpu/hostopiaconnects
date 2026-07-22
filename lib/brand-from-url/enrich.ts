import type { BrandColors, CtaLinkType } from "@/lib/brand-profile";
import type { BrandImportResult } from "./types";

/**
 * Optional enrichment via Microlink (https://microlink.io) when
 * MICROLINK_API_KEY is set. Only fills missing fields from the scrape.
 */
export async function enrichBrandFromMicrolink(
  websiteUrl: string,
  partial: Omit<BrandImportResult, "meta">
): Promise<Omit<BrandImportResult, "meta">> {
  const apiKey = process.env.MICROLINK_API_KEY || process.env.BRAND_ENRICHMENT_API_KEY;
  if (!apiKey) return partial;

  const endpoint = new URL("https://api.microlink.io");
  endpoint.searchParams.set("url", websiteUrl);
  endpoint.searchParams.set("palette", "true");
  endpoint.searchParams.set("meta", "true");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(endpoint.href, {
      signal: controller.signal,
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
    });
    if (!res.ok) return partial;
    const json = (await res.json()) as {
      status?: string;
      data?: {
        title?: string;
        publisher?: string;
        logo?: { url?: string };
        image?: { url?: string };
        url?: string;
        palette?: string[];
      };
    };
    if (json.status !== "success" || !json.data) return partial;

    const data = json.data;
    const next: Omit<BrandImportResult, "meta"> = {
      companyName: partial.companyName,
      logoDataUrl: partial.logoDataUrl,
      colors: { ...(partial.colors ?? {}) },
      ctaLinks: { ...(partial.ctaLinks ?? {}) },
    };

    if (!next.companyName?.trim()) {
      next.companyName =
        data.publisher?.trim() ||
        data.title?.split(/[|\-–—]/)[0]?.trim() ||
        next.companyName;
    }

    if (!next.ctaLinks?.website && data.url) {
      next.ctaLinks = { ...next.ctaLinks, website: data.url };
    }

    if (!next.logoDataUrl) {
      const logoUrl = data.logo?.url || data.image?.url;
      if (logoUrl) {
        try {
          const imgRes = await fetch(logoUrl, {
            signal: AbortSignal.timeout(10_000),
            headers: { Accept: "image/*" },
          });
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.length > 0 && buf.length < 400_000) {
              const contentType =
                imgRes.headers.get("content-type")?.split(";")[0]?.trim() ||
                "image/png";
              if (contentType.startsWith("image/")) {
                next.logoDataUrl = `data:${contentType};base64,${buf.toString("base64")}`;
              }
            }
          }
        } catch {
          /* keep scrape logo */
        }
      }
    }

    const palette = (data.palette || []).filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
    const colors: Partial<BrandColors> = { ...(next.colors ?? {}) };
    if (!colors.primary && palette[0]) colors.primary = palette[0].toUpperCase();
    if (!colors.secondary && palette[1]) colors.secondary = palette[1].toUpperCase();
    if (!colors.accent && palette[2]) colors.accent = palette[2].toUpperCase();
    next.colors = colors;

    return next;
  } catch {
    return partial;
  } finally {
    clearTimeout(timer);
  }
}

/** Merge enrichment into scrape without overwriting strong scrape hits. */
export function mergeEnrichment(
  scrape: Omit<BrandImportResult, "meta">,
  enriched: Omit<BrandImportResult, "meta">
): Omit<BrandImportResult, "meta"> {
  const colors: Partial<BrandColors> = { ...(scrape.colors ?? {}) };
  for (const key of ["primary", "secondary", "accent"] as const) {
    if (!colors[key] && enriched.colors?.[key]) colors[key] = enriched.colors[key];
  }

  const ctaLinks: Partial<Record<CtaLinkType, string>> = {
    ...(enriched.ctaLinks ?? {}),
    ...(scrape.ctaLinks ?? {}),
  };

  return {
    companyName: scrape.companyName?.trim() || enriched.companyName,
    logoDataUrl: scrape.logoDataUrl || enriched.logoDataUrl,
    colors,
    ctaLinks,
  };
}
