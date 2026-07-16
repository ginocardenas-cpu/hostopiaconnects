import { loadBundlePage } from "../lib/export/extract";
import { htmlSourcePath } from "../lib/export/generate";
import { getAssetById } from "../lib/assets";

async function main() {
  const asset = getAssetById("professional-logo-design-sales-presentation-2");
  if (!asset) throw new Error("missing asset");

  const { page, browser } = await loadBundlePage(htmlSourcePath(asset));
  try {
    const report = await page.evaluate(() => {
      const slides = [...document.querySelectorAll("section.slide")];
      return slides.map((slide, i) => {
        const label = slide.getAttribute("data-screen-label") || "";
        const headings = [...slide.querySelectorAll("h1,h2,h3,h4,p")].map(
          (el) => ({
            tag: el.tagName,
            inner: (el as HTMLElement).innerText?.slice(0, 60) || "",
            text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
          })
        );
        return {
          i: i + 1,
          label,
          headingCount: headings.length,
          withInner: headings.filter((h) => h.inner.length > 0).length,
          withText: headings.filter((h) => h.text.length > 0).length,
          sample: headings.slice(0, 3),
        };
      });
    });
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
