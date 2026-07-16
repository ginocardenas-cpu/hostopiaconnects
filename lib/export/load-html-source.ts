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

function publicUrlCandidates(asset: Asset): string[] {
  const urls = new Set<string>();
  const fileName = getAssetSourceFileName(asset);

  if (asset.fileUrl?.trim()) {
    urls.add(asset.fileUrl.trim());
  }

  if (fileName) {
    urls.add(`/assets/${encodeURIComponent(fileName)}`);
    // Inventory occasionally drifted a year behind the deployed bundle.
    if (fileName.includes("2024-")) {
      urls.add(`/assets/${encodeURIComponent(fileName.replace(/2024-/g, "2026-"))}`);
    }
    if (fileName.includes("2026-")) {
      urls.add(`/assets/${encodeURIComponent(fileName.replace(/2026-/g, "2024-"))}`);
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
  const paths = new Set<string>();
  const fileName = getAssetSourceFileName(asset);

  if (fileName) {
    paths.add(path.join(root, "public", "assets", fileName));
    if (fileName.includes("2024-")) {
      paths.add(
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
    paths.add(path.join(root, "public", "assets", decoded));
  }

  const { absPath } = editableOutputPath(asset, deckLang, "html", root);
  paths.add(absPath);

  const editableName = exportFileName(asset.title, deckLang, "html");
  paths.add(
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

  return [...paths];
}

export async function loadHtmlSourceForAsset(
  asset: Asset,
  options: { origin: string; deckLang?: DeckLang; root?: string }
): Promise<{ raw: string; sourceLabel: string }> {
  const root = options.root ?? process.cwd();
  const deckLang = options.deckLang ?? "en";
  const label = getAssetSourceFileName(asset);

  for (const absPath of localPathCandidates(asset, deckLang, root)) {
    try {
      if (fs.existsSync(absPath)) {
        return { raw: fs.readFileSync(absPath, "utf8"), sourceLabel: label };
      }
    } catch {
      /* ignore fs errors on serverless */
    }
  }

  const origin = options.origin.replace(/\/$/, "");
  for (const urlPath of publicUrlCandidates(asset)) {
    try {
      const res = await fetch(`${origin}${urlPath}`, {
        cache: "no-store",
        headers: { Accept: "text/html,application/xhtml+xml" },
      });
      if (res.ok) {
        const raw = await res.text();
        if (raw.trim().length > 0) {
          return { raw, sourceLabel: label };
        }
      }
    } catch {
      /* try next candidate */
    }
  }

  throw new Error(`HTML source not found: ${label}`);
}
