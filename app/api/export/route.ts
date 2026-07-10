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
  findCachedExport,
  readEditableManifest,
  writeEditableManifest,
  writeExportToCache,
} from "@/lib/export/generate";

export const maxDuration = 60;
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

  const fileName = getAssetSourceFileName(asset);
  if (!isHtmlExportable(fileName)) {
    return NextResponse.redirect(new URL(asset.fileUrl, request.url));
  }

  const cached = findCachedExport(asset, deckLang, format);
  if (cached) {
    return NextResponse.redirect(new URL(cached.fileUrl, request.url));
  }

  try {
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

    const absPath = path.join(process.cwd(), entry.publicPath);
    const buffer = fs.readFileSync(absPath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": EXPORT_FORMAT_MIME[format],
        "Content-Disposition": `attachment; filename="${entry.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[api/export]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const assetId = String(record.assetId ?? "").trim();
  const deckLang = normalizeLang(String(record.deckLang ?? "en"));
  const format = parseExportFormat(record.format);

  if (!assetId || !format) {
    return NextResponse.json(
      { error: "Missing assetId or format" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  url.searchParams.set("assetId", assetId);
  url.searchParams.set("deckLang", deckLang);
  url.searchParams.set("format", format);

  return GET(new Request(url.toString(), { method: "GET" }));
}
