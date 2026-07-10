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
  exportFileName,
  type ExportFormat,
  isHtmlExportable,
} from "./formats";
import {
  editableDirForAsset,
  manifestPath,
  publicUrlForEditable,
  type EditableManifest,
  type EditableManifestEntry,
} from "./manifest";

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

export function editableOutputPath(
  asset: Asset,
  deckLang: DeckLang,
  format: ExportFormat,
  root = process.cwd()
): { absPath: string; fileName: string; fileUrl: string } {
  const fileName = exportFileName(asset.title, deckLang, format);
  const dir = path.join(root, editableDirForAsset(asset.slug, deckLang));
  const absPath = path.join(dir, fileName);
  const fileUrl = publicUrlForEditable(asset.slug, deckLang, fileName);
  return { absPath, fileName, fileUrl };
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

export function readEditableManifest(root = process.cwd()): EditableManifest | null {
  const p = manifestPath(root);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as EditableManifest;
  } catch {
    return null;
  }
}

export function writeEditableManifest(
  entries: EditableManifestEntry[],
  root = process.cwd()
): void {
  const p = manifestPath(root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const manifest: EditableManifest = {
    generatedAt: new Date().toISOString(),
    entries,
  };
  fs.writeFileSync(p, JSON.stringify(manifest, null, 2));
}

export function findCachedExport(
  asset: Asset,
  deckLang: DeckLang,
  format: ExportFormat,
  root = process.cwd()
): EditableManifestEntry | null {
  const manifest = readEditableManifest(root);
  if (!manifest) return null;

  const entry = manifest.entries.find(
    (e) =>
      e.assetId === asset.id && e.lang === deckLang && e.format === format
  );
  if (!entry) return null;

  const absPath = path.join(root, entry.publicPath);
  if (!fs.existsSync(absPath)) return null;

  // Prefer serving pre-generated files when present. Mtime checks are unreliable
  // after git clone / Vercel deploy (fresh filesystem timestamps).
  return entry;
}

export function assetNeedsExport(
  asset: Asset,
  deckLang?: DeckLang,
  format?: ExportFormat
): boolean {
  const fileName = getAssetSourceFileName(asset);
  if (!isHtmlExportable(fileName)) return false;
  if (!deckLang || !format) return false;
  return true;
}
