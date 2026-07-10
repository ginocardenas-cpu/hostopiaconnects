import type { Page } from "playwright";
import type { BrandProfile } from "@/lib/brand-profile";
import { buildBrandStyleCss } from "@/lib/brand-apply";

export async function applyBrandOnPage(
  page: Page,
  profile: BrandProfile
): Promise<void> {
  const css = buildBrandStyleCss(profile);
  await page.evaluate(
    ({ css, profile: p }) => {
      const styleEl = document.getElementById("__portal_brand_override");
      const el =
        styleEl ??
        (() => {
          const node = document.createElement("style");
          node.id = "__portal_brand_override";
          document.head.appendChild(node);
          return node;
        })();
      el.textContent = css;

      if (p.companyName) {
        document.querySelectorAll('[data-i18n="brand"]').forEach((node) => {
          node.textContent = p.companyName;
        });
      }

      if (p.logoDataUrl) {
        document.querySelectorAll(".brandmark").forEach((mark) => {
          const glyph = mark.querySelector(".glyph") as HTMLElement | null;
          if (glyph) {
            glyph.style.backgroundImage = `url(${p.logoDataUrl})`;
            glyph.style.backgroundSize = "contain";
            glyph.style.backgroundRepeat = "no-repeat";
            glyph.style.backgroundPosition = "center";
            glyph.style.backgroundColor = "transparent";
          }
        });
      }
    },
    { css, profile }
  );
}
