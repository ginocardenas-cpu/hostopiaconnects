import type { BrandColors, BrandCtaLink, BrandProfile, CtaLinkType } from "@/lib/brand-profile";
import { DEFAULT_CTA_LINKS } from "@/lib/brand-profile";

export type BrandImportSource = "scrape" | "hybrid";

export interface BrandImportMeta {
  source: BrandImportSource;
  websiteUrl: string;
  found: string[];
  missing: string[];
}

/** Partial profile fields returned by /api/brand-from-url. */
export interface BrandImportResult {
  companyName?: string;
  logoDataUrl?: string;
  colors?: Partial<BrandColors>;
  ctaLinks?: Partial<Record<CtaLinkType, string>>;
  meta: BrandImportMeta;
}

export interface BrandFromUrlErrorBody {
  error: string;
  code?: string;
}

const PRIVATE_HOST_RE =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|0\.0\.0\.0|::1|\[::1\])/i;

/** Normalize user input into an absolute http(s) URL; throws on invalid/private. */
export function normalizeWebsiteUrl(input: string): URL {
  let raw = input.trim();
  if (!raw) throw new Error("Enter a website address.");
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That does not look like a valid website address.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https websites are supported.");
  }
  if (PRIVATE_HOST_RE.test(url.hostname) || url.hostname.endsWith(".local")) {
    throw new Error("That address cannot be scraped.");
  }
  return url;
}

export function isBrandImportThin(result: Omit<BrandImportResult, "meta">): boolean {
  const socialCount = result.ctaLinks
    ? Object.entries(result.ctaLinks).filter(
        ([k, v]) => k !== "website" && k !== "email" && k !== "phone" && Boolean(v?.trim())
      ).length
    : 0;
  const colorCount = result.colors
    ? ["primary", "secondary", "accent"].filter(
        (k) => Boolean(result.colors?.[k as keyof BrandColors]?.trim())
      ).length
    : 0;
  return !result.logoDataUrl || colorCount < 2 || socialCount < 1;
}

export function buildImportMeta(
  result: Omit<BrandImportResult, "meta">,
  source: BrandImportSource,
  websiteUrl: string
): BrandImportMeta {
  const found: string[] = [];
  const missing: string[] = [];
  const check = (label: string, ok: boolean) => {
    if (ok) found.push(label);
    else missing.push(label);
  };
  check("companyName", Boolean(result.companyName?.trim()));
  check("logo", Boolean(result.logoDataUrl));
  check(
    "colors",
    Boolean(
      result.colors &&
        ["primary", "secondary", "accent"].some(
          (k) => result.colors?.[k as keyof BrandColors]?.trim()
        )
    )
  );
  check("website", Boolean(result.ctaLinks?.website?.trim()));
  check(
    "socials",
    Boolean(
      result.ctaLinks &&
        ["linkedin", "facebook", "instagram", "x"].some(
          (k) => result.ctaLinks?.[k as CtaLinkType]?.trim()
        )
    )
  );
  return { source, websiteUrl, found, missing };
}

/** Merge an import result into an existing brand profile (does not touch content fields). */
export function applyBrandImportToProfile(
  profile: BrandProfile,
  imported: BrandImportResult
): BrandProfile {
  const colors: BrandColors = {
    ...profile.colors,
    ...(imported.colors ?? {}),
  };

  const byType = new Map(
    profile.cta.links.map((l) => [l.type, { ...l }] as const)
  );
  for (const template of DEFAULT_CTA_LINKS) {
    if (!byType.has(template.type)) {
      byType.set(template.type, { ...template });
    }
  }

  if (imported.ctaLinks) {
    (Object.entries(imported.ctaLinks) as [CtaLinkType, string][]).forEach(
      ([type, value]) => {
        const v = value?.trim();
        if (!v) return;
        const existing = byType.get(type) ?? {
          type,
          value: "",
          enabled: false,
        };
        byType.set(type, { ...existing, value: v, enabled: true });
      }
    );
  }

  const links: BrandCtaLink[] = DEFAULT_CTA_LINKS.map(
    (t) => byType.get(t.type) ?? { ...t }
  );
  const anyEnabled = links.some((l) => l.enabled && l.value.trim());

  return {
    ...profile,
    companyName: imported.companyName?.trim() || profile.companyName,
    logoDataUrl: imported.logoDataUrl || profile.logoDataUrl,
    colors,
    cta: {
      enabled: profile.cta.enabled || anyEnabled,
      links,
    },
    updatedAt: new Date().toISOString(),
  };
}

export const BRAND_DIRECTION_STORAGE_KEY = "hostopia-connects-brand-direction";
export type BrandStudioDirection = "diy" | "scrape";
