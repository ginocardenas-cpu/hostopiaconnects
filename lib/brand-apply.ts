import type { BrandCtaLink, BrandProfile } from "./brand-profile";
import { buildContactHtml } from "./brand-profile";

const CTA_LABELS: Record<BrandCtaLink["type"], string> = {
  website: "Website",
  email: "Email",
  phone: "Phone",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
};

/** Token replaced with the logo data URL at apply time (keeps pin script small). */
const LOGO_TOKEN = "__PORTAL_LOGO_SRC__";

function normalizeWebsite(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

function ctaHref(link: BrandCtaLink): string {
  const v = link.value.trim();
  if (!v) return "";
  switch (link.type) {
    case "website":
      return normalizeWebsite(v);
    case "email":
      return v.startsWith("mailto:") ? v : `mailto:${v}`;
    case "phone":
      return v.startsWith("tel:") ? v : `tel:${v.replace(/\s/g, "")}`;
    case "linkedin":
    case "facebook":
    case "instagram":
    case "x":
      return normalizeWebsite(v);
    default:
      return v;
  }
}

function ctaDisplay(link: BrandCtaLink): string {
  const v = link.value.trim();
  if (!v) return "";
  if (link.type === "email") return v.replace(/^mailto:/i, "");
  if (link.type === "phone") return v.replace(/^tel:/i, "");
  return v.replace(/^https?:\/\//i, "");
}

export interface BrandApplyOptions {
  /** Downloads: chrome shows only the uploaded logo (no company name text). */
  exportMode?: boolean;
}

/** CSS variable overrides shared by preview iframe and export pipeline. */
export function buildBrandStyleCss(
  profile: BrandProfile,
  options: BrandApplyOptions = {}
): string {
  const { colors, fontFamily, logoDataUrl } = profile;
  const logoRule = logoDataUrl
    ? `
.brandmark .glyph::after {
  display: none !important;
}
[data-portal-chrome-logo="1"] {
  display: flex !important;
  align-items: center;
  flex-shrink: 0;
  justify-self: start;
}
[data-portal-chrome-logo="1"] img {
  max-height: 42px;
  width: auto;
  object-fit: contain;
}
/* Middle pages only: logo lives in the bottom-left footer, never the top chrome. */
.chrome-top .brandmark,
.pchrome-top .brandmark,
.page-chrome-top .brandmark {
  display: none !important;
}
/* First + last pages: no chrome logos — only the large centered logo in content. */
section.slide:first-of-type .brandmark,
section.slide:first-of-type [data-portal-chrome-logo="1"],
section.slide[data-portal-closing-slide="1"] .brandmark,
section.slide[data-portal-closing-slide="1"] [data-portal-chrome-logo="1"],
[data-portal-cover-page="1"] .brandmark,
[data-portal-cover-page="1"] [data-portal-chrome-logo="1"],
[data-portal-closing-page="1"] .brandmark,
[data-portal-closing-page="1"] [data-portal-chrome-logo="1"] {
  display: none !important;
}`
    : `
.chrome-top .brandmark,
.pchrome-top .brandmark,
.page-chrome-top .brandmark {
  display: none !important;
}`;

  // Exports: never show company-name text in the chrome.
  const exportChromeRule = options.exportMode
    ? `
.brandmark [data-i18n="brand"],
.brandmark [data-i18n="cta.brand"] {
  display: none !important;
}`
    : "";

  return `
:root {
  --teal: ${colors.primary} !important;
  --teal-deep: ${colors.secondary} !important;
  --teal-pale: color-mix(in srgb, ${colors.primary} 18%, white) !important;
  --accent-warm: ${colors.accent} !important;
  --gold: ${colors.accent} !important;
  --portal-accent-2: ${colors.accentSecondary} !important;
  --cream: ${colors.slide} !important;
  --paper: ${colors.slide} !important;
  --ink: ${colors.text} !important;
  --ink-2: color-mix(in srgb, ${colors.text} 75%, white) !important;
  --sans: ${JSON.stringify(fontFamily)}, "Geist", "Inter", sans-serif !important;
  --serif: ${JSON.stringify(fontFamily)}, "Newsreader", Georgia, serif !important;
}
body {
  font-family: var(--sans);
  color: var(--ink);
}
section.slide:not(.ink):not(.teal):not(.dark),
div.page:not(.cover):not(.ink):not(.dark),
section.page:not(.cover):not(.ink):not(.dark) {
  background-color: ${colors.slide} !important;
}
/* Drop duplicate chrome section titles ("02 — Agenda"); keep content .eyebrow only. */
.chrome-top > :not(.brandmark),
.pchrome-top > :not(.brandmark),
.page-chrome-top > :not(.brandmark) {
  display: none !important;
}
.eyebrow {
  font-size: 16.5px !important; /* 11px × 1.5 */
  letter-spacing: 0.12em !important;
}
.chrome-bot,
.page-chrome-bot,
.pchrome-bot {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) !important;
  align-items: center !important;
  column-gap: 24px !important;
  font-size: 11px !important;
  z-index: 20 !important;
}
/* Keep content above the footer so images don't cover logo/copyright. */
section.slide .slide-content,
div.page .pbody,
div.page .page-body,
section.page .pbody,
section.page .page-body {
  padding-bottom: 72px !important;
  box-sizing: border-box !important;
  min-height: 0 !important;
  overflow: hidden !important;
}
section.slide .slide-content > *,
div.page .pbody > *,
div.page .page-body > *,
section.page .pbody > *,
section.page .page-body > * {
  min-height: 0;
}
/* Large content photos (not logo tiles) shrink to clear the footer band. */
section.slide .slide-content img[style*="aspect-ratio"],
section.slide .slide-content img[style*="width: 100%"],
section.slide .slide-content img[style*="width:100%"],
div.page .pbody img[style*="aspect-ratio"],
div.page .page-body img[style*="aspect-ratio"],
section.page .pbody img[style*="aspect-ratio"],
section.page .page-body img[style*="aspect-ratio"] {
  max-height: 440px !important;
  object-fit: cover !important;
}
[data-portal-footer-center="1"] {
  grid-column: 2;
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
[data-portal-footer-center="1"] [data-portal-footer-pages] {
  flex-shrink: 0;
}
[data-portal-footer-center="1"] [data-portal-footer-name] {
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
}
[data-portal-copyright="1"] {
  grid-column: 3;
  justify-self: end;
  font-family: var(--mono, monospace);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: inherit;
  opacity: 0.75;
  white-space: nowrap;
}
/* Dark slides: white footer text + white logo so chrome stays readable. */
section.slide.ink .chrome-bot,
section.slide.teal .chrome-bot,
section.slide.dark .chrome-bot,
div.page.ink .page-chrome-bot,
div.page.ink .pchrome-bot,
div.page.dark .page-chrome-bot,
div.page.dark .pchrome-bot,
section.page.ink .page-chrome-bot,
section.page.ink .pchrome-bot,
section.page.dark .page-chrome-bot,
section.page.dark .pchrome-bot,
[data-portal-dark-chrome="1"] .chrome-bot,
[data-portal-dark-chrome="1"] .page-chrome-bot,
[data-portal-dark-chrome="1"] .pchrome-bot {
  color: rgba(255, 255, 255, 0.9) !important;
}
section.slide.ink [data-portal-copyright="1"],
section.slide.teal [data-portal-copyright="1"],
section.slide.dark [data-portal-copyright="1"],
div.page.ink [data-portal-copyright="1"],
div.page.dark [data-portal-copyright="1"],
section.page.ink [data-portal-copyright="1"],
section.page.dark [data-portal-copyright="1"],
[data-portal-dark-chrome="1"] [data-portal-copyright="1"] {
  color: rgba(255, 255, 255, 0.85) !important;
  opacity: 1 !important;
}
section.slide.ink [data-portal-chrome-logo="1"] img,
section.slide.teal [data-portal-chrome-logo="1"] img,
section.slide.dark [data-portal-chrome-logo="1"] img,
div.page.ink [data-portal-chrome-logo="1"] img,
div.page.dark [data-portal-chrome-logo="1"] img,
section.page.ink [data-portal-chrome-logo="1"] img,
section.page.dark [data-portal-chrome-logo="1"] img,
[data-portal-dark-chrome="1"] [data-portal-chrome-logo="1"] img {
  filter: brightness(0) invert(1) !important;
}
${logoRule}
${exportChromeRule}
`.trim();
}

const SOCIAL_ICON_PATHS: Partial<Record<BrandCtaLink["type"], string>> = {
  facebook:
    "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function activeCtaLink(
  profile: BrandProfile,
  type: BrandCtaLink["type"]
): BrandCtaLink | undefined {
  return profile.cta.links.find(
    (l) => l.type === type && l.enabled && l.value.trim()
  );
}

export type BrandDocVariant = "slide" | "page";

interface LayoutSizes {
  logoHeight: number;
  logoMaxWidth: number;
  titleSize: number;
  sentenceSize: number;
  detailSize: number;
  iconSize: number;
  gap: number;
}

const SIZES: Record<BrandDocVariant, LayoutSizes> = {
  slide: {
    logoHeight: 220,
    logoMaxWidth: 620,
    titleSize: 72,
    sentenceSize: 32,
    detailSize: 26,
    iconSize: 52,
    gap: 44,
  },
  page: {
    logoHeight: 150,
    logoMaxWidth: 420,
    titleSize: 40,
    sentenceSize: 20,
    detailSize: 17,
    iconSize: 36,
    gap: 28,
  },
};

function logoOrNameHtml(
  profile: BrandProfile,
  s: LayoutSizes,
  logoSrc: string
): string {
  const company = profile.companyName.trim();
  if (profile.logoDataUrl) {
    return `<img src="${logoSrc}" alt="${escapeHtml(company || "Logo")}" style="height:${s.logoHeight}px;max-width:${s.logoMaxWidth}px;object-fit:contain;" />`;
  }
  if (company) {
    return `<div style="font-family:var(--sans);font-weight:800;font-size:${s.titleSize}px;letter-spacing:-0.02em;color:var(--ink);">${escapeHtml(company)}</div>`;
  }
  return "";
}

/**
 * Standardized closing slide/page: centered logo, contact sentence (+ email),
 * phone/website, black social icons linked to the brand's accounts.
 */
export function buildClosingSlideHtml(
  profile: BrandProfile,
  variant: BrandDocVariant = "slide",
  opts: { logoSrc?: string } = {}
): string {
  const s = SIZES[variant];
  const logoSrc = opts.logoSrc ?? profile.logoDataUrl ?? "";
  const email =
    (activeCtaLink(profile, "email")?.value.trim().replace(/^mailto:/i, "") ??
      "") ||
    profile.content.contactEmail.trim().replace(/^mailto:/i, "");
  const phone = activeCtaLink(profile, "phone")?.value.trim() ?? "";
  const website = activeCtaLink(profile, "website");

  const sentence = email
    ? `For any questions, please don't hesitate to contact us at <a href="mailto:${escapeHtml(email)}" style="color:var(--teal);text-decoration:underline;">${escapeHtml(email)}</a>.`
    : `For any questions, please don't hesitate to contact us.`;

  const detailRows: string[] = [];
  if (phone) {
    const tel = phone.replace(/^tel:/i, "");
    detailRows.push(
      `<a href="tel:${escapeHtml(tel.replace(/\s/g, ""))}" style="color:var(--ink);text-decoration:none;font-size:${s.detailSize}px;">${escapeHtml(tel)}</a>`
    );
  }
  if (website) {
    detailRows.push(
      `<a href="${escapeHtml(ctaHref(website))}" target="_blank" rel="noopener noreferrer" style="color:var(--teal);text-decoration:underline;font-size:${s.detailSize - 2}px;">${escapeHtml(ctaDisplay(website))}</a>`
    );
  }

  const socials = (["linkedin", "facebook", "instagram", "x"] as const)
    .map((type) => {
      const link = activeCtaLink(profile, type);
      const path = SOCIAL_ICON_PATHS[type];
      if (!link || !path) return "";
      return `<a href="${escapeHtml(ctaHref(link))}" target="_blank" rel="noopener noreferrer" aria-label="${CTA_LABELS[type]}" style="color:var(--ink);display:inline-flex;"><svg width="${s.iconSize}" height="${s.iconSize}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${path}"/></svg></a>`;
    })
    .filter(Boolean);

  return `<div data-portal-closing="1" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:${s.gap}px;font-family:var(--sans);color:var(--ink);">
${logoOrNameHtml(profile, s, logoSrc)}
<p style="font-size:${s.sentenceSize}px;line-height:1.45;max-width:${variant === "slide" ? 1100 : 620}px;margin:0;color:var(--ink);">${sentence}</p>
${detailRows.length ? `<div style="display:flex;flex-direction:column;gap:14px;align-items:center;">${detailRows.join("")}</div>` : ""}
${socials.length ? `<div style="display:flex;gap:${Math.round(s.gap * 0.8)}px;align-items:center;justify-content:center;">${socials.join("")}</div>` : ""}
</div>`;
}

/**
 * Standardized cover page (paged documents): big centered logo, title,
 * subtitle, website URL. `data-portal-cover-eyebrow` is filled at apply time
 * with the document's product name.
 */
export function buildCoverPageHtml(
  profile: BrandProfile,
  opts: { logoSrc?: string } = {}
): string {
  const s = SIZES.page;
  const logoSrc = opts.logoSrc ?? profile.logoDataUrl ?? "";
  const company = profile.companyName.trim();
  const title = profile.content.coverTitle.trim() || company;
  const subtitle =
    profile.content.coverSubtitle.trim() ||
    profile.content.presentationDescription.trim();
  const website = activeCtaLink(profile, "website");

  const logoHtml = profile.logoDataUrl
    ? `<img src="${logoSrc}" alt="${escapeHtml(company || "Logo")}" style="height:${Math.round(s.logoHeight * 1.25)}px;max-width:${s.logoMaxWidth}px;object-fit:contain;" />`
    : "";

  return `<div data-portal-cover="1" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:26px;font-family:var(--sans);color:var(--ink);">
<div data-portal-cover-eyebrow="1" style="font-family:var(--mono, monospace);font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:var(--teal);"></div>
${logoHtml}
${title ? `<h1 style="font-family:var(--sans);font-weight:800;font-size:${s.titleSize}px;line-height:1.1;letter-spacing:-0.02em;margin:0;max-width:640px;color:var(--ink);">${escapeHtml(title)}</h1>` : ""}
${subtitle ? `<p style="font-size:18px;line-height:1.5;max-width:560px;margin:0;color:var(--ink-2, var(--ink));">${escapeHtml(subtitle)}</p>` : ""}
${website ? `<a href="${escapeHtml(ctaHref(website))}" target="_blank" rel="noopener noreferrer" style="font-size:16px;color:var(--teal);text-decoration:underline;">${escapeHtml(ctaDisplay(website))}</a>` : ""}
</div>`;
}

function setI18nText(doc: Document, key: string, text: string): void {
  if (!text.trim()) return;
  doc.querySelectorAll(`[data-i18n="${key}"]`).forEach((el) => {
    el.textContent = text;
  });
}

function setI18nHtml(doc: Document, key: string, html: string): void {
  if (!html.trim()) return;
  doc.querySelectorAll(`[data-i18n="${key}"]`).forEach((el) => {
    el.innerHTML = html;
  });
}

function isEdgeSection(section: Element | null): boolean {
  if (!section) return false;
  return (
    section.matches("[data-portal-cover-page='1']") ||
    section.matches("[data-portal-closing-page='1']") ||
    section.matches("[data-portal-closing-slide='1']") ||
    section.matches("section.slide:first-of-type")
  );
}

function collectFooterMeta(bar: Element): { pages: string; name: string } {
  const texts: string[] = [];
  bar.childNodes.forEach((node) => {
    if (node.nodeType !== 1) return;
    const el = node as Element;
    if (
      el.hasAttribute("data-portal-chrome-logo") ||
      el.hasAttribute("data-portal-copyright") ||
      el.hasAttribute("data-portal-footer-center")
    ) {
      return;
    }
    const t = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (t) texts.push(t);
  });
  const pages =
    texts.find((t) => /^\d+\s*\/\s*\d+/.test(t)) ||
    texts[0] ||
    "";
  const name =
    texts.find((t) => t !== pages && !/^\d+\s*\/\s*\d+$/.test(t)) || "";
  return { pages, name };
}

function ensureFooterStructure(
  doc: Document,
  bar: HTMLElement,
  profile: BrandProfile,
  opts: { withLogo: boolean }
): void {
  const copyright = copyrightLine(profile);
  const existingCenter = bar.querySelector(
    '[data-portal-footer-center="1"]'
  ) as HTMLElement | null;
  const meta = existingCenter
    ? {
        pages:
          existingCenter
            .querySelector("[data-portal-footer-pages]")
            ?.textContent?.trim() || "",
        name:
          existingCenter
            .querySelector("[data-portal-footer-name]")
            ?.textContent?.trim() || "",
      }
    : collectFooterMeta(bar);

  // Clear original chrome children; rebuild as logo | pages+name | copyright.
  while (bar.firstChild) bar.removeChild(bar.firstChild);

  if (opts.withLogo && profile.logoDataUrl) {
    const slot = doc.createElement("span");
    slot.setAttribute("data-portal-chrome-logo", "1");
    const img = doc.createElement("img");
    img.alt = profile.companyName || "Logo";
    img.src = profile.logoDataUrl;
    slot.appendChild(img);
    bar.appendChild(slot);
  } else {
    const spacer = doc.createElement("span");
    spacer.setAttribute("data-portal-footer-spacer", "1");
    bar.appendChild(spacer);
  }

  const center = doc.createElement("span");
  center.setAttribute("data-portal-footer-center", "1");
  if (meta.pages) {
    const pagesEl = doc.createElement("span");
    pagesEl.setAttribute("data-portal-footer-pages", "1");
    pagesEl.textContent = meta.pages;
    center.appendChild(pagesEl);
  }
  if (meta.name) {
    const nameEl = doc.createElement("span");
    nameEl.setAttribute("data-portal-footer-name", "1");
    nameEl.textContent = meta.name;
    center.appendChild(nameEl);
  }
  bar.appendChild(center);

  const copy = doc.createElement("span");
  copy.setAttribute("data-portal-copyright", "1");
  copy.textContent = copyright;
  bar.appendChild(copy);
}

/** Bottom chrome: LOGO | pages + slide name | © YEAR COMPANY | All Rights Reserved */
function applyChromeFooters(doc: Document, profile: BrandProfile): void {
  doc
    .querySelectorAll(".chrome-bot, .page-chrome-bot, .pchrome-bot")
    .forEach((bar) => {
      const section = bar.closest(
        "section.slide, div.page, section.page"
      );
      ensureFooterStructure(doc, bar as HTMLElement, profile, {
        withLogo: Boolean(profile.logoDataUrl) && !isEdgeSection(section),
      });
    });

  // Cover / closing pages that may not have a bottom chrome bar.
  doc
    .querySelectorAll(
      "[data-portal-cover-page='1'], [data-portal-closing-page='1'], section.slide[data-portal-closing-slide='1'], section.slide:first-of-type"
    )
    .forEach((section) => {
      let bar = section.querySelector(
        ".chrome-bot, .page-chrome-bot, .pchrome-bot"
      ) as HTMLElement | null;
      if (!bar) {
        bar = doc.createElement("div");
        bar.className = "chrome-bot";
        bar.setAttribute("data-portal-footer-bar", "1");
        bar.style.cssText =
          "position:absolute;left:56px;right:56px;bottom:36px;z-index:6;";
        const host = section as HTMLElement;
        if (getComputedStyle(host).position === "static") {
          host.style.position = "relative";
        }
        host.appendChild(bar);
      }
      ensureFooterStructure(doc, bar, profile, { withLogo: false });
    });
}

function copyrightLine(profile: BrandProfile): string {
  const year = new Date().getFullYear();
  const company = profile.companyName.trim() || "Hostopia Connects";
  return `© ${year} ${company} | All Rights Reserved`;
}

/** Mark dark-background pages so footer chrome can switch to white. */
function markDarkChromeSections(doc: Document): void {
  doc
    .querySelectorAll("section.slide, div.page, section.page")
    .forEach((section) => {
      const bg = getComputedStyle(section as Element).backgroundColor;
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) {
        (section as HTMLElement).removeAttribute("data-portal-dark-chrome");
        return;
      }
      const r = Number(m[1]);
      const g = Number(m[2]);
      const b = Number(m[3]);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      if (lum < 0.42) {
        (section as HTMLElement).setAttribute("data-portal-dark-chrome", "1");
      } else {
        (section as HTMLElement).removeAttribute("data-portal-dark-chrome");
      }
    });
}

/** Move the plans table "Most popular" badge onto its own line under Silver. */
function fixPlansBadge(doc: Document): void {
  doc.querySelectorAll('[data-i18n="plans.tbl.silver"]').forEach((el) => {
    const text = el.textContent ?? "";
    if (/·/.test(text)) {
      const [tier, ...rest] = text.split("·");
      el.innerHTML = `${escapeHtml(tier.trim())}<br /><span style="font-size:0.85em;opacity:0.85;">${escapeHtml(rest.join("·").trim())}</span>`;
    }
  });
}

function resetChromeColors(section: Element): void {
  section.querySelectorAll(
    ".chrome-top, .chrome-bot, .pchrome-top, .pchrome-bot, .page-chrome-top, .page-chrome-bot"
  ).forEach((bar) => {
    (bar as HTMLElement).style.color = "";
    bar.querySelectorAll("[style]").forEach((el) => {
      (el as HTMLElement).style.color = "";
    });
    const glyph = bar.querySelector(".glyph") as HTMLElement | null;
    if (glyph) glyph.style.background = "";
  });
}

function contentContainer(section: Element): HTMLElement | null {
  return section.querySelector(
    ".slide-content, .pbody, .page-body"
  ) as HTMLElement | null;
}

/**
 * Standardized closing layout. Decks: the last slide is a dedicated CTA slide,
 * so its content is replaced. Paged docs: a new closing page is appended (the
 * last page carries real content) and the old inline CTA box is hidden.
 */
export function applyClosingToDocument(
  doc: Document,
  slideClosingHtml: string,
  pageClosingHtml: string
): void {
  const slides = doc.querySelectorAll("section.slide");
  if (slides.length >= 2) {
    const last = slides[slides.length - 1] as HTMLElement;
    last.setAttribute("data-portal-closing-slide", "1");
    last.classList.remove("ink", "teal", "cream", "dark", "cover");
    last.style.setProperty("background", "var(--paper)", "important");
    resetChromeColors(last);
    const content = contentContainer(last);
    if (content) content.innerHTML = slideClosingHtml;
    return;
  }

  // One-pagers keep their single page; closing page applies to multi-page docs.
  const pages = doc.querySelectorAll("div.page, section.page");
  if (pages.length < 2) return;

  // Hide the template's inline "Get Started" box; the closing page replaces it.
  doc.querySelectorAll('[data-i18n="cta.title"]').forEach((el) => {
    const box = el.parentElement;
    if (box) box.style.display = "none";
  });

  let closingPage = doc.querySelector(
    '[data-portal-closing-page="1"]'
  ) as HTMLElement | null;
  if (!closingPage) {
    const last = pages[pages.length - 1] as HTMLElement;
    const cont = contentContainer(last);
    const contClass = cont?.className.split(" ")[0] ?? "pbody";
    closingPage = doc.createElement(last.tagName.toLowerCase()) as HTMLElement;
    closingPage.className = "page";
    closingPage.setAttribute("data-portal-closing-page", "1");
    last.parentElement?.insertBefore(closingPage, last.nextSibling);
    closingPage.innerHTML = `<div class="${contClass}"></div>`;
  }
  const target = closingPage.firstElementChild as HTMLElement | null;
  if (target) target.innerHTML = pageClosingHtml;
}

/** Replace a paged document's cover page with the standardized cover. */
export function applyCoverToDocument(doc: Document, coverHtml: string): void {
  if (!coverHtml) return;
  const cover = doc.querySelector(
    'div.page.cover, section.page.cover, [data-portal-cover-page="1"]'
  ) as HTMLElement | null;
  if (!cover) return;

  const product =
    cover.querySelector('[data-i18n="product"]')?.textContent?.trim() ?? "";

  cover.setAttribute("data-portal-cover-page", "1");
  cover.classList.remove("cover", "ink", "dark");
  cover.style.setProperty("background", "var(--paper)", "important");
  resetChromeColors(cover);

  const content = contentContainer(cover);
  if (content) {
    content.innerHTML = coverHtml;
    const eyebrow = content.querySelector('[data-portal-cover-eyebrow="1"]');
    if (eyebrow) {
      if (product) eyebrow.textContent = product;
      else eyebrow.remove();
    }
  }
}

/** Apply logo, company name, content fields, and standardized pages to a loaded HTML bundle. */
export function applyBrandContentToDocument(
  doc: Document,
  profile: BrandProfile
): void {
  const company = profile.companyName.trim();
  if (company) {
    // Always replace Product Template chrome labels
    setI18nText(doc, "brand", company);
    setI18nText(doc, "cta.brand", company);
  }

  const {
    coverTitle,
    coverSubtitle,
    presentationDescription,
    audience,
    contactEmail,
  } = profile.content;
  if (coverTitle.trim()) {
    setI18nText(doc, "cover.h1", coverTitle.trim());
  }
  const sub = coverSubtitle.trim() || presentationDescription.trim();
  if (sub) {
    setI18nText(doc, "cover.sub", sub);
  }
  if (audience.trim()) {
    setI18nText(doc, "meta.audience.v", audience.trim());
  }
  const contactAddress =
    activeCtaLink(profile, "email")?.value.trim().replace(/^mailto:/i, "") ||
    contactEmail.trim().replace(/^mailto:/i, "");
  if (contactAddress) {
    const contact = buildContactHtml(contactAddress);
    setI18nHtml(doc, "cta.contact", contact);
    setI18nHtml(doc, "cta.contactfull", contact);
  }

  applyCoverToDocument(doc, buildCoverPageHtml(profile));
  applyClosingToDocument(
    doc,
    buildClosingSlideHtml(profile, "slide"),
    buildClosingSlideHtml(profile, "page")
  );
  applyChromeFooters(doc, profile);
  markDarkChromeSections(doc);
  fixPlansBadge(doc);
}

/**
 * Self-contained ES5 apply routine used by both the pinned HTML export and
 * the Playwright PDF pipeline. Runs immediately and re-applies after the
 * bundle's own language script may have overwritten text.
 */
export function buildBrandApplyScriptBody(profile: BrandProfile): string {
  const css = buildBrandStyleCss(profile, { exportMode: true });
  const logoDataUrl = profile.logoDataUrl ?? "";
  const company = profile.companyName.trim();
  const content = profile.content;
  const ctaEmail =
    activeCtaLink(profile, "email")?.value.trim().replace(/^mailto:/i, "") ||
    content.contactEmail.trim().replace(/^mailto:/i, "");
  const contactHtml = ctaEmail ? buildContactHtml(ctaEmail) : "";
  const copyright = copyrightLine(profile);
  const closingSlide = buildClosingSlideHtml(profile, "slide", {
    logoSrc: LOGO_TOKEN,
  });
  const closingPage = buildClosingSlideHtml(profile, "page", {
    logoSrc: LOGO_TOKEN,
  });
  const coverPage = buildCoverPageHtml(profile, { logoSrc: LOGO_TOKEN });
  const coverSub =
    content.coverSubtitle.trim() || content.presentationDescription.trim();

  return `(function(){
  var css=${JSON.stringify(css)};
  var logoDataUrl=${JSON.stringify(logoDataUrl)};
  var company=${JSON.stringify(company)};
  var copyright=${JSON.stringify(copyright)};
  var coverTitle=${JSON.stringify(content.coverTitle.trim())};
  var coverSub=${JSON.stringify(coverSub)};
  var audience=${JSON.stringify(content.audience.trim())};
  var contactHtml=${JSON.stringify(contactHtml)};
  var closingSlide=${JSON.stringify(closingSlide)};
  var closingPage=${JSON.stringify(closingPage)};
  var coverPage=${JSON.stringify(coverPage)};
  var LOGO_TOKEN=${JSON.stringify(LOGO_TOKEN)};
  function withLogo(html){ return html.split(LOGO_TOKEN).join(logoDataUrl); }
  function setText(key, text){
    if(!text) return;
    document.querySelectorAll('[data-i18n="'+key+'"]').forEach(function(el){ el.textContent=text; });
  }
  function setHtml(key, html){
    if(!html) return;
    document.querySelectorAll('[data-i18n="'+key+'"]').forEach(function(el){ el.innerHTML=html; });
  }
  function escapeHtml(v){
    return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
  }
  function resetChrome(section){
    section.querySelectorAll(".chrome-top, .chrome-bot, .pchrome-top, .pchrome-bot, .page-chrome-top, .page-chrome-bot").forEach(function(bar){
      bar.style.color="";
      bar.querySelectorAll("[style]").forEach(function(el){ el.style.color=""; });
      var glyph=bar.querySelector(".glyph");
      if(glyph) glyph.style.background="";
    });
  }
  function container(section){
    return section.querySelector(".slide-content, .pbody, .page-body");
  }
  function isEdgeSection(section){
    if(!section) return false;
    return section.matches("[data-portal-cover-page='1']")||section.matches("[data-portal-closing-page='1']")||section.matches("[data-portal-closing-slide='1']")||section.matches("section.slide:first-of-type");
  }
  function collectFooterMeta(bar){
    var texts=[];
    bar.childNodes.forEach(function(node){
      if(node.nodeType!==1) return;
      if(node.getAttribute("data-portal-chrome-logo")||node.getAttribute("data-portal-copyright")||node.getAttribute("data-portal-footer-center")) return;
      var t=(node.textContent||"").replace(/\\s+/g," ").trim();
      if(t) texts.push(t);
    });
    var pages="";
    var name="";
    for(var i=0;i<texts.length;i++){
      if(/^\\d+\\s*\\/\\s*\\d+/.test(texts[i])){ pages=texts[i]; break; }
    }
    if(!pages&&texts.length) pages=texts[0];
    for(var j=0;j<texts.length;j++){
      if(texts[j]!==pages&&!/^\\d+\\s*\\/\\s*\\d+$/.test(texts[j])){ name=texts[j]; break; }
    }
    return { pages: pages, name: name };
  }
  function ensureFooterStructure(bar, withLogo){
    var existingCenter=bar.querySelector('[data-portal-footer-center="1"]');
    var meta=existingCenter?{
      pages:(existingCenter.querySelector("[data-portal-footer-pages]")&&existingCenter.querySelector("[data-portal-footer-pages]").textContent||"").trim(),
      name:(existingCenter.querySelector("[data-portal-footer-name]")&&existingCenter.querySelector("[data-portal-footer-name]").textContent||"").trim()
    }:collectFooterMeta(bar);
    while(bar.firstChild) bar.removeChild(bar.firstChild);
    if(withLogo&&logoDataUrl){
      var slot=document.createElement("span");
      slot.setAttribute("data-portal-chrome-logo","1");
      var img=document.createElement("img");
      img.alt=company||"Logo";
      img.src=logoDataUrl;
      slot.appendChild(img);
      bar.appendChild(slot);
    } else {
      var spacer=document.createElement("span");
      spacer.setAttribute("data-portal-footer-spacer","1");
      bar.appendChild(spacer);
    }
    var center=document.createElement("span");
    center.setAttribute("data-portal-footer-center","1");
    if(meta.pages){
      var pagesEl=document.createElement("span");
      pagesEl.setAttribute("data-portal-footer-pages","1");
      pagesEl.textContent=meta.pages;
      center.appendChild(pagesEl);
    }
    if(meta.name){
      var nameEl=document.createElement("span");
      nameEl.setAttribute("data-portal-footer-name","1");
      nameEl.textContent=meta.name;
      center.appendChild(nameEl);
    }
    bar.appendChild(center);
    var copy=document.createElement("span");
    copy.setAttribute("data-portal-copyright","1");
    copy.textContent=copyright;
    bar.appendChild(copy);
  }
  function applyChromeFooters(){
    document.querySelectorAll(".chrome-bot, .page-chrome-bot, .pchrome-bot").forEach(function(bar){
      var section=bar.closest("section.slide, div.page, section.page");
      ensureFooterStructure(bar, !!logoDataUrl && !isEdgeSection(section));
    });
    document.querySelectorAll("[data-portal-cover-page='1'], [data-portal-closing-page='1'], section.slide[data-portal-closing-slide='1'], section.slide:first-of-type").forEach(function(section){
      var bar=section.querySelector(".chrome-bot, .page-chrome-bot, .pchrome-bot");
      if(!bar){
        bar=document.createElement("div");
        bar.className="chrome-bot";
        bar.setAttribute("data-portal-footer-bar","1");
        bar.style.cssText="position:absolute;left:56px;right:56px;bottom:36px;z-index:6;";
        if(getComputedStyle(section).position==="static") section.style.position="relative";
        section.appendChild(bar);
      }
      ensureFooterStructure(bar, false);
    });
  }
  function markDarkChrome(){
    document.querySelectorAll("section.slide, div.page, section.page").forEach(function(section){
      var bg=getComputedStyle(section).backgroundColor;
      var m=bg.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/i);
      if(!m){ section.removeAttribute("data-portal-dark-chrome"); return; }
      var lum=(0.2126*Number(m[1])+0.7152*Number(m[2])+0.0722*Number(m[3]))/255;
      if(lum<0.42) section.setAttribute("data-portal-dark-chrome","1");
      else section.removeAttribute("data-portal-dark-chrome");
    });
  }
  function applyCover(){
    if(!coverPage) return;
    var cover=document.querySelector('div.page.cover, section.page.cover, [data-portal-cover-page="1"]');
    if(!cover) return;
    var productEl=cover.querySelector('[data-i18n="product"]');
    var product=productEl&&productEl.textContent?productEl.textContent.trim():"";
    cover.setAttribute("data-portal-cover-page","1");
    cover.classList.remove("cover","ink","dark");
    cover.style.setProperty("background","var(--paper)","important");
    resetChrome(cover);
    var content=container(cover);
    if(content){
      content.innerHTML=withLogo(coverPage);
      var eyebrow=content.querySelector('[data-portal-cover-eyebrow="1"]');
      if(eyebrow){
        if(product) eyebrow.textContent=product;
        else eyebrow.parentNode.removeChild(eyebrow);
      }
    }
  }
  function applyClosing(){
    var slides=document.querySelectorAll("section.slide");
    if(slides.length>=2){
      var last=slides[slides.length-1];
      last.setAttribute("data-portal-closing-slide","1");
      last.classList.remove("ink","teal","cream","dark","cover");
      last.style.setProperty("background","var(--paper)","important");
      resetChrome(last);
      var content=container(last);
      if(content) content.innerHTML=withLogo(closingSlide);
      return;
    }
    var pages=document.querySelectorAll("div.page, section.page");
    if(pages.length<2) return;
    document.querySelectorAll('[data-i18n="cta.title"]').forEach(function(el){
      if(el.parentElement) el.parentElement.style.display="none";
    });
    var pg=document.querySelector('[data-portal-closing-page="1"]');
    if(!pg){
      var lastPage=pages[pages.length-1];
      var cont=container(lastPage);
      var contClass=cont?cont.className.split(" ")[0]:"pbody";
      pg=document.createElement(lastPage.tagName.toLowerCase());
      pg.className="page";
      pg.setAttribute("data-portal-closing-page","1");
      if(lastPage.parentElement) lastPage.parentElement.insertBefore(pg, lastPage.nextSibling);
      pg.innerHTML='<div class="'+contClass+'"></div>';
    }
    var target=pg.firstElementChild;
    if(target) target.innerHTML=withLogo(closingPage);
  }
  function fixPlansBadge(){
    var DOT="\u00b7";
    document.querySelectorAll('[data-i18n="plans.tbl.silver"]').forEach(function(el){
      var text=el.textContent||"";
      if(text.indexOf(DOT)!==-1){
        var parts=text.split(DOT);
        var tier=parts.shift();
        el.innerHTML=escapeHtml(tier.trim())+'<br /><span style="font-size:0.85em;opacity:0.85;">'+escapeHtml(parts.join(DOT).trim())+"</span>";
      }
    });
  }
  function applyBrand(){
    try{
      var styleEl=document.getElementById("__portal_brand_override");
      if(!styleEl){
        styleEl=document.createElement("style");
        styleEl.id="__portal_brand_override";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent=css;
      if(company){
        setText("brand", company);
        setText("cta.brand", company);
      }
      if(coverTitle) setText("cover.h1", coverTitle);
      if(coverSub) setText("cover.sub", coverSub);
      if(audience) setText("meta.audience.v", audience);
      if(contactHtml){
        setHtml("cta.contact", contactHtml);
        setHtml("cta.contactfull", contactHtml);
      }
      applyChromeFooters();
      document.querySelectorAll('[data-portal-cta="1"], [data-portal-cta-bar="1"]').forEach(function(node){ node.parentNode&&node.parentNode.removeChild(node); });
      fixPlansBadge();
      applyCover();
      applyClosing();
      applyChromeFooters();
      markDarkChrome();
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",applyBrand);
  else applyBrand();
  var n=0;
  var iv=setInterval(function(){
    if(document.querySelector("section.slide, div.page, section.page")||++n>120){
      applyBrand();
      setTimeout(applyBrand, 800);
      setTimeout(applyBrand, 1800);
      clearInterval(iv);
    }
  },500);
})();`;
}

/** Inline script for pinned HTML exports — CSS + content overrides. */
export function buildBrandPinScript(profile: BrandProfile): string {
  return `<!-- Hostopia Connects: brand profile pinned -->
<script id="__hostopia_export_brand">
${buildBrandApplyScriptBody(profile)}
</script>`;
}

export function applyBrandToIframe(
  iframe: HTMLIFrameElement | null,
  profile: BrandProfile
): boolean {
  const doc = iframe?.contentWindow?.document;
  if (!doc) return false;

  try {
    const css = buildBrandStyleCss(profile);
    let styleEl = doc.getElementById("__portal_brand_override");
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = "__portal_brand_override";
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
    applyBrandContentToDocument(doc, profile);
    return true;
  } catch {
    return false;
  }
}

export function scheduleBrandApplyToIframe(
  iframe: HTMLIFrameElement | null,
  profile: BrandProfile,
  { attempts = 60, intervalMs = 500 }: { attempts?: number; intervalMs?: number } = {}
): () => void {
  let count = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    count += 1;
    const applied = applyBrandToIframe(iframe, profile);
    const doc = iframe?.contentWindow?.document;
    const ready =
      applied &&
      Boolean(
        doc?.querySelector("section.slide, div.page, section.page")
      );
    if (ready || count >= attempts) {
      // One more pass after lang may have overwritten brand labels
      if (ready) {
        setTimeout(() => applyBrandToIframe(iframe, profile), 600);
        setTimeout(() => applyBrandToIframe(iframe, profile), 1400);
      }
      if (timer) clearInterval(timer);
    }
  };

  tick();
  timer = setInterval(tick, intervalMs);
  return () => {
    if (timer) clearInterval(timer);
  };
}
