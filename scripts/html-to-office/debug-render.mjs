import { chromium } from "playwright";
import path from "path";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");

const files = [
  "Professional Logo Design Presentation FINAL 2026-05-18.html",
  "Professional Logo Design Sales Slick FINAL 2026-05-18.html",
  "Professional Logo Design Overview FINAL 2026-05-18.html",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const file of files) {
  console.log("\n===", file, "===");
  const htmlPath = path.join(root, "public", "assets", file);
  await page.goto(pathToFileURL(path.resolve(htmlPath)).href, {
    waitUntil: "domcontentloaded",
    timeout: 180000,
  });

  let ready = false;
  for (let i = 0; i < 90; i++) {
    const state = await page.evaluate(() => ({
      loading: document.getElementById("__bundler_loading")?.textContent?.trim() || null,
      slides: document.querySelectorAll("section.slide").length,
      sectionPages: document.querySelectorAll("section.page").length,
      divPages: document.querySelectorAll("div.page").length,
      anyPage: document.querySelectorAll(".page").length,
      deckStage: document.querySelector("deck-stage") !== null,
      bodyLen: document.body?.innerText?.trim().length || 0,
      err: document.getElementById("__bundler_err")?.textContent?.slice(0, 200) || null,
      title: document.title,
      hasApplyLang: typeof window.applyLang === "function",
    }));
    if (i % 5 === 0 || state.slides || state.sectionPages || state.divPages || state.err) {
      console.log(`  t+${i * 2}s`, JSON.stringify(state));
    }
    if (state.err) break;
    if (state.slides > 0 || state.sectionPages > 0 || state.divPages > 0) {
      ready = true;
      break;
    }
    if (state.loading === null && state.bodyLen > 800) {
      ready = true;
      break;
    }
    await page.waitForTimeout(2000);
  }

  if (!ready) console.log("  NOT READY after wait loop");

  if (await page.evaluate(() => typeof window.applyLang === "function")) {
    await page.evaluate(() => window.applyLang("en"));
    await page.waitForTimeout(1500);
  }

  const detail = await page.evaluate(() => {
    const firstSlide = document.querySelector("section.slide");
    const firstPage =
      document.querySelector("section.page") ||
      document.querySelector("div.page") ||
      document.querySelector(".page");
    const sample = firstSlide || firstPage;
    return {
      sampleTag: sample?.tagName,
      sampleClass: sample?.className,
      sampleTextLen: sample?.innerText?.trim().length || 0,
      sampleText: sample?.innerText?.trim().slice(0, 300) || null,
      h1: document.querySelectorAll("h1").length,
      p: document.querySelectorAll("p").length,
      dataI18n: document.querySelectorAll("[data-i18n]").length,
    };
  });
  console.log("  detail", detail);
}

await browser.close();
