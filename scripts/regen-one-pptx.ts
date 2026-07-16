import { getAssetById } from "../lib/assets";
import { writeExportToCache } from "../lib/export/generate";

async function main() {
  const asset = getAssetById("professional-logo-design-sales-presentation-2");
  if (!asset) throw new Error("missing");
  const entry = await writeExportToCache({
    asset,
    deckLang: "en",
    format: "pptx",
  });
  console.log("wrote", entry.publicPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
