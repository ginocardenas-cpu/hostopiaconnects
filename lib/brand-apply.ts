import type { BrandCtaLink, BrandProfile } from "./brand-profile";

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

/** CSS variable overrides shared by preview iframe and export pipeline. */
export function buildBrandStyleCss(profile: BrandProfile): string {
  const { colors, fontFamily, logoDataUrl } = profile;
  const logoRule = logoDataUrl
    ? `
.brandmark .glyph {
  background-color: transparent !important;
  background-image: url(${JSON.stringify(logoDataUrl)}) !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}
.brandmark img[data-portal-logo="1"] {
  display: block !important;
  max-height: 28px;
  width: auto;
  object-fit: contain;
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
section.slide,
div.page,
section.page {
  background-color: ${colors.slide} !important;
}
h1, h2, h3, h4, h5, h6, p, li, span, label {
  color: inherit;
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

/** Apply logo, company name, and CTA chrome to a loaded HTML bundle document. */
export function applyBrandContentToDocument(
  doc: Document,
  profile: BrandProfile
): void {
  if (profile.companyName) {
    doc.querySelectorAll('[data-i18n="brand"]').forEach((el) => {
      el.textContent = profile.companyName;
    });
  }

  if (profile.logoDataUrl) {
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
        mark.appendChild(img);
      }
      img.src = profile.logoDataUrl ?? "";
    });
  }

  const ctaHtml =
    profile.cta.enabled ? buildCtaHtml(profile.cta.links) : "";

  doc.querySelectorAll('[data-portal-cta="1"]').forEach((node) => node.remove());

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

/** Inline script for pinned HTML exports — CSS generated server-side. */
export function buildBrandPinScript(profile: BrandProfile): string {
  const css = buildBrandStyleCss(profile);
  const profileJson = JSON.stringify(profile);
  return `<!-- Hostopia Connects: brand profile pinned -->
<script id="__hostopia_export_brand">
(function(){
  var profile=${profileJson};
  var css=${JSON.stringify(css)};
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
  function applyBrand(){
    try{
      var styleEl=document.getElementById("__portal_brand_override");
      if(!styleEl){
        styleEl=document.createElement("style");
        styleEl.id="__portal_brand_override";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent=css;
      if(profile.companyName){
        document.querySelectorAll('[data-i18n="brand"]').forEach(function(el){
          el.textContent=profile.companyName;
        });
      }
      if(profile.logoDataUrl){
        document.querySelectorAll(".brandmark").forEach(function(mark){
          var glyph=mark.querySelector(".glyph");
          if(glyph){
            glyph.style.backgroundImage="url("+profile.logoDataUrl+")";
            glyph.style.backgroundSize="contain";
            glyph.style.backgroundRepeat="no-repeat";
            glyph.style.backgroundPosition="center";
            glyph.style.backgroundColor="transparent";
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
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",applyBrand);
  else applyBrand();
  var n=0;
  var iv=setInterval(function(){
    if(document.querySelector("section.slide, div.page, section.page")||++n>120){ applyBrand(); clearInterval(iv); }
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
      if (timer) clearInterval(timer);
    }
  };

  tick();
  timer = setInterval(tick, intervalMs);
  return () => {
    if (timer) clearInterval(timer);
  };
}
