import fs from "fs";
import path from "path";
import {
  ALL_DECK_LANGS,
  listExportableAssets,
  readEditableManifest,
  writeEditableManifest,
  type EditableManifestEntry,
} from "../lib/export";
import { getAssetById, getAssetSourceFileName } from "../lib/assets";
import {
  editableOutputPath,
  generateExportBufferFromPage,
  htmlSourcePath,
} from "../lib/export/generate";
import { generatePinnedHtmlBuffer } from "../lib/export/generate-html";
import type { ExportFormat } from "../lib/export/formats";
import type { DeckLang } from "../lib/html-deck-i18n";
import { loadBundlePage } from "../lib/export/extract";

const LOGO_DESIGN_IDS = new Set([
  "professional-logo-design-overview-1",
  "professional-logo-design-sales-presentation-2",
  "professional-logo-design-sales-slick-3",
]);

async function writeBufferToCache(
  asset: NonNullable<ReturnType<typeof getAssetById>>,
  deckLang: DeckLang,
  format: ExportFormat,
  buffer: Buffer,
  root: string
): Promise<EditableManifestEntry> {
  const htmlPath = htmlSourcePath(asset, root);
  const sourceHtmlMtime = fs.statSync(htmlPath).mtimeMs;
  const { absPath, fileName, fileUrl } = editableOutputPath(
    asset,
    deckLang,
    format,
    root
  );
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, buffer);

  return {
    assetId: asset.id,
    slug: asset.slug,
    lang: deckLang,
    format,
    publicPath: path.relative(root, absPath).replace(/\\/g, "/"),
    fileUrl,
    fileName,
    sourceHtmlMtime,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const pilotOnly = args.includes("--pilot");
  const root = process.cwd();

  console.log("Hostopia Connects — HTML → editable export pre-generation\n");

  let assets = listExportableAssets(root).filter((a) => {
    if (!fs.existsSync(a.htmlPath)) {
      console.warn(`  Skip missing: ${a.fileName}`);
      return false;
    }
    return true;
  });

  if (pilotOnly) {
    assets = assets.filter((a) => LOGO_DESIGN_IDS.has(a.assetId));
    console.log("Pilot mode: Logo Design only\n");
  }

  console.log(`Assets: ${assets.length}`);
  console.log(`Languages: ${ALL_DECK_LANGS.join(", ")}\n`);

  const existing = readEditableManifest(root);
  const kept =
    existing?.entries.filter(
      (e) => !assets.some((a) => a.assetId === e.assetId)
    ) ?? [];

  const newEntries: EditableManifestEntry[] = [];
  const errors: {
    assetId: string;
    lang: string;
    format: string;
    message: string;
  }[] = [];

  for (const item of assets) {
    const asset = getAssetById(item.assetId);
    if (!asset) continue;

    console.log(`\n=== ${asset.title} ===`);

    const needsBrowser = item.formats.some((f) => f !== "html");
    let page: Awaited<ReturnType<typeof loadBundlePage>>["page"] | null = null;
    let browser: Awaited<ReturnType<typeof loadBundlePage>>["browser"] | null =
      null;

    if (needsBrowser) {
      console.log(`  Loading ${item.fileName}…`);
      const session = await loadBundlePage(item.htmlPath);
      page = session.page;
      browser = session.browser;
    }

    try {
      for (const lang of ALL_DECK_LANGS) {
        for (const format of item.formats) {
          try {
            let buffer: Buffer;
            if (format === "html") {
              buffer = generatePinnedHtmlBuffer(item.htmlPath, lang);
            } else if (page) {
              buffer = await generateExportBufferFromPage({
                asset,
                deckLang: lang,
                format,
                page,
                root,
              });
            } else {
              throw new Error("Browser session required");
            }

            const entry = await writeBufferToCache(
              asset,
              lang,
              format,
              buffer,
              root
            );
            newEntries.push(entry);
            console.log(`  ✓ ${lang}/${format} → ${entry.publicPath}`);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            errors.push({ assetId: item.assetId, lang, format, message });
            console.error(`  ✗ ${lang}/${format}: ${message}`);
          }
        }
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  writeEditableManifest([...kept, ...newEntries], root);

  console.log("\n--- Summary ---");
  console.log(`Generated: ${newEntries.length}`);
  console.log(`Errors:    ${errors.length}`);
  console.log(
    `Manifest:  ${path.relative(root, path.join(root, "public", "assets", "editable", "manifest.json"))}`
  );

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
