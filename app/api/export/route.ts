import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAssetById, getAssetSourceFileName } from "@/lib/assets";
import { parseBrandProfileJson } from "@/lib/brand-profile";
import { normalizeLang } from "@/lib/html-deck-i18n";
import {
  EXPORT_FORMAT_MIME,
  parseExportFormat,
  isHtmlExportable,
} from "@/lib/export/formats";
import {
  editableOutputPath,
  findCachedExport,
  generateExportBuffer,
  readEditableManifest,
  writeEditableManifest,
  writeExportToCache,
} from "@/lib/export/generate";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handleExport(request: Request, body?: Record<string, unknown>) {
  const url = new URL(request.url);
  const record = body ?? Object.fromEntries(url.searchParams.entries());

  const assetId = String(record.assetId ?? "").trim();
  const deckLang = normalizeLang(String(record.deckLang ?? "en"));
  const format = parseExportFormat(record.format);
  const brandProfile = parseBrandProfileJson(record.brandProfile);

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

  const { fileName: downloadName } = editableOutputPath(asset, deckLang, format);

  if (!brandProfile) {
    const cached = findCachedExport(asset, deckLang, format);
    if (cached) {
      return NextResponse.redirect(new URL(cached.fileUrl, request.url));
    }

    const { absPath, fileUrl: editableUrl } = editableOutputPath(
      asset,
      deckLang,
      format
    );
    if (fs.existsSync(absPath)) {
      return NextResponse.redirect(new URL(editableUrl, request.url));
    }
  }

  try {
    let buffer: Buffer;

    if (brandProfile) {
      buffer = await generateExportBuffer({
        asset,
        deckLang,
        format,
        brandProfile,
      });
    } else {
      const entry = await writeExportToCache({ asset, deckLang, format });
      const manifest = readEditableManifest();
      const filtered =
        manifest?.entries.filter(
          (e) =>
            !(
              e.assetId === asset.id &&
              e.lang === deckLang &&
              e.format === format
            )
        ) ?? [];
      writeEditableManifest([...filtered, entry]);
      buffer = fs.readFileSync(path.join(process.cwd(), entry.publicPath));
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": EXPORT_FORMAT_MIME[format],
        "Content-Disposition": `attachment; filename="${downloadName.replace(/"/g, "")}"`,
        "Cache-Control": brandProfile ? "private, no-store" : "private, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[api/export]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleExport(request);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return handleExport(request, body as Record<string, unknown>);
}
