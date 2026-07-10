import type { Page } from "playwright";
import type { DeckLang } from "@/lib/html-deck-i18n";
import { applyLangOnPage } from "./extract";

export async function generatePdfFromPage(page: Page): Promise<Buffer> {
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
  });
  return Buffer.from(pdf);
}

export async function generatePdfBuffer(
  page: Page,
  lang: DeckLang
): Promise<Buffer> {
  await applyLangOnPage(page, lang);
  return generatePdfFromPage(page);
}
