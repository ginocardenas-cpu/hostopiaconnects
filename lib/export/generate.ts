import fs from "fs";
import path from "path";
import type { Asset } from "@/lib/assets";
import { getAssetSourceFileName } from "@/lib/assets";
import type { DeckLang } from "@/lib/html-deck-i18n";
import { DECK_LANG_LABELS } from "@/lib/language-display";
import type { ExportMeta } from "./content-model";
import { productTitleFromContent } from "./content-model";
import {
  extractFromPage,
  loadBundlePage,
} from "./extract";
import { generateDocxBuffer } from "./generate-docx";
import { generatePinnedHtmlBuffer } from "./generate-html";
import { generatePdfBuffer } from "./generate-pdf";
import { generatePptxBuffer } from "./generate-pptx";
import {
  type ExportFormat,
} from "./formats";
import {
  type EditableManifestEntry,
} from "./manifest";
import {
  editableOutputPath,
  readEditableManifest,
  writeEditableManifest,
} from "./cache";

export {
  editableOutputPath,
  readEditableManifest,
  writeEditableManifest,
  findManifestEntry,
  findCachedExport,
  assetNeedsExport,
} from "./cache";

export interface GenerateExportOptions {
  asset: Asset;
  deckLang: DeckLang;
  format: ExportFormat;
  root?: string;
}

export function htmlSourcePath(asset: Asset, root = process.cwd()): string {
  const fileName = getAssetSourceFileName(asset);
  return path.join(root, "public", "assets", fileName);
}

export function buildExportMeta(
  asset: Asset,
  deckLang: DeckLang,
  productTitle?: string
): ExportMeta {
  return {
    productTitle: productTitle ?? asset.title,
    lang: deckLang,
    langLabel: DECK_LANG_LABELS[deckLang],
  };
}

export async function generateExportBufferFromPage(
  options: GenerateExportOptions & { page: import("playwright").Page }
): Promise<Buffer> {
  const { asset, deckLang, format, page, root = process.cwd() } = options;
  const htmlPath = htmlSourcePath(asset, root);

  if (format === "html") {
    return generatePinnedHtmlBuffer(htmlPath, deckLang);
  }

  if (format === "pdf") {
    return generatePdfBuffer(page, deckLang);
  }

  const content = await extractFromPage(page, deckLang);
  const meta = buildExportMeta(
    asset,
    deckLang,
    productTitleFromContent(content, asset.title)
  );

  if (format === "pptx") {
    return generatePptxBuffer(content, meta);
  }
  if (format === "docx") {
    return generateDocxBuffer(content, meta);
  }

  throw new Error(`Unsupported export format: ${format}`);
}

export async function generateExportBuffer(
  options: GenerateExportOptions
): Promise<Buffer> {
  const { asset, deckLang, format, root = process.cwd() } = options;
  const htmlPath = htmlSourcePath(asset, root);

  if (!fs.existsSync(htmlPath)) {
    throw new Error(`HTML source not found: ${htmlPath}`);
  }

  if (format === "html") {
    return generatePinnedHtmlBuffer(htmlPath, deckLang);
  }

  const { page, browser, ownBrowser } = await loadBundlePage(htmlPath);
  try {
    return await generateExportBufferFromPage({ ...options, page, root });
  } finally {
    if (ownBrowser) {
      await browser.close();
    }
  }
}

export async function writeExportToCache(
  options: GenerateExportOptions
): Promise<EditableManifestEntry> {
  const { asset, deckLang, format, root = process.cwd() } = options;
  const htmlPath = htmlSourcePath(asset, root);
  const sourceHtmlMtime = fs.statSync(htmlPath).mtimeMs;
  const { absPath, fileName, fileUrl } = editableOutputPath(
    asset,
    deckLang,
    format,
    root
  );

  const buffer = await generateExportBuffer(options);
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
