import { NextResponse } from "next/server";
import { getAssetById, getAssetSourceFileName } from "@/lib/assets";
import { normalizeLang } from "@/lib/html-deck-i18n";
import { parseExportFormat, isHtmlExportable } from "@/lib/export/formats";
import {
  editableOutputPath,
  findManifestEntry,
} from "@/lib/export/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId")?.trim();
  const deckLang = normalizeLang(searchParams.get("deckLang") || "en");
  const format = parseExportFormat(searchParams.get("format"));

  if (!assetId || !format) {
    return NextResponse.json(
      { error: "Missing assetId or format" },
      { status: 400 }
    );
  }

  const asset = getAssetById(assetId);
  if (!asset) {
    return NextResponse.json({ error: "Unknown asset" }, { status: 404 });
  }

  const sourceName = getAssetSourceFileName(asset);
  if (!isHtmlExportable(sourceName)) {
    return NextResponse.redirect(new URL(asset.fileUrl, request.url));
  }

  const manifestEntry = findManifestEntry(assetId, deckLang, format);
  const { fileUrl } = manifestEntry
    ? { fileUrl: manifestEntry.fileUrl }
    : editableOutputPath(asset, deckLang, format);

  // Pre-generated files live under public/ and are served from the CDN.
  return NextResponse.redirect(new URL(fileUrl, request.url), 307);
}
