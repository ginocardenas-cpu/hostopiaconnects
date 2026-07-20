import type { Page } from "playwright-core";
import type { DeckLang } from "@/lib/html-deck-i18n";
import type { BrandProfile } from "@/lib/brand-profile";
import { shouldApplyBrandOnExport } from "@/lib/brand-profile";
import { applyLangOnPage } from "./extract";
import { applyBrandOnPage } from "./apply-brand";

const PRINT_CSS = `
@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  /* Hide interactive chrome that shouldn't appear in PDFs */
  .nav, .nav-bar, .deck-nav, [data-portal-nav], button.reset, .reset-btn {
    display: none !important;
  }
  section.slide,
  div.page,
  section.page {
    page-break-after: always;
    break-after: page;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  section.slide:last-of-type,
  div.page:last-of-type,
  section.page:last-of-type {
    page-break-after: auto;
    break-after: auto;
  }
}
`;

async function preparePageForPdf(page: Page): Promise<{
  landscape: boolean;
  width?: string;
  height?: string;
}> {
  await page.addStyleTag({ content: PRINT_CSS });

  const layout = await page.evaluate(() => {
    const slide = document.querySelector("section.slide") as HTMLElement | null;
    const docPage = document.querySelector(
      "div.page, section.page"
    ) as HTMLElement | null;
    const el = slide ?? docPage;
    if (!el) {
      return { landscape: false as const };
    }
    const rect = el.getBoundingClientRect();
    const width = Math.round(rect.width || el.offsetWidth || 0);
    const height = Math.round(rect.height || el.offsetHeight || 0);
    if (width > 0 && height > 0) {
      return {
        landscape: width >= height,
        width: `${width}px`,
        height: `${height}px`,
      };
    }
    return { landscape: Boolean(slide) };
  });

  return layout;
}

export async function generatePdfFromPage(page: Page): Promise<Buffer> {
  const layout = await preparePageForPdf(page);

  const pdf = await page.pdf({
    ...(layout.width && layout.height
      ? { width: layout.width, height: layout.height }
      : { format: "A4" as const, landscape: layout.landscape }),
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    preferCSSPageSize: false,
  });
  return Buffer.from(pdf);
}

export async function generatePdfBuffer(
  page: Page,
  lang: DeckLang,
  brandProfile?: BrandProfile
): Promise<Buffer> {
  await applyLangOnPage(page, lang);
  if (brandProfile && shouldApplyBrandOnExport(brandProfile)) {
    await applyBrandOnPage(page, brandProfile);
  }
  return generatePdfFromPage(page);
}
