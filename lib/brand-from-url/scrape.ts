import * as cheerio from "cheerio";
import type { BrandColors, CtaLinkType } from "@/lib/brand-profile";
import type { BrandImportResult } from "./types";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 1_500_000;
const MAX_IMAGE_BYTES = 400_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; HostopiaConnectsBrandBot/1.0; +https://hostopiaconnects-self.vercel.app)";

function absolutize(base: URL, href: string | undefined | null): string | null {
  if (!href) return null;
  const cleaned = href.trim();
  if (!cleaned || cleaned.startsWith("data:")) return cleaned.startsWith("data:") ? cleaned : null;
  try {
    return new URL(cleaned, base).href;
  } catch {
    return null;
  }
}

function hostnameLabel(hostname: string): string {
  const host = hostname.replace(/^www\./i, "");
  const base = host.split(".")[0] || host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function extractHexColors(text: string): string[] {
  const found = new Set<string>();
  const hexRe = /#([0-9a-fA-F]{6})\b/g;
  let m: RegExpExecArray | null;
  while ((m = hexRe.exec(text)) && found.size < 40) {
    const hex = `#${m[1].toUpperCase()}`;
    // Skip near-white / near-black noise
    const r = parseInt(m[1].slice(0, 2), 16);
    const g = parseInt(m[1].slice(2, 4), 16);
    const b = parseInt(m[1].slice(4, 6), 16);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (lum > 0.92 || lum < 0.08) continue;
    found.add(hex);
  }
  return [...found];
}

function scoreColor(hex: string): number {
  const h = hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return sat * 2 + (1 - Math.abs(0.45 - (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255));
}

function pickBrandColors(candidates: string[]): Partial<BrandColors> {
  const ranked = [...new Set(candidates)].sort(
    (a, b) => scoreColor(b) - scoreColor(a)
  );
  const out: Partial<BrandColors> = {};
  if (ranked[0]) out.primary = ranked[0];
  if (ranked[1]) out.secondary = ranked[1];
  if (ranked[2]) out.accent = ranked[2];
  return out;
}

function detectSocialType(href: string): CtaLinkType | null {
  const u = href.toLowerCase();
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "x";
  return null;
}

async function fetchText(
  url: string,
  maxBytes: number
): Promise<{ text: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) {
      throw new Error(`Could not fetch site (${res.status}).`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > maxBytes) {
      return {
        text: buf.subarray(0, maxBytes).toString("utf8"),
        finalUrl: res.url || url,
      };
    }
    return { text: buf.toString("utf8"), finalUrl: res.url || url };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchImageDataUrl(imageUrl: string): Promise<string | undefined> {
  if (imageUrl.startsWith("data:image/")) return imageUrl;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(imageUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
    });
    if (!res.ok) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length || buf.length > MAX_IMAGE_BYTES) return undefined;
    const contentType =
      res.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
    if (!contentType.startsWith("image/")) return undefined;
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

function collectLogoCandidates($: cheerio.CheerioAPI, base: URL): string[] {
  const urls: string[] = [];
  const push = (href: string | undefined | null) => {
    const abs = absolutize(base, href);
    if (abs && !urls.includes(abs)) urls.push(abs);
  };

  push($('meta[property="og:image"]').attr("content"));
  push($('meta[name="twitter:image"]').attr("content"));
  push($('meta[name="twitter:image:src"]').attr("content"));

  $('link[rel]').each((_, el) => {
    const rel = ($(el).attr("rel") || "").toLowerCase();
    if (
      rel.includes("icon") ||
      rel.includes("apple-touch-icon") ||
      rel.includes("shortcut")
    ) {
      push($(el).attr("href"));
    }
  });

  $("img").each((_, el) => {
    const alt = ($(el).attr("alt") || "").toLowerCase();
    const cls = ($(el).attr("class") || "").toLowerCase();
    const id = ($(el).attr("id") || "").toLowerCase();
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (
      alt.includes("logo") ||
      cls.includes("logo") ||
      id.includes("logo") ||
      (src || "").toLowerCase().includes("logo")
    ) {
      push(src);
    }
  });

  return urls;
}

async function sampleStylesheetColors(
  $: cheerio.CheerioAPI,
  base: URL
): Promise<string[]> {
  const colors: string[] = [];
  const href = $('link[rel="stylesheet"]').first().attr("href");
  const abs = absolutize(base, href);
  if (!abs) return colors;
  try {
    const { text } = await fetchText(abs, 200_000);
    colors.push(...extractHexColors(text));
  } catch {
    /* ignore stylesheet failures */
  }
  return colors;
}

/**
 * Best-effort scrape of company name, logo, colors, website, and social links.
 */
export async function scrapeBrandFromUrl(
  pageUrl: URL
): Promise<Omit<BrandImportResult, "meta">> {
  const { text: html, finalUrl } = await fetchText(pageUrl.href, MAX_HTML_BYTES);
  const base = new URL(finalUrl);
  const $ = cheerio.load(html);

  const ogSite = $('meta[property="og:site_name"]').attr("content")?.trim();
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const title = $("title").first().text().trim();
  const companyName =
    ogSite ||
    ogTitle?.split(/[|\-–—]/)[0]?.trim() ||
    title.split(/[|\-–—]/)[0]?.trim() ||
    hostnameLabel(base.hostname);

  const themeColor =
    $('meta[name="theme-color"]').attr("content")?.trim() ||
    $('meta[name="msapplication-TileColor"]').attr("content")?.trim();

  const inlineColors = extractHexColors(html);
  const sheetColors = await sampleStylesheetColors($, base);
  const colorPool = [
    ...(themeColor && /^#?[0-9a-fA-F]{6}$/.test(themeColor.replace("#", ""))
      ? [themeColor.startsWith("#") ? themeColor.toUpperCase() : `#${themeColor.toUpperCase()}`]
      : []),
    ...inlineColors,
    ...sheetColors,
  ];
  const colors = pickBrandColors(colorPool);

  const ctaLinks: Partial<Record<CtaLinkType, string>> = {
    website: base.origin,
  };

  $("a[href]").each((_, el) => {
    const href = absolutize(base, $(el).attr("href"));
    if (!href) return;
    const type = detectSocialType(href);
    if (type && !ctaLinks[type]) ctaLinks[type] = href;
  });

  let logoDataUrl: string | undefined;
  for (const candidate of collectLogoCandidates($, base)) {
    logoDataUrl = await fetchImageDataUrl(candidate);
    if (logoDataUrl) break;
  }

  return {
    companyName,
    logoDataUrl,
    colors,
    ctaLinks,
  };
}
