/**
 * Copy HTML bundles from Assets/HostopiaConnects into public/assets for deploy.
 * Matches catalog rows by product + deliverable (Presentation / Sales Slick / Overview),
 * ignoring date suffixes. Skips legacy Spanish-only Logo deck (§6).
 *
 * Usage: npm run assets:sync-public
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const connectDir = path.join(root, "Assets", "HostopiaConnects");
const publicDir = path.join(root, "public", "assets");
const catalogPath = path.join(root, "lib", "assets.data.json");

const SOURCE_FOLDERS = [
  "Presentations V2",
  "Sales Slicks",
  "Overview Docs V2",
  "Overview Docs",
  "Presentations",
];

const LEGACY_ES_LOGO =
  /professional\s+logo\s+design\s+presentation\s+es\s+final/i;

function deliverableKey(fileName) {
  const n = fileName.toLowerCase();
  if (n.includes("presentation")) return "presentation";
  if (n.includes("sales slick")) return "sales slick";
  if (n.includes("overview")) return "overview";
  return "";
}

function productStem(fileName) {
  return fileName
    .replace(/\s+FINAL\s+\d{4}-\d{2}-\d{2}\.html$/i, "")
    .replace(/\s+(Presentation|Sales Slick|Overview)$/i, "")
    .trim()
    .toLowerCase();
}

function walkHtmlFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(full, acc);
    else if (/\.html?$/i.test(entry.name)) acc.push(full);
  }
  return acc;
}

function buildSourceIndex() {
  const files = [];
  for (const folder of SOURCE_FOLDERS) {
    walkHtmlFiles(path.join(connectDir, folder), files);
  }
  const byStem = new Map();
  for (const full of files) {
    const base = path.basename(full);
    if (LEGACY_ES_LOGO.test(base)) continue;
    const stem = `${productStem(base)}::${deliverableKey(base)}`;
    const prev = byStem.get(stem);
    if (!prev || base > path.basename(prev)) {
      byStem.set(stem, full);
    }
  }
  return byStem;
}

function htmlHasApplyLang(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return /function\s+applyLang|window\.applyLang\s*=/.test(content);
  } catch {
    return false;
  }
}

function main() {
  if (!fs.existsSync(catalogPath)) {
    console.error("Missing lib/assets.data.json — run npm run assets:from-inventory first.");
    process.exit(1);
  }
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  fs.mkdirSync(publicDir, { recursive: true });

  const index = buildSourceIndex();
  let copied = 0;
  let missing = [];
  const deckI18nFiles = [];

  for (const asset of catalog) {
    const targetName = asset.fileName?.trim();
    if (!targetName) continue;
    if (LEGACY_ES_LOGO.test(targetName)) {
      console.warn(`skip legacy: ${targetName}`);
      continue;
    }

    const stem = `${productStem(targetName)}::${deliverableKey(targetName)}`;
    const source = index.get(stem);
    const dest = path.join(publicDir, targetName);

    if (!source) {
      missing.push(targetName);
      continue;
    }
    fs.copyFileSync(source, dest);
    copied++;
    if (htmlHasApplyLang(dest)) {
      deckI18nFiles.push(targetName);
    }
  }

  const metaPath = path.join(root, "lib", "asset-deck-i18n.json");
  fs.writeFileSync(
    metaPath,
    JSON.stringify({ filesWithApplyLang: deckI18nFiles.sort() }, null, 2) + "\n"
  );
  console.log(`${deckI18nFiles.length} file(s) expose applyLang → lib/asset-deck-i18n.json`);

  console.log(`Synced ${copied} file(s) to public/assets/`);
  if (missing.length) {
    console.warn(`Missing source for ${missing.length} catalog file(s):`);
    missing.forEach((f) => console.warn(`  - ${f}`));
    process.exitCode = 1;
  }
}

main();
