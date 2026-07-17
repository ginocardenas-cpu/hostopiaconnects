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
.chrome-top .brandmark .glyph,
.chrome-bot .brandmark .glyph,
.pchrome-top .brandmark .glyph,
.page-chrome-top .brandmark .glyph {
  background-color: transparent !important;
  background-image: url(${JSON.stringify(logoDataUrl)}) !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  width: 45px !important;
  height: 45px !important;
}
.brandmark .glyph::after {
  display: none !important;
}
img[data-portal-logo="1"] {
  display: block !important;
  max-height: 45px;
  width: auto;
  object-fit: contain;
}
[data-portal-chrome-logo="1"] {
  display: flex !important;
  align-items: center;
  margin-right: 12px;
}
[data-portal-chrome-logo="1"] img {
  max-height: 35px;
  width: auto;
  object-fit: contain;
}`
    : "";

  // Exports: never show brand text in the chrome; logo-only when uploaded,
  // nothing when not. Preview keeps the text so users see what they typed.
  const exportChromeRule = options.exportMode
    ? logoDataUrl
      ? `
.brandmark [data-i18n="brand"],
.brandmark [data-i18n="cta.brand"] {
  display: none !important;
}`
      : `
.chrome-top .brandmark,
.chrome-bot .brandmark,
.pchrome-top .brandmark,
.page-chrome-top .brandmark {
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
div.page,
section.page {
  background-color: ${colors.slide} !important;
}
[data-portal-cta="1"] a {
  color: ${colors.primary} !important;
  text-decoration: none;
  font-weight: 600;
}
[data-portal-cta="1"] a:hover {
  text-decoration: underline;
}
${logoRule}
${exportChromeRule}
`.trim();
}

export function buildCtaHtml(links: BrandCtaLink[]): string {
  const active = links.filter((l) => l.enabled && l.value.trim());
  if (active.length === 0) return "";

  return active
    .map((link) => {
      const href = ctaHref(link);
      const label = CTA_LABELS[link.type];
      const text = ctaDisplay(link);
      return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">${label}: ${text.replace(/</g, "&lt;")}</a>`;
    })
    .join('<span aria-hidden="true"> · </span>');
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

/**
 * Standardized closing slide injected into every presentation deck:
 * centered logo, contact sentence (+ email), phone/website, social icons.
 */
export function buildClosingSlideHtml(profile: BrandProfile): string {
  const company = profile.companyName.trim();
  const email =
    profile.content.contactEmail.trim().replace(/^mailto:/i, "") ||
    (activeCtaLink(profile, "email")?.value.trim().replace(/^mailto:/i, "") ?? "");
  const phone = activeCtaLink(profile, "phone")?.value.trim() ?? "";
  const website = activeCtaLink(profile, "website");

  const logoHtml = profile.logoDataUrl
    ? `<img src="${profile.logoDataUrl}" alt="${escapeHtml(company || "Logo")}" style="height:220px;max-width:620px;object-fit:contain;" />`
    : company
      ? `<div style="font-family:var(--sans);font-weight:800;font-size:72px;letter-spacing:-0.02em;color:var(--ink);">${escapeHtml(company)}</div>`
      : "";

  const sentence = email
    ? `For any questions, please don't hesitate to contact us at <a href="mailto:${escapeHtml(email)}" style="color:var(--teal);text-decoration:underline;">${escapeHtml(email)}</a>.`
    : `For any questions, please don't hesitate to contact us.`;

  const detailRows: string[] = [];
  if (phone) {
    const tel = phone.replace(/^tel:/i, "");
    detailRows.push(
      `<a href="tel:${escapeHtml(tel.replace(/\s/g, ""))}" style="color:var(--ink);text-decoration:none;font-size:26px;">${escapeHtml(tel)}</a>`
    );
  }
  if (website) {
    detailRows.push(
      `<a href="${escapeHtml(ctaHref(website))}" target="_blank" rel="noopener noreferrer" style="color:var(--teal);text-decoration:underline;font-size:24px;">${escapeHtml(ctaDisplay(website))}</a>`
    );
  }

  const socials = (["linkedin", "facebook", "instagram", "x"] as const)
    .map((type) => {
      const link = activeCtaLink(profile, type);
      const path = SOCIAL_ICON_PATHS[type];
      if (!link || !path) return "";
      return `<a href="${escapeHtml(ctaHref(link))}" target="_blank" rel="noopener noreferrer" aria-label="${CTA_LABELS[type]}" style="color:var(--ink);display:inline-flex;"><svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${path}"/></svg></a>`;
    })
    .filter(Boolean);

  return `<div data-portal-closing="1" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:44px;font-family:var(--sans);color:var(--ink);">
${logoHtml}
<p style="font-size:32px;line-height:1.45;max-width:1100px;margin:0;color:var(--ink);">${sentence}</p>
${detailRows.length ? `<div style="display:flex;flex-direction:column;gap:14px;align-items:center;">${detailRows.join("")}</div>` : ""}
${socials.length ? `<div style="display:flex;gap:36px;align-items:center;justify-content:center;">${socials.join("")}</div>` : ""}
</div>`;
}

/**
 * Replace the last presentation slide with the standardized closing layout.
 * Applies only to slide decks (section.slide); one-pagers are left as-is.
 */
export function applyClosingSlideToDocument(
  doc: Document,
  closingHtml: string
): void {
  const slides = doc.querySelectorAll("section.slide");
  if (slides.length < 2) return;
  const last = slides[slides.length - 1] as HTMLElement;

  last.classList.remove("ink", "teal", "cream", "dark");
  last.style.setProperty("background", "var(--paper)", "important");

  // Chrome inline colors assumed the old dark background; reset them.
  last.querySelectorAll(".chrome-top, .chrome-bot").forEach((bar) => {
    (bar as HTMLElement).style.color = "";
    bar.querySelectorAll("[style]").forEach((el) => {
      (el as HTMLElement).style.color = "";
    });
    const glyph = bar.querySelector(".glyph") as HTMLElement | null;
    if (glyph) glyph.style.background = "";
  });

  const content = last.querySelector(".slide-content") as HTMLElement | null;
  if (content) {
    content.innerHTML = closingHtml;
  }
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

function applyLogoToBrandmarks(doc: Document, profile: BrandProfile): void {
  if (!profile.logoDataUrl) return;

  doc.querySelectorAll(".brandmark").forEach((mark) => {
    const glyph = mark.querySelector(".glyph") as HTMLElement | null;
    if (glyph) {
      glyph.style.backgroundImage = `url(${profile.logoDataUrl})`;
      glyph.style.backgroundSize = "contain";
      glyph.style.backgroundRepeat = "no-repeat";
      glyph.style.backgroundPosition = "center";
      glyph.style.backgroundColor = "transparent";
    }
    let img = mark.querySelector(
      'img[data-portal-logo="1"]'
    ) as HTMLImageElement | null;
    if (!img) {
      img = doc.createElement("img");
      img.setAttribute("data-portal-logo", "1");
      img.alt = profile.companyName || "Logo";
      mark.insertBefore(img, mark.firstChild);
    }
    img.src = profile.logoDataUrl ?? "";
  });

  // Fixed logo slot in bottom chrome (white/cream margin area)
  doc
    .querySelectorAll(".chrome-bot, .page-chrome-bottom, .pchrome-bot")
    .forEach((bar) => {
      let slot = bar.querySelector(
        '[data-portal-chrome-logo="1"]'
      ) as HTMLElement | null;
      if (!slot) {
        slot = doc.createElement("span");
        slot.setAttribute("data-portal-chrome-logo", "1");
        const img = doc.createElement("img");
        img.alt = profile.companyName || "Logo";
        img.src = profile.logoDataUrl ?? "";
        slot.appendChild(img);
        bar.insertBefore(slot, bar.firstChild);
      } else {
        const img = slot.querySelector("img");
        if (img) img.src = profile.logoDataUrl ?? "";
      }
    });
}

function applyFooterCtaLinks(doc: Document, profile: BrandProfile): void {
  doc.querySelectorAll('[data-portal-cta="1"]').forEach((node) => node.remove());

  const ctaHtml = profile.cta.enabled ? buildCtaHtml(profile.cta.links) : "";
  if (!ctaHtml) return;

  const targets = doc.querySelectorAll(
    ".chrome-bot, .page-chrome-bottom, .pchrome-bot"
  );

  if (targets.length === 0) {
    doc.querySelectorAll("section.slide, div.page, section.page").forEach(
      (section) => {
        let bar = section.querySelector(
          '[data-portal-cta-bar="1"]'
        ) as HTMLElement | null;
        if (!bar) {
          bar = doc.createElement("div");
          bar.setAttribute("data-portal-cta-bar", "1");
          bar.setAttribute("data-portal-cta", "1");
          bar.style.cssText =
            "position:absolute;left:0;right:0;bottom:0;padding:10px 24px;font-size:11px;line-height:1.4;z-index:5;";
          const host = section as HTMLElement;
          if (getComputedStyle(host).position === "static") {
            host.style.position = "relative";
          }
          host.appendChild(bar);
        }
        bar.innerHTML = ctaHtml;
      }
    );
    return;
  }

  targets.forEach((target) => {
    let cta = target.querySelector('[data-portal-cta="1"]') as HTMLElement | null;
    if (!cta) {
      cta = doc.createElement("span");
      cta.setAttribute("data-portal-cta", "1");
      cta.style.marginLeft = "12px";
      target.appendChild(cta);
    }
    cta.innerHTML = ctaHtml;
  });
}

/** Apply logo, company name, content fields, and CTA chrome to a loaded HTML bundle. */
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

  const { presentationDescription, audience, contactEmail } = profile.content;
  if (presentationDescription.trim()) {
    setI18nText(doc, "cover.sub", presentationDescription.trim());
  }
  if (audience.trim()) {
    setI18nText(doc, "meta.audience.v", audience.trim());
  }
  if (contactEmail.trim()) {
    setI18nHtml(doc, "cta.contact", buildContactHtml(contactEmail));
  }

  applyLogoToBrandmarks(doc, profile);
  applyFooterCtaLinks(doc, profile);
  applyClosingSlideToDocument(doc, buildClosingSlideHtml(profile));
}

/** Inline script for pinned HTML exports — CSS + content overrides. */
export function buildBrandPinScript(profile: BrandProfile): string {
  const css = buildBrandStyleCss(profile, { exportMode: true });
  const logoDataUrl = profile.logoDataUrl ?? "";
  const profileForScript = { ...profile, logoDataUrl: undefined };
  const profileJson = JSON.stringify(profileForScript);
  const contactHtml = profile.content.contactEmail.trim()
    ? buildContactHtml(profile.content.contactEmail)
    : "";
  const closingHtml = buildClosingSlideHtml(profile);

  return `<!-- Hostopia Connects: brand profile pinned -->
<script id="__hostopia_export_brand">
(function(){
  var profile=${profileJson};
  var logoDataUrl=${JSON.stringify(logoDataUrl)};
  var css=${JSON.stringify(css)};
  var contactHtml=${JSON.stringify(contactHtml)};
  var closingHtml=${JSON.stringify(closingHtml)};
  function ctaHref(link){
    var v=(link.value||"").trim();
    if(!v) return "";
    if(link.type==="website") return /^https?:\\/\\//i.test(v)?v:"https://"+v;
    if(link.type==="email") return v.indexOf("mailto:")===0?v:"mailto:"+v;
    if(link.type==="phone") return v.indexOf("tel:")===0?v:"tel:"+v.replace(/\\s/g,"");
    return /^https?:\\/\\//i.test(v)?v:"https://"+v;
  }
  function ctaHtml(links){
    var labels={website:"Website",email:"Email",phone:"Phone",linkedin:"LinkedIn",facebook:"Facebook",instagram:"Instagram",x:"X"};
    var out=[];
    (links||[]).forEach(function(link){
      if(!link.enabled||!(link.value||"").trim()) return;
      var href=ctaHref(link);
      var text=(link.value||"").trim().replace(/^mailto:/i,"").replace(/^tel:/i,"").replace(/^https?:\\/\\//i,"");
      out.push('<a href="'+href.replace(/"/g,"&quot;")+'" target="_blank" rel="noopener noreferrer">'+labels[link.type]+": "+text.replace(/</g,"&lt;")+"</a>");
    });
    return out.join('<span aria-hidden="true"> · </span>');
  }
  function setText(key, text){
    if(!text) return;
    document.querySelectorAll('[data-i18n="'+key+'"]').forEach(function(el){ el.textContent=text; });
  }
  function setHtml(key, html){
    if(!html) return;
    document.querySelectorAll('[data-i18n="'+key+'"]').forEach(function(el){ el.innerHTML=html; });
  }
  function applyClosingSlide(){
    if(!closingHtml) return;
    var slides=document.querySelectorAll("section.slide");
    if(slides.length<2) return;
    var last=slides[slides.length-1];
    last.classList.remove("ink","teal","cream","dark");
    last.style.setProperty("background","var(--paper)","important");
    last.querySelectorAll(".chrome-top, .chrome-bot").forEach(function(bar){
      bar.style.color="";
      bar.querySelectorAll("[style]").forEach(function(el){ el.style.color=""; });
      var glyph=bar.querySelector(".glyph");
      if(glyph) glyph.style.background="";
    });
    var content=last.querySelector(".slide-content");
    if(content) content.innerHTML=closingHtml;
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
      var company=(profile.companyName||"").trim();
      if(company){
        setText("brand", company);
        setText("cta.brand", company);
      }
      var content=profile.content||{};
      if(content.presentationDescription) setText("cover.sub", content.presentationDescription);
      if(content.audience) setText("meta.audience.v", content.audience);
      if(contactHtml) setHtml("cta.contact", contactHtml);
      if(logoDataUrl){
        document.querySelectorAll(".brandmark").forEach(function(mark){
          var glyph=mark.querySelector(".glyph");
          if(glyph){
            glyph.style.backgroundImage="url("+logoDataUrl+")";
            glyph.style.backgroundSize="contain";
            glyph.style.backgroundRepeat="no-repeat";
            glyph.style.backgroundPosition="center";
            glyph.style.backgroundColor="transparent";
          }
        });
        document.querySelectorAll(".chrome-bot, .page-chrome-bottom, .pchrome-bot").forEach(function(bar){
          var slot=bar.querySelector('[data-portal-chrome-logo="1"]');
          if(!slot){
            slot=document.createElement("span");
            slot.setAttribute("data-portal-chrome-logo","1");
            var img=document.createElement("img");
            img.alt=company||"Logo";
            img.src=logoDataUrl;
            slot.appendChild(img);
            bar.insertBefore(slot, bar.firstChild);
          } else {
            var existing=slot.querySelector("img");
            if(existing) existing.src=logoDataUrl;
          }
        });
      }
      document.querySelectorAll('[data-portal-cta="1"]').forEach(function(node){ node.remove(); });
      var html=(profile.cta&&profile.cta.enabled)?ctaHtml(profile.cta.links):"";
      if(html){
        var targets=document.querySelectorAll(".chrome-bot, .page-chrome-bottom, .pchrome-bot");
        if(!targets.length){
          document.querySelectorAll("section.slide, div.page, section.page").forEach(function(section){
            var bar=section.querySelector('[data-portal-cta-bar="1"]');
            if(!bar){
              bar=document.createElement("div");
              bar.setAttribute("data-portal-cta-bar","1");
              bar.setAttribute("data-portal-cta","1");
              bar.style.cssText="position:absolute;left:0;right:0;bottom:0;padding:10px 24px;font-size:11px;line-height:1.4;z-index:5;";
              if(getComputedStyle(section).position==="static") section.style.position="relative";
              section.appendChild(bar);
            }
            bar.innerHTML=html;
          });
        } else {
          targets.forEach(function(target){
            var cta=target.querySelector('[data-portal-cta="1"]');
            if(!cta){
              cta=document.createElement("span");
              cta.setAttribute("data-portal-cta","1");
              cta.style.marginLeft="12px";
              target.appendChild(cta);
            }
            cta.innerHTML=html;
          });
        }
      }
      applyClosingSlide();
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",applyBrand);
  else applyBrand();
  var n=0;
  var iv=setInterval(function(){
    if(document.querySelector("section.slide, div.page, section.page")||++n>120){
      applyBrand();
      // Re-apply after applyLang may have run
      setTimeout(applyBrand, 800);
      setTimeout(applyBrand, 1800);
      clearInterval(iv);
    }
  },500);
})();
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
