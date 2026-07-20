import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAssetById, getAssetSourceFileName } from "@/lib/assets";
import {
  parseBrandProfileJson,
  slimBrandProfileForExport,
} from "@/lib/brand-profile";
import { normalizeLang } from "@/lib/html-deck-i18n";
import {
  EXPORT_FORMAT_MIME,
  parseExportFormat,
  isHtmlExportable,
  type ExportFormat,
} from "@/lib/export/formats";
import { editableOutputPath, findCachedExport } from "@/lib/export/cache";
import {
  injectPinnedHtmlExport,
} from "@/lib/export/generate-html";
import { loadHtmlSourceForAsset } from "@/lib/export/load-html-source";
function contentDispositionAttachment(fileName: string): string {
  const safe = fileName.replace(/"/g, "");
  const encoded = encodeURIComponent(safe);
  return `attachment; filename="${safe}"; filename*=UTF-8''${encoded}`;
}

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function generateBrandedBuffer(
  asset: NonNullable<ReturnType<typeof getAssetById>>,
  deckLang: ReturnType<typeof normalizeLang>,
  format: ExportFormat,
  brandProfile: NonNullable<ReturnType<typeof slimBrandProfileForExport>>,
  request: Request
): Promise<{ buffer: Buffer; deliveredFormat: ExportFormat }> {
  const loadOptions = {
    origin: new URL(request.url).origin,
    deckLang,
    requestCookie: request.headers.get("cookie"),
  };

  if (format === "html") {
    const { raw } = await loadHtmlSourceForAsset(asset, loadOptions);
    return {
      buffer: injectPinnedHtmlExport(raw, deckLang, brandProfile),
      deliveredFormat: "html",
    };
  }

  const { generateExportBuffer } = await import("@/lib/export/generate");
  const buffer = await generateExportBuffer({
    asset,
    deckLang,
    format,
    brandProfile,
  });
  return { buffer, deliveredFormat: format };
}

async function generateStandardBuffer(
  asset: NonNullable<ReturnType<typeof getAssetById>>,
  deckLang: ReturnType<typeof normalizeLang>,
  format: ExportFormat
): Promise<Buffer> {
  const { writeExportToCache, readEditableManifest, writeEditableManifest } =
    await import("@/lib/export/generate");
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
  return fs.readFileSync(path.join(process.cwd(), entry.publicPath));
}

async function handleExport(request: Request, body?: Record<string, unknown>) {
  const url = new URL(request.url);
  const record = body ?? Object.fromEntries(url.searchParams.entries());

  const assetId = String(record.assetId ?? "").trim();
  const deckLang = normalizeLang(String(record.deckLang ?? "en"));
  const format = parseExportFormat(record.format);
  const rawBrand = parseBrandProfileJson(record.brandProfile);
  const brandProfile = rawBrand ? slimBrandProfileForExport(rawBrand) : null;

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
    let deliveredFormat: ExportFormat = format;

    if (brandProfile) {
      const branded = await generateBrandedBuffer(
        asset,
        deckLang,
        format,
        brandProfile,
        request
      );
      buffer = branded.buffer;
      deliveredFormat = branded.deliveredFormat;
    } else {
      buffer = await generateStandardBuffer(asset, deckLang, format);
    }

    const { fileName: downloadName } = editableOutputPath(
      asset,
      deckLang,
      deliveredFormat
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": EXPORT_FORMAT_MIME[deliveredFormat],
        "Content-Disposition": contentDispositionAttachment(downloadName),
        "Content-Length": String(buffer.length),
        "Cache-Control": brandProfile ? "private, no-store" : "private, max-age=3600",
        "X-Export-Format": deliveredFormat,
        ...(deliveredFormat !== format
          ? { "X-Export-Fallback": deliveredFormat }
          : {}),
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
