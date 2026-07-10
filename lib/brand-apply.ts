import type { BrandProfile } from "./brand-profile";

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
  --teal-deep: ${colors.primaryDeep} !important;
  --teal-pale: color-mix(in srgb, ${colors.primary} 18%, white) !important;
  --accent-warm: ${colors.accent} !important;
  --gold: ${colors.accent} !important;
  --cream: ${colors.background} !important;
  --paper: ${colors.background} !important;
  --ink: ${colors.text} !important;
  --ink-2: color-mix(in srgb, ${colors.text} 75%, white) !important;
  --sans: ${JSON.stringify(fontFamily)}, "Geist", "Inter", sans-serif !important;
  --serif: ${JSON.stringify(fontFamily)}, "Newsreader", Georgia, serif !important;
}
body {
  font-family: var(--sans);
}
${logoRule}
`.trim();
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

type BrandWindow = Window & {
  __portalApplyBrand?: (profile: BrandProfile) => void;
};

export function applyBrandToIframe(
  iframe: HTMLIFrameElement | null,
  profile: BrandProfile
): boolean {
  const win = iframe?.contentWindow as BrandWindow | null;
  const doc = win?.document;
  if (!win || !doc) return false;

  try {
    const css = buildBrandStyleCss(profile);
    let styleEl = doc.getElementById("__portal_brand_override");
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = "__portal_brand_override";
      doc.head.appendChild(styleEl);
    }
    styleEl.textContent = css;

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

    return true;
  } catch {
    return false;
  }
}

/** Poll iframe until bundle unpacks, then apply brand (mirrors applyLang timing). */
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
