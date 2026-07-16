import fs from "fs";
import path from "path";
import type { Asset } from "@/lib/assets";
import { getAssetSourceFileName } from "@/lib/assets";
import type { DeckLang } from "@/lib/html-deck-i18n";
import { exportFileName } from "./formats";
import { editableOutputPath } from "./cache";

function decodeFileUrlPath(fileUrl: string): string | null {
  const seg = fileUrl.split("?")[0]?.split("#")[0]?.split("/").pop();
  if (!seg) return null;
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

/** Reject Vercel login / deployment-protection pages mistaken for asset HTML. */
export function isLikelyHostopiaDeckHtml(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed.length < 500) return false;

  const lower = trimmed.toLowerCase();
  if (lower.includes("log in to vercel")) return false;
  if (lower.includes("continue with email") && lower.includes("vercel")) return false;
  if (lower.includes("deployment protection")) return false;
  if (lower.includes("authentication required")) return false;

  if (
    lower.includes("applylang") ||
    lower.includes("lang-toggle") ||
    lower.includes("__bundler_loading") ||
    lower.includes("sales deck")
  ) {
    return true;
  }

  return /<html[\s>]/i.test(trimmed) && trimmed.length > 2000;
}

function publicUrlCandidates(asset: Asset): string[] {
  const urls = new Set<string>();
  const fileName = getAssetSourceFileName(asset);

  if (asset.fileUrl?.trim()) {
    urls.add(asset.fileUrl.trim());
  }

  if (fileName) {
    urls.add(`/assets/${encodeURIComponent(fileName)}`);
    if (fileName.includes("2024-")) {
      urls.add(
        `/assets/${encodeURIComponent(fileName.replace(/2024-/g, "2026-"))}`
      );
    }
    if (fileName.includes("2026-")) {
      urls.add(
        `/assets/${encodeURIComponent(fileName.replace(/2026-/g, "2024-"))}`
      );
    }
  }

  const decoded = asset.fileUrl ? decodeFileUrlPath(asset.fileUrl) : null;
  if (decoded && decoded !== fileName) {
    urls.add(`/assets/${encodeURIComponent(decoded)}`);
  }

  return [...urls];
}

function localPathCandidates(
  asset: Asset,
  deckLang: DeckLang,
  root: string
): string[] {
  const paths: string[] = [];
  const seen = new Set<string>();

  const add = (p: string) => {
    if (!seen.has(p)) {
      seen.add(p);
      paths.push(p);
    }
  };

  const { absPath: editableAbs } = editableOutputPath(
    asset,
    deckLang,
    "html",
    root
  );
  add(editableAbs);

  const editableName = exportFileName(asset.title, deckLang, "html");
  add(
    path.join(
      root,
      "public",
      "assets",
      "editable",
      asset.slug,
      deckLang,
      editableName
    )
  );

  const fileName = getAssetSourceFileName(asset);
  if (fileName) {
    add(path.join(root, "public", "assets", fileName));
    if (fileName.includes("2024-")) {
      add(
        path.join(
          root,
          "public",
          "assets",
          fileName.replace(/2024-/g, "2026-")
        )
      );
    }
  }

  const decoded = asset.fileUrl ? decodeFileUrlPath(asset.fileUrl) : null;
  if (decoded) {
    add(path.join(root, "public", "assets", decoded));
  }

  return paths;
}

function fetchHeaders(requestCookie?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "text/html,application/xhtml+xml",
  };
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (bypass) {
    headers["x-vercel-protection-bypass"] = bypass;
  }
  if (requestCookie?.trim()) {
    headers.Cookie = requestCookie.trim();
  }
  return headers;
}

async function fetchHtmlFromOrigin(
  origin: string,
  urlPath: string,
  requestCookie?: string | null
): Promise<string | null> {
  try {
    const res = await fetch(`${origin.replace(/\/$/, "")}${urlPath}`, {
      cache: "no-store",
      headers: fetchHeaders(requestCookie),
    });
    if (!res.ok) return null;
    const raw = await res.text();
    if (!isLikelyHostopiaDeckHtml(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

export async function loadHtmlSourceForAsset(
  asset: Asset,
  options: {
    origin: string;
    deckLang?: DeckLang;
    root?: string;
    requestCookie?: string | null;
  }
): Promise<{ raw: string; sourceLabel: string }> {
  const root = options.root ?? process.cwd();
  const deckLang = options.deckLang ?? "en";
  const label = getAssetSourceFileName(asset);

  for (const absPath of localPathCandidates(asset, deckLang, root)) {
    try {
      if (fs.existsSync(absPath)) {
        const raw = fs.readFileSync(absPath, "utf8");
        if (isLikelyHostopiaDeckHtml(raw)) {
          return { raw, sourceLabel: label };
        }
      }
    } catch {
      /* ignore fs errors on serverless */
    }
  }

  const origin = options.origin.replace(/\/$/, "");
  for (const urlPath of publicUrlCandidates(asset)) {
    const raw = await fetchHtmlFromOrigin(
      origin,
      urlPath,
      options.requestCookie
    );
    if (raw) {
      return { raw, sourceLabel: label };
    }
  }

  throw new Error(`HTML source not found: ${label}`);
}
