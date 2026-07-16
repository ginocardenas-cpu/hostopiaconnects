import fs from "fs";
import { getAssetById } from "../lib/assets";
import { extractBundleContent } from "../lib/export/extract";
import { generatePptxBuffer } from "../lib/export/generate-pptx";
import { buildExportMeta } from "../lib/export/generate";
import { productTitleFromContent } from "../lib/export/content-model";
import { htmlSourcePath } from "../lib/export/generate";

async function main() {
  const asset = getAssetById("professional-logo-design-sales-presentation-2");
  if (!asset) throw new Error("asset missing");

  const htmlPath = htmlSourcePath(asset);
  const content = await extractBundleContent(htmlPath, "en");
  const meta = buildExportMeta(
    asset,
    "en",
    productTitleFromContent(content, asset.title)
  );
  const buffer = await generatePptxBuffer(content, meta);
  const out = "tmp-test-presentation.pptx";
  fs.writeFileSync(out, buffer);
  console.log("wrote", out, buffer.length, "bytes");
  console.log(
    "slide block counts:",
    content.slides.map((s) => s.blocks.length).join(", ")
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
