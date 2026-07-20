import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pathToFileURL } from "url";
import type { Page, Browser } from "playwright-core";
import type { DeckLang } from "@/lib/html-deck-i18n";
import type { BrandProfile } from "@/lib/brand-profile";
import { shouldApplyBrandOnExport } from "@/lib/brand-profile";
import type { ExportContentModel } from "./content-model";
import { launchBrowser } from "./playwright";
import { applyBrandOnPage } from "./apply-brand";

function loadExtractFnSource(): string {
  const candidates = [
    path.join(path.dirname(fileURLToPath(import.meta.url)), "extract-fn.browser.js"),
    path.join(process.cwd(), "lib/export/extract-fn.browser.js"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, "utf8");
    }
  }
  throw new Error("extract-fn.browser.js not found");
}

const EXTRACT_FN_SOURCE = loadExtractFnSource();
export const LOAD_TIMEOUT_MS = 180_000;

type DeckWindow = Window & { applyLang?: (lang: string) => void };

async function waitForBundle(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      document.querySelector("section.slide, section.page, div.page") !== null ||
      document.getElementById("__bundler_err") !== null,
    { timeout: LOAD_TIMEOUT_MS }
  );

  const err = await page.evaluate(
    () => document.getElementById("__bundler_err")?.textContent?.trim() || ""
  );
  if (err) {
    throw new Error(`Bundle failed to render: ${err.slice(0, 240)}`);
  }

  for (let i = 0; i < 45; i++) {
    const ready = await page.evaluate(() => ({
      applyLang: typeof (window as DeckWindow).applyLang === "function",
      slides: document.querySelectorAll("section.slide").length,
      pages: document.querySelectorAll("div.page, section.page").length,
    }));
    if (ready.applyLang || ready.slides > 0 || ready.pages > 0) {
      if (ready.applyLang || i >= 5) break;
    }
    await page.waitForTimeout(1000);
  }
}

export async function applyLangOnPage(page: Page, lang: DeckLang): Promise<void> {
  const hasApplyLang = await page.evaluate(
    () => typeof (window as DeckWindow).applyLang === "function"
  );
  if (hasApplyLang) {
    await page.evaluate((code) => {
      const w = window as Window & { applyLang?: (lang: string) => void };
      w.applyLang?.(code);
    }, lang);
    await page.waitForTimeout(800);
  }
}

export async function extractFromPage(
  page: Page,
  lang: DeckLang,
  brandProfile?: BrandProfile
): Promise<ExportContentModel> {
  await applyLangOnPage(page, lang);
  if (brandProfile && shouldApplyBrandOnExport(brandProfile)) {
    await applyBrandOnPage(page, brandProfile);
  }
  return page.evaluate(
    `(${EXTRACT_FN_SOURCE})()`
  ) as Promise<ExportContentModel>;
}

export interface SharedBrowser {
  browser?: Browser;
  page?: Page;
}

export async function loadBundlePage(
  htmlPath: string,
  shared?: SharedBrowser
): Promise<{ page: Page; browser: Browser; ownBrowser: boolean }> {
  const browser = shared?.browser ?? (await launchBrowser());
  const page = shared?.page ?? (await browser.newPage());
  page.setDefaultTimeout(LOAD_TIMEOUT_MS);

  const ownBrowser = !shared?.browser && !shared?.page;
  const fileUrl = pathToFileURL(path.resolve(htmlPath)).href;
  await page.goto(fileUrl, {
    waitUntil: "domcontentloaded",
    timeout: LOAD_TIMEOUT_MS,
  });
  await waitForBundle(page);

  return { page, browser, ownBrowser };
}

export async function extractBundleContent(
  htmlPath: string,
  lang: DeckLang,
  shared?: SharedBrowser
): Promise<ExportContentModel> {
  if (shared?.page) {
    return extractFromPage(shared.page, lang);
  }

  const { page, browser, ownBrowser } = await loadBundlePage(htmlPath, shared);
  try {
    return await extractFromPage(page, lang);
  } finally {
    if (ownBrowser) {
      await browser.close();
    }
  }
}

export async function extractBundleAllLangs(
  htmlPath: string,
  langs: DeckLang[]
): Promise<Record<DeckLang, ExportContentModel>> {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  page.setDefaultTimeout(LOAD_TIMEOUT_MS);

  try {
    const fileUrl = pathToFileURL(path.resolve(htmlPath)).href;
    await page.goto(fileUrl, {
      waitUntil: "domcontentloaded",
      timeout: LOAD_TIMEOUT_MS,
    });
    await waitForBundle(page);

    const byLang = {} as Record<DeckLang, ExportContentModel>;
    for (const lang of langs) {
      byLang[lang] = await extractFromPage(page, lang);
    }
    return byLang;
  } finally {
    await browser.close();
  }
}
