import path from "path";
import { pathToFileURL } from "url";
import { chromium } from "playwright";

const LOAD_TIMEOUT_MS = 180_000;

const CONTENT_READY_SELECTOR =
  "section.slide, section.page, div.page, .page";

async function waitForBundle(page) {
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

  // Bundled scripts (applyLang, LANG) attach after unpack — brief poll.
  for (let i = 0; i < 45; i++) {
    const ready = await page.evaluate(() => ({
      applyLang: typeof window.applyLang === "function",
      slides: document.querySelectorAll("section.slide").length,
      pages: document.querySelectorAll("div.page, section.page").length,
      i18n: document.querySelectorAll("[data-i18n]").length,
    }));
    if (ready.applyLang || ready.slides > 0 || ready.pages > 0) {
      if (ready.applyLang || i >= 5) break;
    }
    await page.waitForTimeout(1000);
  }
}

/** DOM extraction logic (runs inside the browser). */
const EXTRACT_FN = async () => {
  async function imageToDataUrl(img) {
    try {
      if (!img.src || img.naturalWidth < 16 || img.naturalHeight < 16) {
        return null;
      }
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function extractBlocks(root) {
    const blocks = [];
    const seen = new Set();

    const pushText = (type, text, extra = {}) => {
      const t = cleanText(text);
      if (t.length <= 1 || seen.has(t)) return;
      seen.add(t);
      blocks.push({ type, text: t, ...extra });
    };

    root.querySelectorAll("h1, h2, h3, h4").forEach((el) => {
      pushText("heading", el.innerText, {
        level: el.tagName || "H2",
      });
    });

    root.querySelectorAll(".p-hero, .eyebrow, .p-eyebrow").forEach((el) => {
      if (el.matches("h1,h2,h3,h4")) return;
      pushText("heading", el.innerText, { level: "H2" });
    });

    root.querySelectorAll("p").forEach((el) => {
      if (el.closest("li")) return;
      pushText("paragraph", el.innerText);
    });

    root.querySelectorAll("ul, ol").forEach((list) => {
      const items = [...list.querySelectorAll(":scope > li")]
        .map((li) => cleanText(li.innerText))
        .filter((t) => t.length > 0);
      if (items.length === 0) return;
      const key = `list:${items.join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      blocks.push({ type: "list", items });
    });

    if (blocks.length === 0) {
      root.querySelectorAll("[data-i18n]").forEach((el) => {
        const text = cleanText(el.innerText);
        if (text.length > 2) pushText("paragraph", text);
      });
    }

    return blocks;
  }

  async function extractSection(section, index) {
    const label =
      section.getAttribute("data-screen-label")?.trim() ||
      cleanText(section.querySelector("[data-i18n*='chrome']")?.textContent || "") ||
      cleanText(section.querySelector(".page-chrome-top, .chrome-top")?.textContent || "") ||
      `Section ${index + 1}`;

    const blocks = extractBlocks(section);

    const images = [];
    for (const img of section.querySelectorAll("img")) {
      const dataUrl = await imageToDataUrl(img);
      if (dataUrl) images.push({ alt: img.alt || "", dataUrl });
    }

    return { label, blocks, images };
  }

  const slides = [];
  for (const [i, el] of [...document.querySelectorAll("section.slide")].entries()) {
    slides.push(await extractSection(el, i));
  }

  const pages = [];
  const pageEls = [...document.querySelectorAll("div.page, section.page")];
  for (const [i, el] of pageEls.entries()) {
    pages.push(await extractSection(el, i));
  }

  return {
    title: document.title || "",
    slides,
    pages,
  };
};

/**
 * Extract content for one language from an already-loaded HTML bundle page.
 */
export async function extractFromPage(page, lang) {
  const hasApplyLang = await page.evaluate(
    () => typeof window.applyLang === "function"
  );
  if (hasApplyLang) {
    await page.evaluate((code) => window.applyLang(code), lang);
    await page.waitForTimeout(800);
  }

  return page.evaluate(EXTRACT_FN);
}

/**
 * Load HTML bundle and extract structured content for one language.
 */
export async function extractBundleContent(htmlPath, lang, shared) {
  if (shared?.page) {
    return extractFromPage(shared.page, lang);
  }

  const browser =
    shared?.browser ||
    (await chromium.launch({ headless: true }));
  const page = shared?.page || (await browser.newPage());
  page.setDefaultTimeout(LOAD_TIMEOUT_MS);

  const ownBrowser = !shared?.browser && !shared?.page;

  try {
    const fileUrl = pathToFileURL(path.resolve(htmlPath)).href;
    await page.goto(fileUrl, { waitUntil: "domcontentloaded", timeout: LOAD_TIMEOUT_MS });
    await waitForBundle(page);
    return extractFromPage(page, lang);
  } finally {
    if (ownBrowser) {
      await browser.close();
    }
  }
}

/**
 * Open one HTML file and extract all languages (reuses one browser tab).
 */
export async function extractBundleAllLangs(htmlPath, langs) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(LOAD_TIMEOUT_MS);

  try {
    const fileUrl = pathToFileURL(path.resolve(htmlPath)).href;
    await page.goto(fileUrl, { waitUntil: "domcontentloaded", timeout: LOAD_TIMEOUT_MS });
    await waitForBundle(page);

    const byLang = {};
    for (const lang of langs) {
      byLang[lang] = await extractFromPage(page, lang);
    }
    return byLang;
  } finally {
    await browser.close();
  }
}

export { LOAD_TIMEOUT_MS, CONTENT_READY_SELECTOR };
