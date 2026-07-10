import fs from "fs";
import path from "path";
import type { Asset } from "@/lib/assets";
import { getAssetSourceFileName } from "@/lib/assets";
import type { DeckLang } from "@/lib/html-deck-i18n";
import { exportFileName, type ExportFormat, isHtmlExportable } from "./formats";
import {
  editableDirForAsset,
  manifestPath,
  publicUrlForEditable,
  type EditableManifest,
  type EditableManifestEntry,
} from "./manifest";

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

export function readEditableManifest(
  root = process.cwd()
): EditableManifest | null {
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

export function findManifestEntry(
  assetId: string,
  deckLang: DeckLang,
  format: ExportFormat,
  root = process.cwd()
): EditableManifestEntry | null {
  const manifest = readEditableManifest(root);
  if (!manifest) return null;
  return (
    manifest.entries.find(
      (e) =>
        e.assetId === assetId && e.lang === deckLang && e.format === format
    ) ?? null
  );
}

export function findCachedExport(
  asset: Asset,
  deckLang: DeckLang,
  format: ExportFormat,
  root = process.cwd()
): EditableManifestEntry | null {
  const entry = findManifestEntry(asset.id, deckLang, format, root);
  if (!entry) return null;

  const absPath = path.join(root, entry.publicPath);
  if (fs.existsSync(absPath)) return entry;

  // On Vercel, public assets may be CDN-only while manifest still valid.
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
