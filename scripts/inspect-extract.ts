import { extractBundleContent } from "../lib/export/extract";

const htmlPath =
  "public/assets/Professional Logo Design Presentation FINAL 2026-05-18.html";

async function main() {
  const content = await extractBundleContent(htmlPath, "en");
  console.log("slides:", content.slides.length);
  for (const [i, s] of content.slides.entries()) {
    console.log(
      `--- slide ${i + 1} | ${s.label} | blocks: ${s.blocks.length} | images: ${s.images.length}`
    );
    for (const b of s.blocks.slice(0, 6)) {
      if (b.type === "list") {
        console.log("  list", b.items.slice(0, 3));
      } else {
        console.log(" ", b.type, (b.text || "").slice(0, 100));
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
