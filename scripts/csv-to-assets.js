/**
 * Bulk import assets from CSV into lib/assets.data.json
 * Usage: node scripts/csv-to-assets.js [path/to/assets.csv]
 * Default CSV path: data/assets.csv
 *
 * CSV columns: filename, title, journey, productCategory, contentType, useCases,
 *              summaryWhat, summaryWhy, summaryHow, language, region, gated, lastUpdated
 * - useCases: semicolon-separated, e.g. "Sales; Marketing; Training & Onboarding"
 * - gated: true or false
 * - Wrap any field in double quotes if it contains commas
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const CSV_PATH = process.argv[2] || path.join(__dirname, "../data/assets.csv");
const OUT_PATH = path.join(__dirname, "../lib/assets.data.json");

const JOURNEYS = [
  "Build a Brand",
  "Get Online",
  "Get Found",
  "Grow their Business",
];
const CONTENT_TYPES = [
  "Video",
  "Presentation",
  "Document",
  "Case Study",
  "Playbook",
  "Training",
  "Tool",
];
const USE_CASES = [
  "Sales",
  "Marketing",
  "Training & Onboarding",
  "Support",
];

function slugFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  try {
    const decoded = decodeURIComponent(base);
    return decoded.replace(/\s+/g, "-").replace(/%20/g, "-").toLowerCase();
  } catch {
    return base.replace(/\s+/g, "-").toLowerCase();
  }
}

function fileUrlFromFilename(filename) {
  const encoded = encodeURIComponent(filename);
  return "/assets/" + encoded;
}

function parseUseCases(val) {
  if (!val || !val.trim()) return [];
  return val
    .split(";")
    .map((s) => s.trim())
    .filter((s) => USE_CASES.includes(s));
}

function rowToAsset(row, index) {
  const filename = (row.filename || "").trim();
  if (!filename) {
    console.warn(`Row ${index + 2}: missing filename, skipped`);
    return null;
  }
  const slug = slugFromFilename(filename);
  const useCases = parseUseCases(row.useCases || "");
  const gated = (row.gated || "").toString().toLowerCase() === "true";
  return {
    id: slug,
    slug,
    title: (row.title || filename).trim(),
    journey: JOURNEYS.includes(row.journey) ? row.journey : "Build a Brand",
    productCategory: (row.productCategory || "Website").trim(),
    contentType: CONTENT_TYPES.includes(row.contentType) ? row.contentType : "Document",
    useCases: useCases.length ? useCases : ["Sales"],
    summaryWhat: (row.summaryWhat || "").trim(),
    summaryWhy: (row.summaryWhy || "").trim(),
    summaryHow: (row.summaryHow || "").trim(),
    language: (row.language || "English").trim(),
    region: (row.region || "Global").trim(),
    gated,
    internalOnly: false,
    fileUrl: fileUrlFromFilename(filename),
    lastUpdated: (row.lastUpdated || new Date().toISOString().slice(0, 10)).trim(),
    viewCount: 0,
    downloadCount: 0,
  };
}

function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("CSV not found:", CSV_PATH);
    console.error("Create data/assets.csv from data/assets-template.csv and run: npm run assets:import");
    process.exit(1);
  }
  const csvText = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  const assets = rows.map((row, i) => rowToAsset(row, i)).filter(Boolean);
  fs.writeFileSync(OUT_PATH, JSON.stringify(assets, null, 2), "utf-8");
  console.log("Wrote", assets.length, "assets to", OUT_PATH);
}

main();
