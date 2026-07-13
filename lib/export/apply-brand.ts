import type { Page } from "playwright";
import type { BrandProfile } from "@/lib/brand-profile";
import { buildBrandStyleCss, buildCtaHtml } from "@/lib/brand-apply";

export async function applyBrandOnPage(
  page: Page,
  profile: BrandProfile
): Promise<void> {
  const css = buildBrandStyleCss(profile);
  const ctaHtml = profile.cta.enabled ? buildCtaHtml(profile.cta.links) : "";

  await page.evaluate(
    ({ css, p, ctaHtml: html }) => {
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

      document.querySelectorAll('[data-portal-cta="1"]').forEach((n) => n.remove());
      if (!html) return;

      const targets = document.querySelectorAll(
        ".chrome-bot, .page-chrome-bottom, .pchrome-bot"
      );
      if (targets.length === 0) {
        document
          .querySelectorAll("section.slide, div.page, section.page")
          .forEach((section) => {
            const host = section as HTMLElement;
            let bar = host.querySelector(
              '[data-portal-cta-bar="1"]'
            ) as HTMLElement | null;
            if (!bar) {
              bar = document.createElement("div");
              bar.setAttribute("data-portal-cta-bar", "1");
              bar.setAttribute("data-portal-cta", "1");
              bar.style.cssText =
                "position:absolute;left:0;right:0;bottom:0;padding:10px 24px;font-size:11px;line-height:1.4;z-index:5;";
              if (getComputedStyle(host).position === "static") {
                host.style.position = "relative";
              }
              host.appendChild(bar);
            }
            bar.innerHTML = html;
          });
        return;
      }

      targets.forEach((target) => {
        let cta = target.querySelector(
          '[data-portal-cta="1"]'
        ) as HTMLElement | null;
        if (!cta) {
          cta = document.createElement("span");
          cta.setAttribute("data-portal-cta", "1");
          cta.style.marginLeft = "12px";
          target.appendChild(cta);
        }
        cta.innerHTML = html;
      });
    },
    { css, p: profile, ctaHtml }
  );
}
