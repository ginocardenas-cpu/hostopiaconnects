/**
 * Reads Hostopia asset inventory XLSX and writes lib/assets.data.json.
 *
 * Behavior:
 * - Prefers workbook files whose names suggest an "UPDATED" export (e.g. *UPDATED*2026*.xlsx).
 * - Loads "Asset Inventory" as the base list when present.
 * - Overlays rows from "NEW Assets" on top of base rows with the same Title (case-insensitive),
 *   and appends NEW-only titles. If there is no base sheet but NEW Assets has rows, uses NEW only.
 * - If a secondary v2 workbook exists, it can supply Asset Inventory when the primary file has
 *   NEW Assets but an empty Asset Inventory (common when updates live in a separate export).
 *
 * Usage:
 *   node scripts/inventory-to-assets.mjs
 *   node scripts/inventory-to-assets.mjs "C:/path/to/Hostopia_Asset_Inventory v2 - UPDATED 2026-05-21.xlsx"
 *   ASSETS_INVENTORY_XLSX=C:/path/to/file.xlsx node scripts/inventory-to-assets.mjs
 *
 * npm: npm run assets:from-inventory
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const CONNECT_DIR = path.join(root, "Assets", "HostopiaConnects");

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
  "Brand Monitoring",
  "Marketing 360",
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

function normTitle(t) {
  return String(t || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Path segment for public/assets — matches ADDING-CONTENT.md (encode spaces etc.). */
function fileUrlFromFilename(filename) {
  const base = basenameOnly(filename);
  if (!base) return "/assets/placeholder.pdf";
  return `/assets/${encodeURIComponent(base)}`;
}

function findSheetName(wb, wanted) {
  const w = wanted.trim().toLowerCase();
  return wb.SheetNames.find((n) => n.trim().toLowerCase() === w);
}

/** Excel sometimes saves HTML entities in cells (&amp;…). Decode so Use Cases / categories parse. */
function decodeCell(val) {
  if (typeof val !== "string") return val;
  let o = val.trim();
  for (let i = 0; i < 8 && o.includes("&amp;"); i++) {
    o = o.replace(/&amp;/gi, "&");
  }
  return o
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

/** Prefer exact "Asset Inventory", else any sheet with "inventory" but not "new". */
function findAssetInventorySheetName(wb) {
  const names = wb.SheetNames;
  const exact = names.find((n) => n.trim().toLowerCase() === "asset inventory");
  if (exact) return exact;
  return names.find((n) => {
    const l = n.toLowerCase();
    return l.includes("inventory") && !l.includes("new");
  });
}

function readSheetRows(wb, sheetLabel) {
  const name =
    sheetLabel.trim().toLowerCase() === "asset inventory"
      ? findAssetInventorySheetName(wb)
      : findSheetName(wb, sheetLabel);
  if (!name) return [];
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
}

function scoreWorkbookFilename(fname) {
  const lower = fname.toLowerCase();
  let score = 0;
  if (lower.includes("updated")) score += 50;
  if (/2026/.test(lower)) score += 20;
  if (lower.includes("v2") || lower.includes("inventoryv2")) score += 10;
  if (lower.includes("inventory")) score += 5;
  return score;
}

/**
 * Prefer explicit argv / env, then any *UPDATED* / 2026-tagged xlsx in CONNECT_DIR (newest mtime wins ties),
 * then known fallbacks.
 */
function resolvePrimaryWorkbook(cliPath) {
  const envPath = process.env.ASSETS_INVENTORY_XLSX?.trim();
  const tryPaths = [cliPath, envPath].filter(Boolean);
  for (const p of tryPaths) {
    if (p && fs.existsSync(p)) return path.resolve(p);
  }

  if (!fs.existsSync(CONNECT_DIR)) {
    throw new Error(`Missing folder ${CONNECT_DIR}. Create it and add the inventory .xlsx.`);
  }

  const xlsxFiles = fs
    .readdirSync(CONNECT_DIR)
    .filter((f) => f.toLowerCase().endsWith(".xlsx") && !f.startsWith("~$"))
    .map((f) => {
      const full = path.join(CONNECT_DIR, f);
      const st = fs.statSync(full);
      return { full, fname: f, mtime: st.mtimeMs, score: scoreWorkbookFilename(f) };
    });

  if (xlsxFiles.length === 0) {
    throw new Error(`No .xlsx files in ${CONNECT_DIR}.`);
  }

  xlsxFiles.sort((a, b) => b.score - a.score || b.mtime - a.mtime);
  if (xlsxFiles[0].score > 0) return xlsxFiles[0].full;

  const fallbacks = [
    path.join(CONNECT_DIR, "Hostopia_Asset_Inventory v2 - UPDATED 2026-05-21.xlsx"),
    path.join(CONNECT_DIR, "Hostopia_Asset_Inventoryv2 UPDATED 2026-05-21.xlsx"),
    path.join(CONNECT_DIR, "Hostopia_Asset_Inventory v2.xlsx"),
    path.join(CONNECT_DIR, "Hostopia_Asset_Inventory.xlsx"),
  ];
  for (const p of fallbacks) {
    if (fs.existsSync(p)) return p;
  }

  return xlsxFiles[0].full;
}

/** Secondary inventory (usually committed v2) when primary has patches but no base rows. */
function resolveSecondaryWorkbook(primaryPath) {
  const v2 = path.join(CONNECT_DIR, "Hostopia_Asset_Inventory v2.xlsx");
  if (fs.existsSync(v2) && path.resolve(v2) !== path.resolve(primaryPath)) return v2;
  const legacy = path.join(CONNECT_DIR, "Hostopia_Asset_Inventory.xlsx");
  if (fs.existsSync(legacy) && path.resolve(legacy) !== path.resolve(primaryPath)) return legacy;
  return null;
}

function rowFilename(row) {
  const keys = [
    "Filename",
    "filename",
    "File Name",
    "File name",
    "FileName",
    "Asset file",
    "Asset File",
    "File",
  ];
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && String(v).trim()) return String(v).trim();
  }
  return "";
}

function rowTitle(row) {
  const v = row.Title ?? row.title;
  if (v !== undefined && String(v).trim()) return String(v).trim();
  return "";
}

function cellSummary(row, kind) {
  const em = "\u2014"; // —
  const en = "\u2013"; // –
  const pairs =
    kind === "what"
      ? [
          [`Summary ${em} What`, `Summary ${en} What`],
          ["Summary — What", "Summary - What", "Summary – What"],
          ["Summary What", "What"],
        ]
      : kind === "why"
        ? [
            [`Summary ${em} Why`, `Summary ${en} Why`],
            ["Summary — Why", "Summary - Why", "Summary – Why"],
            ["Summary Why", "Why"],
          ]
        : [
            [`Summary ${em} How`, `Summary ${en} How`],
            ["Summary — How", "Summary - How", "Summary – How"],
            ["Summary How", "How"],
          ];

  for (const group of pairs) {
    for (const k of group) {
      if (row[k] !== undefined && String(row[k]).trim()) return decodeCell(String(row[k]).trim());
    }
  }

  const keys = Object.keys(row);
  const hint = kind === "what" ? /what/i : kind === "why" ? /why/i : /how/i;
  for (const k of keys) {
    if (/summary/i.test(k) && hint.test(k)) {
      const v = row[k];
      if (v !== undefined && String(v).trim()) return decodeCell(String(v).trim());
    }
  }
  return "";
}

function mergeRowsDeep(prev, patch) {
  const out = { ...prev };
  for (const k of Object.keys(patch)) {
    const v = patch[k];
    if (v === false || v === 0) {
      out[k] = v;
      continue;
    }
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      out[k] = v;
    }
  }
  return out;
}

function mergeByTitle(baseRows, patchRows) {
  const byTitle = new Map();
  for (const row of baseRows) {
    const k = normTitle(rowTitle(row));
    if (!k) continue;
    byTitle.set(k, { ...row });
  }
  for (const row of patchRows) {
    const k = normTitle(rowTitle(row));
    if (!k) continue;
    const prev = byTitle.get(k) || {};
    byTitle.set(k, mergeRowsDeep(prev, row));
  }

  const out = [];
  const seen = new Set();

  for (const row of baseRows) {
    const k = normTitle(rowTitle(row));
    if (!k || seen.has(k)) continue;
    out.push(byTitle.get(k));
    seen.add(k);
  }
  for (const row of patchRows) {
    const k = normTitle(rowTitle(row));
    if (!k || seen.has(k)) continue;
    out.push(byTitle.get(k));
    seen.add(k);
  }
  return out;
}

function mapProductCategory(raw) {
  const s = decodeCell(String(raw || "").trim());
  if (!s) return "Website";
  const lower = s.toLowerCase();
  if (lower === "brand monitoring" || /^brand monitoring(\s|$|,)/i.test(s)) return "Brand Monitoring";
  if (lower === "marketing 360" || /^marketing 360(\s|$|,)/i.test(s)) return "Marketing 360";
  if (PRODUCT_CATEGORIES.has(s)) return s;
  if (/^logo(\s|-)?design$/i.test(s) || s === "Logo") return "Logo";
  if (/domains.*email|email.*domains/i.test(s)) return "Domains";

  const table = [
    [/domain(?!s)/i, "Domains"],
    [/^domains$/i, "Domains"],
    [/domains\s*&/i, "Domains"],
    [/business email|email marketing|announcer|(?<!\.)\bemail\b/i, "Email"],
    [/\bssl\b/i, "SSL"],
    [/online fax|fax/i, "Online Fax"],
    [/e-?commerce|online store|merchant/i, "Ecommerce"],
    [/one\s*list|directory listing/i, "Directory Listings"],
    [/reputation|review/i, "Reputation Management"],
    [/website|hosting|web service|diy|difm|custom website|website builder|seo|social media|online presence builder/i, "Website"],
  ];
  for (const [re, cat] of table) {
    if (re.test(s)) return cat;
  }
  if (/logo/i.test(s)) return "Logo";
  return "Website";
}

function mapContentType(raw, fileType) {
  const r = decodeCell(String(raw || ""));
  const f = decodeCell(String(fileType || ""));
  const s = `${r} ${f}`.trim().toLowerCase();
  if (/overview document|sell sheet|one[\s-]*pager|sales slick|\bslick\b|whitepaper|guide/i.test(s)) return "Document";
  if (/sales presentation|\.ppt|pptx|powerpoint|presentation|deck|slides/i.test(s)) return "Presentation";
  if (/\.html?\b|web page|\bhtml\b/i.test(s)) return "Document";
  if (/video|mp4/i.test(s)) return "Video";
  if (/playbook/i.test(s)) return "Playbook";
  if (/case study/i.test(s)) return "Case Study";
  if (/training/i.test(s)) return "Training";
  if (/tool|calculator|battlecard/i.test(s)) return "Tool";
  return "Document";
}

function mapUseCases(raw) {
  const decoded = decodeCell(String(raw || ""));
  const parts = decoded
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
  if (v === false || v === 0) return false;
  const s = String(v ?? "")
    .trim()
    .toLowerCase();
  if (s === "false" || s === "no" || s === "0") return false;
  if (s === "") return true;
  return s === "true" || s === "yes" || s === "1";
}

function parseLastUpdated(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "number" && v > 20000 && v < 120000) {
    const utc = Math.round((v - 25569) * 86400 * 1000);
    const d = new Date(utc);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const s = String(v ?? "").trim();
  if (!s) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{4}$/.test(s)) return `${s}-01-01`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function rowToAsset(row, index) {
  const filename = decodeCell(rowFilename(row));
  const title = decodeCell(rowTitle(row)) || filename;
  const journeyRaw = decodeCell(String(row.Journey ?? row.journey ?? "").trim());
  const journey = JOURNEYS.has(journeyRaw) ? journeyRaw : "Get Online";
  const productCategory = mapProductCategory(row["Product Category"] ?? row["Product category"]);
  const contentType = mapContentType(
    row["Content Type"] ?? row["Content type"] ?? "",
    row["File Type"] ?? row["File type"] ?? ""
  );
  const useCases = mapUseCases(row["Use Cases"] ?? row["Use cases"]);
  const summaryWhat = cellSummary(row, "what");
  const summaryWhy = cellSummary(row, "why");
  const summaryHow = cellSummary(row, "how");
  let language = String(row.Language ?? "English").trim() || "English";
  if (!ASSET_LANGUAGES.has(language)) language = "English";
  let region = String(row.Region ?? "Global").trim() || "Global";
  if (!REGIONS.has(region)) region = "Global";
  const gated = parseGated(row.Gated ?? row.gated);
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

function loadMergedRows(primaryPath) {
  const wbPrimary = XLSX.readFile(primaryPath, { cellDates: true, dense: false });
  let base = readSheetRows(wbPrimary, "Asset Inventory");
  let patch = readSheetRows(wbPrimary, "NEW Assets");

  if (patch.length > 0 && base.length === 0) {
    const secondary = resolveSecondaryWorkbook(primaryPath);
    if (secondary) {
      const wbSec = XLSX.readFile(secondary, { cellDates: true, dense: false });
      base = readSheetRows(wbSec, "Asset Inventory");
    }
  }

  let merged;
  if (patch.length > 0 && base.length > 0) {
    merged = mergeByTitle(base, patch);
    console.log(
      `Merged ${patch.length} NEW Assets row(s) onto ${base.length} Asset Inventory row(s) → ${merged.length} total`
    );
  } else if (patch.length > 0) {
    merged = patch;
    console.log(`Using ${patch.length} row(s) from NEW Assets only (no Asset Inventory in use).`);
  } else if (base.length > 0) {
    merged = base;
    console.log(`Using ${base.length} row(s) from Asset Inventory (NEW Assets tab empty).`);
  } else {
    throw new Error(
      `No data rows in "Asset Inventory" or "NEW Assets" in ${path.basename(primaryPath)}.`
    );
  }

  return { merged, wbPrimary };
}

function main() {
  const cliPath = process.argv[2];
  const primaryPath = resolvePrimaryWorkbook(cliPath);
  const { merged } = loadMergedRows(primaryPath);

  const assets = merged
    .filter((row) => rowFilename(row))
    .map((row, i) => rowToAsset(row, i + 1));

  const outPath = path.join(root, "lib", "assets.data.json");
  fs.writeFileSync(outPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
  console.log(
    `Wrote ${assets.length} assets from ${path.basename(primaryPath)} (+ merges) → lib/assets.data.json`
  );
}

main();
