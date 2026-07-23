import * as cheerio from "cheerio";
import type { BrandColors, CtaLinkType } from "@/lib/brand-profile";
import type { BrandImportResult } from "./types";

const FETCH_TIMEOUT_MS = 12_000;
const PROXY_FETCH_TIMEOUT_MS = 20_000;
const MAX_HTML_BYTES = 2_000_000;
const MAX_IMAGE_BYTES = 400_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** Statuses that usually mean bot / WAF blocking (common on Vercel datacenter IPs). */
const BLOCKED_FETCH_STATUSES = new Set([401, 403, 429, 503]);

/** Partner / promo marks that appear on telecom homepages but are not the site brand. */
const PARTNER_LOGO_RE =
  /\b(netflix|hbo|max\b|disney|prime\s*video|amazon|spotify|youtube|apple\s*tv|paramount|peacock|f1\b|formula\s*1|espn|mlb|nba|nfl|claro\s*video|movistar)\b/i;

const BOT_WALL_RE =
  /radware\s+bot\s+manager|bot\s+manager\s+captcha|cf-challenge|just\s+a\s+moment|attention\s+required|access\s+denied|verify\s+you\s+are\s+human|captcha/i;

const BROWSER_HTML_HEADERS: Record<string, string> = {
  "User-Agent": USER_AGENT,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-CA,en;q=0.9",
  "Cache-Control": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/** Framework / OS chrome colors that are almost never the brand. */
const FRAMEWORK_COLORS = new Set(
  [
    "#007AFF",
    "#007BFF",
    "#0D6EFD",
    "#6610F2",
    "#6F42C1",
    "#D63384",
    "#DC3545",
    "#FD7E14",
    "#FFC107",
    "#198754",
    "#20C997",
    "#0DCAF0",
    "#212529",
    "#343A40",
    "#6C757D",
    "#ADB5BD",
    "#CED4DA",
    "#DEE2E6",
    "#E9ECEF",
    "#F8F9FA",
    "#FFFFFF",
    "#000000",
    "#0090AD", // Hostopia teal — never treat as scraped brand
    "#1D8F93",
    "#2CADB2",
  ].map((c) => c.toUpperCase())
);

function absolutize(base: URL, href: string | undefined | null): string | null {
  if (!href) return null;
  const cleaned = href.trim();
  if (!cleaned) return null;
  if (cleaned.startsWith("data:image/")) return cleaned;
  if (cleaned.startsWith("data:")) return null;
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

function normalizeHex(raw: string): string | null {
  let h = raw.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return `#${h.toUpperCase()}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}

function parseRgb(value: string): string | null {
  const m = value.match(
    /rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/i
  );
  if (!m) return null;
  return rgbToHex(Number(m[1]), Number(m[2]), Number(m[3]));
}

function luminance(hex: string): number {
  const h = hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function saturation(hex: string): number {
  const h = hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

interface ColorHit {
  hex: string;
  weight: number;
}

function extractColorHits(text: string): ColorHit[] {
  const hits: ColorHit[] = [];

  const push = (hex: string | null, weight: number) => {
    if (!hex || FRAMEWORK_COLORS.has(hex)) return;
    hits.push({ hex, weight });
  };

  // Brand-ish CSS custom properties / class names near a color
  const brandedProp =
    /(?:--[\w-]*(?:brand|primary|accent|secondary|red|main|corporate|theme)[\w-]*\s*:\s*|(?:color|background(?:-color)?)\s*:\s*|ds-color-[\w-]+\s*\{[^}]*color:\s*)(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/gi;
  let m: RegExpExecArray | null;
  while ((m = brandedProp.exec(text))) {
    const raw = m[1];
    push(raw.startsWith("#") ? normalizeHex(raw) : parseRgb(raw), 8);
  }

  // Named color tokens like .ds-color-red{color:#da291c}
  const named =
    /\.[\w-]*(?:color|bg|background)[\w-]*(?:red|primary|brand|accent)[\w-]*\s*\{[^}]{0,120}?(#[0-9a-fA-F]{6}|rgba?\([^)]+\))/gi;
  while ((m = named.exec(text))) {
    const raw = m[1];
    push(raw.startsWith("#") ? normalizeHex(raw) : parseRgb(raw), 12);
  }

  // General hex / rgb frequency (lower weight)
  const hexRe = /#([0-9a-fA-F]{6})\b/g;
  while ((m = hexRe.exec(text))) {
    push(normalizeHex(m[0]), 1);
  }
  const rgbRe = /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}[^)]*\)/gi;
  while ((m = rgbRe.exec(text))) {
    push(parseRgb(m[0]), 1);
  }

  return hits;
}

function aggregateColors(hits: ColorHit[]): Map<string, number> {
  const scores = new Map<string, number>();
  for (const { hex, weight } of hits) {
    const lum = luminance(hex);
    const sat = saturation(hex);
    // Soft-penalize near white/black for *primary* ranking, but keep them available
    let w = weight;
    if (lum > 0.92 || lum < 0.08) w *= 0.15;
    else w *= 1 + sat * 2;
    scores.set(hex, (scores.get(hex) || 0) + w);
  }
  return scores;
}

function hueDistance(a: string, b: string): number {
  const toHue = (hex: string) => {
    const h = hex.slice(1);
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const bl = parseInt(h.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, bl);
    const min = Math.min(r, g, bl);
    if (max === min) return 0;
    const d = max - min;
    let hue = 0;
    if (max === r) hue = ((g - bl) / d) % 6;
    else if (max === g) hue = (bl - r) / d + 2;
    else hue = (r - g) / d + 4;
    return (hue * 60 + 360) % 360;
  };
  const diff = Math.abs(toHue(a) - toHue(b));
  return Math.min(diff, 360 - diff);
}

function pickBrandColors(hits: ColorHit[]): Partial<BrandColors> {
  const scores = aggregateColors(hits);
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);

  const vivid = ranked.filter(([hex]) => {
    const lum = luminance(hex);
    const sat = saturation(hex);
    return sat >= 0.28 && lum > 0.12 && lum < 0.85;
  });

  const neutralsDark = ranked
    .filter(([hex]) => luminance(hex) < 0.2 && saturation(hex) < 0.25)
    .sort((a, b) => luminance(a[0]) - luminance(b[0]));
  const neutralsLight = ranked
    .filter(([hex]) => luminance(hex) > 0.9 && saturation(hex) < 0.2)
    .sort((a, b) => luminance(b[0]) - luminance(a[0]));

  const out: Partial<BrandColors> = {};
  if (vivid[0]) out.primary = vivid[0][0];

  // Secondary: dark companion (black/charcoal) when present — common for telecom brands
  if (neutralsDark[0]) out.secondary = neutralsDark[0][0];
  else if (vivid[1]) out.secondary = vivid[1][0];

  // Accent: prefer another vivid near the primary hue; else light paper/white
  if (out.primary) {
    const related = vivid
      .filter(([hex]) => hex !== out.primary && hex !== out.secondary)
      .filter(([hex]) => hueDistance(hex, out.primary!) < 28)
      .sort((a, b) => b[1] - a[1]);
    if (related[0]) out.accent = related[0][0];
  }
  if (!out.accent) {
    const otherVivid = vivid.find(
      ([hex]) => hex !== out.primary && hex !== out.secondary
    );
    // Only take unrelated vivid if it's strongly present
    if (otherVivid && otherVivid[1] >= (vivid[0]?.[1] ?? 0) * 0.45) {
      out.accent = otherVivid[0];
    } else if (neutralsLight[0]) {
      out.accent = neutralsLight[0][0];
    } else if (out.primary) {
      // Derive a lighter tint of primary as accent fallback
      out.accent = out.primary;
    }
  }

  // Slide = light paper; text = dark ink when available
  if (neutralsLight[0]) out.slide = neutralsLight[0][0];
  else out.slide = "#FFFFFF";
  if (neutralsDark[0]) out.text = neutralsDark[0][0];
  else out.text = "#1A1A1A";

  // Ensure true white/black preference when brand is clearly vivid + dark
  // (many sites don't emit #FFFFFF in CSS — inject paper/ink defaults).
  if (out.primary && out.secondary && luminance(out.secondary) < 0.2) {
    out.slide = "#FFFFFF";
    out.text = out.secondary;
    if (out.accent && hueDistance(out.accent, out.primary) > 28) {
      // Unrelated accent (e.g. teal/gold leftover from page CSS) → near-white
      out.accent = "#F5F5F5";
    }
  }

  return out;
}

function detectSocialType(href: string): CtaLinkType | null {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "facebook.com" || host === "fb.com" || host.endsWith(".facebook.com"))
      return "facebook";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
    if (host === "twitter.com" || host === "x.com" || host.endsWith(".twitter.com"))
      return "x";
  } catch {
    const u = href.toLowerCase();
    if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
    if (u.includes("instagram.com")) return "instagram";
    if (u.includes("linkedin.com")) return "linkedin";
    if (u.includes("twitter.com") || u.includes("x.com/")) return "x";
  }
  return null;
}

function isJunkSocialUrl(href: string): boolean {
  const u = href.toLowerCase();
  return (
    u.includes("sharer") ||
    u.includes("share?") ||
    u.includes("intent/") ||
    u.includes("/share/") ||
    u.includes("googleapis") ||
    u.includes("wikidata") ||
    u.includes("wikipedia") ||
    u.includes("google.com/search")
  );
}

function isBotWallHtml(html: string): boolean {
  if (!html || html.length < 80) return true;
  const title = html.match(/<title[^>]*>([^<]*)/i)?.[1] || "";
  if (BOT_WALL_RE.test(title)) return true;
  // Short challenge pages often lack real site chrome.
  if (html.length < 40_000 && BOT_WALL_RE.test(html.slice(0, 8_000))) return true;
  return false;
}

function truncateToUtf8(buf: Buffer, maxBytes: number): string {
  if (buf.length <= maxBytes) return buf.toString("utf8");
  return buf.subarray(0, maxBytes).toString("utf8");
}

async function fetchTextDirect(
  url: string,
  maxBytes: number
): Promise<{ text: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: BROWSER_HTML_HEADERS,
    });
    if (!res.ok) {
      throw new Error(`Could not fetch site (${res.status}).`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return { text: truncateToUtf8(buf, maxBytes), finalUrl: res.url || url };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Reader proxy for sites that block datacenter IPs (Akamai/Cloudflare WAF).
 * Returns the page HTML when direct fetch is forbidden.
 */
async function fetchTextViaReaderProxy(
  url: string,
  maxBytes: number
): Promise<{ text: string; finalUrl: string }> {
  const proxyUrl = `https://r.jina.ai/${url}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(proxyUrl, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html",
        "X-Return-Format": "html",
        "User-Agent": USER_AGENT,
      },
    });
    if (!res.ok) {
      throw new Error(`Could not fetch site via proxy (${res.status}).`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const text = truncateToUtf8(buf, maxBytes);
    if (text.length < 200 || !/<html|og:|title/i.test(text)) {
      throw new Error("Proxy returned empty or non-HTML content.");
    }
    return { text, finalUrl: url };
  } finally {
    clearTimeout(timer);
  }
}

function isBlockedFetchError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  if (/Could not fetch site \((\d+)\)/.test(message)) {
    const status = Number(message.match(/\((\d+)\)/)?.[1]);
    return BLOCKED_FETCH_STATUSES.has(status);
  }
  return /aborted|timeout|fetch failed|network/i.test(message);
}

async function fetchText(
  url: string,
  maxBytes: number
): Promise<{ text: string; finalUrl: string }> {
  try {
    const direct = await fetchTextDirect(url, maxBytes);
    if (!isBotWallHtml(direct.text)) return direct;
    // 200 OK with a captcha/challenge body — common for Telmex/Radware.
  } catch (err) {
    if (!isBlockedFetchError(err)) throw err;
    try {
      return await fetchTextViaReaderProxy(url, maxBytes);
    } catch {
      const statusMatch =
        err instanceof Error
          ? err.message.match(/Could not fetch site \((\d+)\)/)
          : null;
      if (statusMatch && BLOCKED_FETCH_STATUSES.has(Number(statusMatch[1]))) {
        throw new Error(
          `This website blocks automated requests (${statusMatch[1]}). Try another URL, or enter branding manually.`
        );
      }
      throw err;
    }
  }

  try {
    const proxied = await fetchTextViaReaderProxy(url, maxBytes);
    if (isBotWallHtml(proxied.text)) {
      throw new Error(
        "This website showed a bot-protection page. Try another URL, or enter branding manually."
      );
    }
    return proxied;
  } catch (err) {
    if (err instanceof Error && /bot-protection/i.test(err.message)) throw err;
    throw new Error(
      "This website showed a bot-protection page. Try another URL, or enter branding manually."
    );
  }
}

async function readImageResponse(
  res: Response
): Promise<string | undefined> {
  if (!res.ok) return undefined;
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length || buf.length > MAX_IMAGE_BYTES) return undefined;
  const contentType =
    res.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
  if (!contentType.startsWith("image/")) return undefined;
  return `data:${contentType};base64,${buf.toString("base64")}`;
}

async function fetchImageDataUrl(imageUrl: string): Promise<string | undefined> {
  if (imageUrl.startsWith("data:image/")) return imageUrl;

  const tryOnce = async (url: string): Promise<string | undefined> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
      });
      return await readImageResponse(res);
    } catch {
      return undefined;
    } finally {
      clearTimeout(timer);
    }
  };

  const direct = await tryOnce(imageUrl);
  if (direct) return direct;

  // Some CDNs also block datacenter IPs — retry through a public image proxy.
  try {
    const stripped = imageUrl.replace(/^https?:\/\//i, "");
    const proxied = `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}&n=-1`;
    return await tryOnce(proxied);
  } catch {
    return undefined;
  }
}

function isJunkCompanyName(name: string): boolean {
  return BOT_WALL_RE.test(name) || /cloudflare|akamai|incapsula|access denied/i.test(name);
}

function logoCandidateScore(
  url: string,
  meta: { alt?: string; cls?: string; id?: string; source: string },
  brandStem: string
): number {
  const hay = `${url} ${meta.alt || ""} ${meta.cls || ""} ${meta.id || ""}`.toLowerCase();
  if (PARTNER_LOGO_RE.test(hay) || /prom[_-]?logo/i.test(hay)) return -1000;
  if (meta.source === "clearbit" || meta.source === "favicon") return 5;
  let score = 0;
  if (meta.source === "jsonld") score += 50;
  if (meta.source === "apple-icon") score += 40;
  if (meta.source === "icon") score += 28;
  if (meta.source === "img-brand") score += 45;
  if (meta.source === "img-logo") score += 20;
  if (meta.source === "og") score += 8; // often campaign art
  if (brandStem && hay.includes(brandStem)) score += 60;
  if (/\.svg(\?|$)/i.test(url)) score += 12;
  if (/apple-touch|favicon|icon/i.test(hay)) score += 15;
  if (/banner|hero|promo|campaign|selector/i.test(hay)) score -= 25;
  return score;
}

function collectLogoCandidates($: cheerio.CheerioAPI, base: URL): string[] {
  type Cand = { url: string; score: number };
  const scored: Cand[] = [];
  const seen = new Set<string>();
  const brandStem = base.hostname.replace(/^www\./i, "").split(".")[0]?.toLowerCase() || "";

  const push = (
    href: string | undefined | null,
    meta: { alt?: string; cls?: string; id?: string; source: string }
  ) => {
    const abs = absolutize(base, href);
    if (!abs || seen.has(abs)) return;
    const score = logoCandidateScore(abs, meta, brandStem);
    if (score < 0) return;
    seen.add(abs);
    scored.push({ url: abs, score });
  };

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        if (node?.logo) {
          if (typeof node.logo === "string")
            push(node.logo, { source: "jsonld" });
          else if (node.logo?.url) push(node.logo.url, { source: "jsonld" });
        }
      }
    } catch {
      /* ignore bad json */
    }
  });

  $('link[rel]').each((_, el) => {
    const rel = ($(el).attr("rel") || "").toLowerCase();
    if (rel.includes("apple-touch-icon")) {
      push($(el).attr("href"), { source: "apple-icon" });
    } else if (
      rel.includes("icon") ||
      rel.includes("shortcut")
    ) {
      push($(el).attr("href"), { source: "icon" });
    }
  });

  $("img").each((_, el) => {
    const alt = ($(el).attr("alt") || "").toLowerCase();
    const cls = ($(el).attr("class") || "").toLowerCase();
    const id = ($(el).attr("id") || "").toLowerCase();
    const src = $(el).attr("src") || $(el).attr("data-src");
    const brandHit =
      Boolean(brandStem) &&
      (alt.includes(brandStem) ||
        cls.includes(brandStem) ||
        id.includes(brandStem) ||
        (src || "").toLowerCase().includes(brandStem));
    const logoHit =
      alt.includes("logo") ||
      cls.includes("logo") ||
      id.includes("logo") ||
      (src || "").toLowerCase().includes("logo");
    if (brandHit) {
      push(src, { alt, cls, id, source: "img-brand" });
    } else if (logoHit) {
      push(src, { alt, cls, id, source: "img-logo" });
    }
  });

  // og/twitter images last — often partner campaign art (Netflix / F1 / HBO).
  push($('meta[property="og:image"]').attr("content"), { source: "og" });
  push($('meta[name="twitter:image"]').attr("content"), { source: "og" });
  push($('meta[name="twitter:image:src"]').attr("content"), { source: "og" });

  const domain = base.hostname.replace(/^www\./i, "");
  push(`https://logo.clearbit.com/${domain}`, { source: "clearbit" });
  push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`, {
    source: "favicon",
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((c) => c.url);
}

async function sampleStylesheetColors(
  $: cheerio.CheerioAPI,
  base: URL
): Promise<ColorHit[]> {
  const hits: ColorHit[] = [];
  const hrefs: string[] = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) hrefs.push(href);
  });

  for (const href of hrefs.slice(0, 4)) {
    const abs = absolutize(base, href);
    if (!abs) continue;
    try {
      // Direct only — do not proxy CSS through the HTML reader.
      const { text } = await fetchTextDirect(abs, 400_000);
      hits.push(...extractColorHits(text));
    } catch {
      /* ignore */
    }
  }
  return hits;
}

function extractSocialsFromHtml(
  html: string,
  $: cheerio.CheerioAPI,
  base: URL
): Partial<Record<CtaLinkType, string>> {
  const found: Partial<Record<CtaLinkType, string>> = {};

  const consider = (hrefRaw: string | undefined | null) => {
    const href = absolutize(base, hrefRaw) || hrefRaw?.trim();
    if (!href || isJunkSocialUrl(href)) return;
    const type = detectSocialType(href);
    if (type && !found[type]) found[type] = href;
  };

  // 1) JSON-LD sameAs (Rogers etc.)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      const nodes = Array.isArray(data) ? data : [data, data?.["@graph"]].flat();
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const sameAs = (node as { sameAs?: unknown }).sameAs;
        const list = Array.isArray(sameAs)
          ? sameAs
          : typeof sameAs === "string"
            ? [sameAs]
            : [];
        for (const item of list) {
          if (typeof item === "string") consider(item);
        }
      }
    } catch {
      /* ignore */
    }
  });

  // 2) Anchors
  $("a[href]").each((_, el) => consider($(el).attr("href")));

  // 3) Raw URL scan (footer often inlined as strings in JS bundles)
  const socialRe =
    /https?:\/\/(?:www\.)?(?:facebook\.com|fb\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com)\/[^\s"'<>\\]+/gi;
  for (const m of html.matchAll(socialRe)) {
    consider(m[0].replace(/[.,);]+$/, ""));
  }

  return found;
}

function extractCompanyName(
  $: cheerio.CheerioAPI,
  base: URL
): string {
  let jsonLdName = "";
  $('script[type="application/ld+json"]').each((_, el) => {
    if (jsonLdName) return;
    try {
      const data = JSON.parse($(el).text());
      const nodes = Array.isArray(data) ? data : [data, data?.["@graph"]].flat();
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const n = node as { "@type"?: string; name?: string };
        const type = String(n["@type"] || "");
        if (
          /Organization|Corporation|Brand/i.test(type) &&
          typeof n.name === "string" &&
          n.name.trim()
        ) {
          jsonLdName = n.name.trim();
          // Prefer short brand form: "Rogers Communications Inc" → still ok; hostname may be cleaner
          break;
        }
      }
    } catch {
      /* ignore */
    }
  });

  const appName = $('meta[name="application-name"]').attr("content")?.trim();
  const ogSite = $('meta[property="og:site_name"]').attr("content")?.trim();
  const host = hostnameLabel(base.hostname);

  // Prefer concise brand labels over marketing titles / captcha walls
  if (ogSite && ogSite.length <= 40 && !isJunkCompanyName(ogSite)) return ogSite;
  if (appName && appName.length <= 40 && !isJunkCompanyName(appName)) return appName;
  if (jsonLdName && !isJunkCompanyName(jsonLdName)) {
    // "Rogers Communications Inc" → "Rogers" if hostname matches
    if (jsonLdName.toLowerCase().includes(host.toLowerCase())) return host;
    const short = jsonLdName.split(/[|,–—-]/)[0]?.trim();
    if (short && short.length <= 32 && !isJunkCompanyName(short)) return short;
    return jsonLdName.length <= 48 ? jsonLdName : host;
  }

  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const title = $("title").first().text().trim();
  if (isJunkCompanyName(ogTitle || "") || isJunkCompanyName(title || "")) {
    return host;
  }
  const fromTitle = (ogTitle || title).split(/[|\-–—]/)[0]?.trim() || "";
  // Marketing titles often have commas / multiple products
  if (
    fromTitle &&
    fromTitle.length <= 28 &&
    !fromTitle.includes(",") &&
    !isJunkCompanyName(fromTitle)
  ) {
    return fromTitle;
  }
  // "… - Hogar - Telmex" → prefer last segment when it matches host
  const segments = (ogTitle || title)
    .split(/[|\-–—]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const last = segments[segments.length - 1];
  if (
    last &&
    last.length <= 24 &&
    last.toLowerCase().includes(host.toLowerCase().slice(0, 4))
  ) {
    return host;
  }
  return host;
}

function extractThemeColor($: cheerio.CheerioAPI): string | null {
  const candidates = [
    $('meta[name="theme-color"]').attr("content"),
    $('meta[name="msapplication-TileColor"]').attr("content"),
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    // Avoid matching into adjacent minified CSS (rogers bug: theme-color: #007aff}:host)
    const hex = raw.match(/#([0-9a-fA-F]{3,8})\b/)?.[0] || raw.trim();
    const normalized = normalizeHex(hex);
    if (normalized && !FRAMEWORK_COLORS.has(normalized)) return normalized;
  }
  return null;
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

  const companyName = extractCompanyName($, base);

  const themeColor = extractThemeColor($);
  const inlineHits = extractColorHits(html);
  const sheetHits = await sampleStylesheetColors($, base);
  const colorHits: ColorHit[] = [
    ...(themeColor ? [{ hex: themeColor, weight: 6 }] : []),
    ...inlineHits,
    ...sheetHits,
  ];
  const colors = pickBrandColors(colorHits);

  const socials = extractSocialsFromHtml(html, $, base);
  const ctaLinks: Partial<Record<CtaLinkType, string>> = {
    website: base.origin,
    ...socials,
  };

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
