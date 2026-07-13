import { NextResponse } from "next/server";
import {
  parseBundleRequestPayload,
  type BundleDownloadItem,
  type BundleRequestResponse,
} from "@/lib/bundle-request";
import {
  getAssetById,
  getAssetFieldsForLocale,
  getAssetSourceFileName,
} from "@/lib/assets";
import { defaultExportFormat } from "@/lib/export/formats";
import { shouldApplyBrandOnExport } from "@/lib/brand-profile";
import { resolveDownloadForAsset } from "@/lib/export/resolve";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parseBundleRequestPayload(body);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid lead or asset list" },
      { status: 400 }
    );
  }

  const locale = payload.locale ?? "en";
  const downloads: BundleDownloadItem[] = [];

  for (const item of payload.items) {
    const asset = getAssetById(item.assetId);
    if (!asset) {
      return NextResponse.json(
        { error: `Unknown asset: ${item.assetId}` },
        { status: 400 }
      );
    }

    const fields = getAssetFieldsForLocale(asset, locale);
    const fileName = getAssetSourceFileName(asset);
    const exportFormat =
      item.exportFormat ?? defaultExportFormat(asset.contentType, fileName);

    const resolved = resolveDownloadForAsset(asset, {
      deckLang: item.deckLang,
      exportFormat,
      brandProfile: item.brandProfile,
    });

    downloads.push({
      assetId: asset.id,
      slug: asset.slug,
      title: fields.title,
      fileUrl: resolved.fileUrl,
      fileName: resolved.fileName,
      exportFormat,
      ...(item.deckLang ? { deckLang: item.deckLang } : {}),
      ...(resolved.brandProfile ? { brandProfile: resolved.brandProfile } : {}),
      ...(resolved.useExportPost ? { useExportPost: true } : {}),
      ...(resolved.requiresGeneration
        ? { requiresGeneration: true }
        : {}),
    });
  }

  const requestId = crypto.randomUUID();

  console.info(
    "[bundle-request]",
    JSON.stringify({
      requestId,
      timestamp: new Date().toISOString(),
      lead: payload.lead,
      locale,
      items: downloads.map((d) => ({
        assetId: d.assetId,
        slug: d.slug,
        fileName: d.fileName,
        deckLang: d.deckLang ?? null,
        exportFormat: d.exportFormat ?? null,
        requiresGeneration: d.requiresGeneration ?? false,
      })),
    })
  );

  const response: BundleRequestResponse = { requestId, downloads };
  return NextResponse.json(response);
}
