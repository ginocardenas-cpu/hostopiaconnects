import { NextResponse } from "next/server";
import { importBrandFromUrl } from "@/lib/brand-from-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url =
    body && typeof body === "object" && "url" in body
      ? String((body as { url?: unknown }).url ?? "").trim()
      : "";

  if (!url) {
    return NextResponse.json(
      { error: "Enter a website address.", code: "missing_url" },
      { status: 400 }
    );
  }

  try {
    const result = await importBrandFromUrl(url);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Brand import failed.";
    const status =
      /valid|Enter|Only http|cannot be scraped/i.test(message) ? 400 : 502;
    console.warn("[api/brand-from-url]", message);
    return NextResponse.json({ error: message, code: "import_failed" }, { status });
  }
}
