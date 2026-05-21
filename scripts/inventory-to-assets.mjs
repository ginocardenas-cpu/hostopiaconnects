/**
 * Reads Hostopia asset inventory XLSX (NEW Assets tab when populated,
 * otherwise Asset Inventory) and writes lib/assets.data.json for Hostopia Connects.
 *
 * Usage:
 *   node scripts/inventory-to-assets.mjs
 *   node scripts/inventory-to-assets.mjs "C:/path/to/Hostopia_Asset_Inventory v2 - UPDATED 2026-05-21.xlsx"
 *
 * npm: npm run assets:from-inventory
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const JOURNEYS = new Set([
  "Build a Brand",
  "Get Online",
  "Get Found",
  "Grow their Business",
]);

const PRODUCT_CATEGORIES = new Set([
  "Domains",
  "SSL",
  "Website",
  "Logo",
  "Email",
  "Ecommerce",
  "Online Fax",
  "Directory Listings",
  "Reputation Management",
]);

const CONTENT_TYPES = new Set([
  "Video",
  "Presentation",
  "Document",
  "Case Study",
  "Playbook",
  "Training",
  "Tool",
]);

const USE_CASES = new Set(["Sales", "Marketing", "Training & Onboarding", "Support"]);

const REGIONS = new Set(["Global", "North America", "EMEA", "APAC", "LATAM"]);

const ASSET_LANGUAGES = new Set([
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "Italian",
  "Greek",
  "Romanian",
  "Bulgarian",
  "Hungarian",
  "Croatian",
  "Norwegian",
  "Swedish",
  "Albanian",
]);

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function basenameOnly(filename) {
  return String(filename || "")
    .trim()
    .replace(/^.*[/\\]/, "");
}

/** Path segment for public/assets — matches ADDING-CONTENT.md (encode spaces etc.). */
function fileUrlFromFilename(filename) {
  const base = basenameOnly(filename);
  if (!base) return "/assets/placeholder.pdf";
  return `/assets/${encodeURIComponent(base)}`;
}

function mapProductCategory(raw) {
  const s = String(raw || "").trim();
  if (!s) return "Website";
  const lower = s.toLowerCase();
  const table = [
    [/domain(?!s)/i, "Domains"],
    [/^domains$/i, "Domains"],
    [/domains\s*&/i, "Domains"],
    [/logo/i, "Logo"],
    [/business email|email marketing|announcer|email\b/i, "Email"],
    [/\bssl\b/i, "SSL"],
    [/online fax|fax/i, "Online Fax"],
    [/e-?commerce|online store|merchant/i, "Ecommerce"],
    [/one\s*list|directory listing/i, "Directory Listings"],
    [/reputation|review/i, "Reputation Management"],
    [/website|hosting|web service|diy|difm|custom website|website builder|seo|marketing 360|social media|brand monitoring/i, "Website"],
  ];
  for (const [re, cat] of table) {
    if (re.test(s)) return cat;
  }
  if (PRODUCT_CATEGORIES.has(s)) return s;
  return "Website";
}

function mapContentType(raw, fileType) {
  const s = `${raw} ${fileType}`.trim().toLowerCase();
  if (/video|mp4/i.test(s)) return "Video";
  if (/pptx?|presentation|sales deck|deck|slides/i.test(s)) return "Presentation";
  if (/playbook/i.test(s)) return "Playbook";
  if (/case study/i.test(s)) return "Case Study";
  if (/training/i.test(s)) return "Training";
  if (/tool|calculator|battlecard/i.test(s)) return "Tool";
  return "Document";
}

function mapUseCases(raw) {
  const parts = String(raw || "")
    .split(/[;,]/g)
    .map((p) => p.trim())
    .filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (p === "Training & Onboarding" || p === "Training and Onboarding") {
      if (USE_CASES.has("Training & Onboarding")) out.push("Training & Onboarding");
      continue;
    }
    if (USE_CASES.has(p)) out.push(p);
  }
  if (out.length === 0) out.push("Sales");
  return [...new Set(out)];
}

function parseGated(v) {
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "yes" || s === "1";
}

function parseLastUpdated(v) {
  const s = String(v || "").trim();
  if (!s) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{4}$/.test(s)) return `${s}-01-01`;
  return new Date().toISOString().slice(0, 10);
}

function pickSheetName(wb) {
  const names = wb.SheetNames;
  const newAssets = names.find((n) => n.trim().toLowerCase() === "new assets");
  const assetInv = names.find((n) => n.trim().toLowerCase() === "asset inventory");
  if (newAssets) {
    const ws = wb.Sheets[newAssets];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
    if (rows.length > 0) return newAssets;
  }
  if (assetInv) return assetInv;
  throw new Error(
    `No usable sheet. Expected "NEW Assets" (with data rows) or "Asset Inventory". Found: ${names.join(", ")}`
  );
}

function resolveInputPath(argPath) {
  if (argPath && fs.existsSync(argPath)) return argPath;
  const candidates = [
    path.join(root, "Assets", "HostopiaConnects", "Hostopia_Asset_Inventory v2 - UPDATED 2026-05-21.xlsx"),
    path.join(root, "Assets", "HostopiaConnects", "Hostopia_Asset_Inventory v2.xlsx"),
    path.join(root, "Assets", "HostopiaConnects", "Hostopia_Asset_Inventory.xlsx"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(
    "Inventory XLSX not found. Place it under Assets/HostopiaConnects/ or pass the full path as argv[2]."
  );
}

function rowToAsset(row, index) {
  const filename = String(row.Filename ?? row.filename ?? "").trim();
  const title = String(row.Title ?? row.title ?? "").trim() || filename;
  const journeyRaw = String(row.Journey ?? row.journey ?? "").trim();
  const journey = JOURNEYS.has(journeyRaw) ? journeyRaw : "Get Online";
  const productCategory = mapProductCategory(row["Product Category"] ?? row["Product category"]);
  const contentType = mapContentType(
    row["Content Type"] ?? row["Content type"] ?? "",
    row["File Type"] ?? row["File type"] ?? ""
  );
  const useCases = mapUseCases(row["Use Cases"] ?? row["Use cases"]);
  const summaryWhat = String(row["Summary — What"] ?? row["Summary - What"] ?? "").trim();
  const summaryWhy = String(row["Summary — Why"] ?? row["Summary - Why"] ?? "").trim();
  const summaryHow = String(row["Summary — How"] ?? row["Summary - How"] ?? "").trim();
  let language = String(row.Language ?? "English").trim() || "English";
  if (!ASSET_LANGUAGES.has(language)) language = "English";
  let region = String(row.Region ?? "Global").trim() || "Global";
  if (!REGIONS.has(region)) region = "Global";
  const gated = parseGated(row.Gated ?? row.gated ?? "true");
  const notes = String(row.Notes ?? "").trim();
  const internalOnly = /internal only|internal-only|do not share externally|agent-facing/i.test(notes);
  const lastUpdated = parseLastUpdated(row["Last Updated"] ?? row["Last updated"]);

  const baseSlug = slugify(title) || slugify(basenameOnly(filename).replace(/\.[^.]+$/, "")) || `asset-${index}`;
  const slug = `${baseSlug}-${index}`.replace(/-+/g, "-");
  const fileUrl = fileUrlFromFilename(filename);

  return {
    id: slug,
    slug,
    title,
    fileName: basenameOnly(filename),
    journey,
    productCategory,
    contentType,
    useCases,
    summaryWhat: summaryWhat || `Hostopia asset: ${title}.`,
    summaryWhy: summaryWhy || "Supports partner and SMB-facing conversations.",
    summaryHow: summaryHow || "Use in discovery, enablement, and follow-up.",
    language,
    region,
    gated,
    internalOnly,
    fileUrl,
    lastUpdated,
    viewCount: 0,
    downloadCount: 0,
  };
}

function main() {
  const input = resolveInputPath(process.argv[2]);
  const wb = XLSX.readFile(input, { cellDates: true, dense: false });
  const sheetName = pickSheetName(wb);
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
  if (!rows.length) {
    throw new Error(`Sheet "${sheetName}" has no data rows.`);
  }

  const assets = rows
    .filter((row) => String(row.Filename ?? row.filename ?? "").trim())
    .map((row, i) => rowToAsset(row, i + 1));
  const outPath = path.join(root, "lib", "assets.data.json");
  fs.writeFileSync(outPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
  console.log(`Wrote ${assets.length} assets from "${sheetName}" (${path.basename(input)}) → lib/assets.data.json`);
}

main();
