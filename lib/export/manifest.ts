import path from "path";
import { sampleAssets, type Asset } from "@/lib/assets";
import type { DeckLang } from "@/lib/html-deck-i18n";
import { DECK_LANG_ORDER } from "@/lib/language-display";
import { getAssetSourceFileName } from "@/lib/assets";
import {
  availableExportFormats,
  type ExportFormat,
  isHtmlExportable,
} from "./formats";

export interface ExportableAsset {
  assetId: string;
  slug: string;
  title: string;
  fileName: string;
  contentType: Asset["contentType"];
  htmlPath: string;
  formats: ExportFormat[];
}

export interface EditableManifestEntry {
  assetId: string;
  slug: string;
  lang: DeckLang;
  format: ExportFormat;
  /** Path relative to project root (public/...) */
  publicPath: string;
  /** URL path served by Next */
  fileUrl: string;
  fileName: string;
  sourceHtmlMtime: number;
}

export interface EditableManifest {
  generatedAt: string;
  entries: EditableManifestEntry[];
}

export const EDITABLE_PUBLIC_PREFIX = "/assets/editable";

export function editableDirForAsset(slug: string, lang: DeckLang): string {
  return path.join("public", "assets", "editable", slug, lang);
}

export function publicUrlForEditable(
  slug: string,
  lang: DeckLang,
  fileName: string
): string {
  return `/assets/editable/${encodeURIComponent(slug)}/${lang}/${encodeURIComponent(fileName)}`;
}

export function listExportableAssets(root = process.cwd()): ExportableAsset[] {
  const assetsDir = path.join(root, "public", "assets");
  const out: ExportableAsset[] = [];

  for (const asset of sampleAssets) {
    const fileName = getAssetSourceFileName(asset);
    if (!isHtmlExportable(fileName)) continue;

    const htmlPath = path.join(assetsDir, fileName);
    out.push({
      assetId: asset.id,
      slug: asset.slug,
      title: asset.title,
      fileName,
      contentType: asset.contentType,
      htmlPath,
      formats: availableExportFormats(asset.contentType, fileName),
    });
  }

  return out;
}

export const ALL_DECK_LANGS: DeckLang[] = [...DECK_LANG_ORDER];

export function manifestPath(root = process.cwd()): string {
  return path.join(root, "public", "assets", "editable", "manifest.json");
}
