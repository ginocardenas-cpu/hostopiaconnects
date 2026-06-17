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
    downloads.push({
      assetId: asset.id,
      slug: asset.slug,
      title: fields.title,
      fileUrl: asset.fileUrl,
      fileName: getAssetSourceFileName(asset),
      ...(item.deckLang ? { deckLang: item.deckLang } : {}),
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
      })),
    })
  );

  const response: BundleRequestResponse = { requestId, downloads };
  return NextResponse.json(response);
}
