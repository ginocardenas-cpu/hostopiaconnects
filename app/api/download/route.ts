import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAssetById } from "@/lib/assets";
import { normalizeLang } from "@/lib/html-deck-i18n";
import {
  EXPORT_FORMAT_MIME,
  parseExportFormat,
  isHtmlExportable,
} from "@/lib/export/formats";
import { getAssetSourceFileName } from "@/lib/assets";
import {
  editableOutputPath,
  findManifestEntry,
} from "@/lib/export/generate";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function contentDisposition(fileName: string): string {
  const safe = fileName.replace(/"/g, "");
  return `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

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
  const { absPath, fileName, fileUrl } = editableOutputPath(
    asset,
    deckLang,
    format
  );

  const downloadName = manifestEntry?.fileName ?? fileName;
  const staticUrl = manifestEntry?.fileUrl ?? fileUrl;

  const candidates = [
    manifestEntry?.publicPath
      ? path.join(process.cwd(), manifestEntry.publicPath)
      : null,
    absPath,
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const buffer = fs.readFileSync(candidate);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": EXPORT_FORMAT_MIME[format],
        "Content-Disposition": contentDisposition(downloadName),
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const staticAbs = path.join(
    process.cwd(),
    "public",
    staticUrl.replace(/^\//, "").split("/").map(decodeURIComponent).join(path.sep)
  );
  if (fs.existsSync(staticAbs)) {
    return NextResponse.redirect(new URL(staticUrl, request.url), 307);
  }

  return NextResponse.json(
    {
      error: "Export file not found",
      assetId,
      deckLang,
      format,
      fallback: `/api/export?${new URLSearchParams({ assetId, deckLang, format }).toString()}`,
    },
    { status: 404 }
  );
}
