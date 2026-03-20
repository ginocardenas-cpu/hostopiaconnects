/**
 * Merges scripts/locale-overlays/{locale}.json onto messages/en.json
 * and writes messages/{locale}.json. Run: node scripts/apply-locale-overlays.mjs
 *
 * Only locales in OVERLAY_LOCALES are processed so stray or draft overlay files
 * never overwrite messages for other languages (e.g. fr-CA, pt-BR are edited in messages/).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");
const overlayDir = path.join(__dirname, "locale-overlays");
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));

/** Locales that have hand-maintained overlays merged onto en → messages/{locale}.json */
const OVERLAY_LOCALES = new Set(["de", "it"]);

function deepMerge(base, overlay) {
  if (!overlay || typeof overlay !== "object") return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(overlay)) {
    const b = base[k];
    const o = overlay[k];
    if (
      o &&
      typeof o === "object" &&
      !Array.isArray(o) &&
      b &&
      typeof b === "object" &&
      !Array.isArray(b)
    ) {
      out[k] = deepMerge(b, o);
    } else {
      out[k] = o;
    }
  }
  return out;
}

for (const file of fs.readdirSync(overlayDir)) {
  if (!file.endsWith(".json")) continue;
  const code = path.basename(file, ".json");
  if (!OVERLAY_LOCALES.has(code)) {
    console.warn("Skipping overlay (not in OVERLAY_LOCALES): " + file);
    continue;
  }
  const overlay = JSON.parse(
    fs.readFileSync(path.join(overlayDir, file), "utf8")
  );
  const merged = deepMerge(en, overlay);
  fs.writeFileSync(
    path.join(messagesDir, `${code}.json`),
    JSON.stringify(merged, null, 2) + "\n",
    "utf8"
  );
  console.log("Wrote messages/" + code + ".json");
}
