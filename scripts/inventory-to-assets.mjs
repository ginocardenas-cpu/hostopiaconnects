/**
 * Reads Hostopia asset inventory XLSX and writes lib/assets.data.json.
 *
 * Behavior:
 * - Prefers workbook files whose names suggest an "UPDATED" export (e.g. *UPDATED*2026*.xlsx).
 * - Loads "Asset Inventory" as the base list when present.
 * - Overlays rows from "NEW Assets" on top of base rows with the same Title (case-insensitive),
 *   and appends NEW-only titles. If there is no base sheet but NEW Assets has rows, uses NEW only.
 * - Writes localized **product page** intro copy to `lib/product-page.copy.json` from sheets whose
 *   names look like product/preview UI tabs (or `PRODUCT_PAGE_COPY_SHEETS=Tab1,Tab2`). See ADDING-CONTENT.md.
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

/** Prefer English-language inventory as canonical base when the workbook has per-locale tabs. */
function findAssetInventorySheetName(wb) {
  const names = wb.SheetNames;
  const english = names.find((n) => /asset\s*inventory/i.test(n) && /english/i.test(n));
  if (english) return english;
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
  if (/2026-05-2[6-9]|2026-05-3[01]|2026-0[6-9]|2027/.test(lower)) score += 25;
  else if (/2026-05-2[5-9]|2026-0[6-9]|2027/.test(lower)) score += 15;
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
    path.join(CONNECT_DIR, "Hostopia_Asset_Inventory v2 - UPDATED 2026-05-26.xlsx"),
    path.join(CONNECT_DIR, "Hostopia_Asset_Inventory V2 - UPDATED 2026-05-26.xlsx"),
    path.join(CONNECT_DIR, "Hostopia_Asset_Inventory v2 - UPDATED 2026-05-25.xlsx"),
    path.join(CONNECT_DIR, "Hostopia_Asset_Inventory V2 - UPDATED 2026-05-25.xlsx"),
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
    "Fichier",
    "Datei",
  ];
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && String(v).trim()) return String(v).trim();
  }
  for (const rk of Object.keys(row)) {
    const t = rk.trim().toLowerCase();
    if (t === "filename" || t === "file" || t === "fichier" || t === "datei") {
      if (t === "file" && /file\s*type/i.test(rk.toLowerCase())) continue;
      const v = row[rk];
      if (v !== undefined && String(v).trim()) return String(v).trim();
    }
  }
  return "";
}

function rowTitle(row) {
  const keys = ["Title", "title", "Título", "Titre", "Titel"];
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && String(v).trim()) return String(v).trim();
  }
  return "";
}

/** Product category cell — English + localized inventory sheet headers (V2). */
function rowProductCategoryCell(row) {
  return (
    row["Product Category"] ??
    row["Product category"] ??
    row["Categoría de producto"] ??
    row["Catégorie de produit"] ??
    row["Produktkategorie"] ??
    ""
  );
}

function rowUseCasesCell(row) {
  return (
    row["Use Cases"] ??
    row["Use cases"] ??
    row["Primary Use Cases"] ??
    row["Primary Use Cases "] ??
    row["Primary use cases"] ??
    row["Casos de uso"] ??
    row["Cas d'usage principaux"] ??
    row["Hauptanwendungsfälle"] ??
    ""
  );
}

/** Journey / customer journey column (localized tab headers). */
function rowJourneyCell(row) {
  return row.Journey ?? row.journey ?? row.Recorrido ?? row.Parcours ?? row.Kundenreise ?? "";
}

/** Content type column (localized). */
function rowContentTypeCell(row) {
  return (
    row["Content Type"] ??
    row["Content type"] ??
    row["Tipo de contenido"] ??
    row["Type de contenu"] ??
    row["Content-Typ"] ??
    ""
  );
}

function rowLanguageCell(row) {
  return row.Language ?? row.language ?? row["Sprache / Region"] ?? row["Langue / région"] ?? "";
}

function rowRegionCell(row) {
  return row.Region ?? row.region ?? "";
}

/** Turn inventory use-case lists into a single display line (matches portal · separator). */
function formatUseCasesDisplay(raw) {
  const s = decodeCell(String(raw ?? "").trim());
  if (!s) return "";
  return s
    .split(/[;]+/g)
    .map((p) => decodeCell(p.trim()))
    .filter(Boolean)
    .join(" · ");
}

function cellSummary(row, kind) {
  const em = "\u2014"; // —
  const en = "\u2013"; // –
  const pairs =
    kind === "what"
      ? [
          // V2 aligned with portal copy / localized inventory tabs
          "What it is",
          "Qué es",
          "De quoi s'agit-il",
          "Was es ist",
          [`Summary ${em} What`, `Summary ${en} What`],
          ["Summary — What", "Summary - What", "Summary – What"],
          ["Summary What", "What"],
          ["Título | Resumen — Qué", "Título | Resumen - Qué", "Título | Resumen – Qué"],
          ["Titre | Résumé — Quoi", "Titre | Résumé - Quoi", "Titre | Résumé – Quoi"],
          ["Titel | Zusammenfassung — Was", "Titel | Zusammenfassung - Was", "Titel | Zusammenfassung – Was"],
        ]
      : kind === "why"
        ? [
            "Why it's important",
            "Por qué es importante",
            "Pourquoi c'est important",
            "Warum es wichtig ist",
            [`Summary ${em} Why`, `Summary ${en} Why`],
            ["Summary — Why", "Summary - Why", "Summary – Why"],
            ["Summary Why", "Why"],
            ["Título | Resumen — Por qué", "Título | Resumen - Por qué", "Título | Resumen – Por qué"],
            ["Titre | Résumé — Pourquoi", "Titre | Résumé - Pourquoi", "Titre | Résumé – Pourquoi"],
            ["Titel | Zusammenfassung — Warum", "Titel | Zusammenfassung - Warum", "Titel | Zusammenfassung – Warum"],
          ]
        : [
            "How to use it",
            "Cómo usarlo",
            "Comment l'utiliser",
            "Anwendung",
            [`Summary ${em} How`, `Summary ${en} How`],
            ["Summary — How", "Summary - How", "Summary – How"],
            ["Summary How", "How"],
            ["Título | Resumen — Cómo", "Título | Resumen - Cómo", "Título | Resumen – Cómo"],
            ["Titre | Résumé — Comment", "Titre | Résumé - Comment", "Titre | Résumé – Comment"],
            ["Titel | Zusammenfassung — Wie", "Titel | Zusammenfassung - Wie", "Titel | Zusammenfassung – Wie"],
          ];

  for (const group of pairs) {
    const candidates = Array.isArray(group) ? group : [group];
    for (const k of candidates) {
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

/** Map inventory Language / combined cells to catalog `AssetLanguage` enum. */
function pickCatalogLanguage(row) {
  const raw = rowLanguageCell(row);
  let s = decodeCell(String(raw || "English").trim()) || "English";
  const firstToken = s.split(/[·|/]/)[0].trim();
  const candidate = ASSET_LANGUAGES.has(s) ? s : firstToken;
  if (ASSET_LANGUAGES.has(candidate)) return candidate;
  const low = firstToken.toLowerCase();
  if (/deutsch|^de$/i.test(low)) return "German";
  if (/español|^es$|espanol/i.test(low)) return "Spanish";
  if (/français|^fr$|francais/i.test(low)) return "French";
  if (/português|portuguese|^pt/i.test(low)) return "Portuguese";
  if (/italiano|^it$/i.test(low)) return "Italian";
  if (/english|^en$/i.test(low)) return "English";
  return "English";
}

function rowToAsset(row, index) {
  const filename = decodeCell(rowFilename(row));
  const title = decodeCell(rowTitle(row)) || filename;
  const journeyRaw = decodeCell(String(rowJourneyCell(row) ?? "").trim());
  const journey = JOURNEYS.has(journeyRaw) ? journeyRaw : "Get Online";
  const productCategory = mapProductCategory(rowProductCategoryCell(row));
  const contentType = mapContentType(
    rowContentTypeCell(row),
    row["File Type"] ?? row["File type"] ?? ""
  );
  const useCases = mapUseCases(rowUseCasesCell(row));
  const summaryWhat = cellSummary(row, "what");
  const summaryWhy = cellSummary(row, "why");
  const summaryHow = cellSummary(row, "how");
  let language = pickCatalogLanguage(row);
  if (!ASSET_LANGUAGES.has(language)) language = "English";
  let region = String(rowRegionCell(row) || "Global").trim() || "Global";
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

function normInventoryFileKey(filename) {
  const raw = decodeCell(String(filename ?? "").trim());
  if (!raw) return "";
  const base = basenameOnly(raw);
  return base.trim().toLowerCase();
}

/**
 * V2 workbook: tabs like "Asset Inventory English", "Asset Inventory Spanish (MX)".
 * Returns app locale key, or null if not a localized inventory tab.
 */
function localeFromLocalizedAssetInventorySheet(sheetName) {
  const l = String(sheetName).trim().toLowerCase();
  if (!l.includes("asset") || !l.includes("inventory")) return null;
  if (l.includes("new assets")) return null;
  if (l === "asset inventory") return "en";
  if (/\benglish\b/.test(l)) return "en";
  if (/\bspanish\b/.test(l) || /\(\s*mx\s*\)/.test(l)) return "es-MX";
  if (/\bfrench\b/.test(l) || /\(\s*can\s*\)/.test(l)) return "fr-CA";
  if (/\bgerman\b/.test(l)) return "de";
  return null;
}

/**
 * Merge per-locale inventory rows onto assets (matched by Filename basename).
 * Carries title, summaries, and display labels from columns A–O style tabs (journey, category, type, use cases, language, region).
 */
function mergeAssetI18nFromWorkbook(assets, wb) {
  /** @type {Map<string, Record<string, Record<string, unknown>>>} */
  const byFile = new Map();

  for (const sheetName of wb.SheetNames) {
    const locale = localeFromLocalizedAssetInventorySheet(sheetName);
    if (!locale || locale === "en") continue;

    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
    console.log(`[i18n] "${sheetName.trim()}" → ${locale} (${rows.length} row(s))`);

    for (const row of rows) {
      const fn = rowFilename(row);
      if (!String(fn).trim()) continue;
      const key = normInventoryFileKey(fn);
      if (!key) continue;

      const title = decodeCell(String(rowTitle(row) || "").trim());
      const summaryWhat = cellSummary(row, "what");
      const summaryWhy = cellSummary(row, "why");
      const summaryHow = cellSummary(row, "how");
      const journeyDisplay = decodeCell(String(rowJourneyCell(row) || "").trim());
      const productCategoryDisplay = decodeCell(String(rowProductCategoryCell(row) || "").trim());
      const ct = decodeCell(String(rowContentTypeCell(row) || "").trim());
      const ft = decodeCell(String(row["File Type"] ?? row["File type"] ?? "").trim());
      const contentTypeDisplay = [ct, ft].filter(Boolean).join(" · ");
      const useCasesDisplay = formatUseCasesDisplay(rowUseCasesCell(row));
      const languageDisplay = decodeCell(String(rowLanguageCell(row) || "").trim());
      const regionDisplay = decodeCell(String(rowRegionCell(row) || "").trim());

      const hasAny =
        title ||
        summaryWhat ||
        summaryWhy ||
        summaryHow ||
        journeyDisplay ||
        productCategoryDisplay ||
        contentTypeDisplay ||
        useCasesDisplay ||
        languageDisplay ||
        regionDisplay;
      if (!hasAny) continue;

      let locs = byFile.get(key);
      if (!locs) {
        locs = {};
        byFile.set(key, locs);
      }
      locs[locale] = {
        ...(title ? { title } : {}),
        ...(summaryWhat ? { summaryWhat } : {}),
        ...(summaryWhy ? { summaryWhy } : {}),
        ...(summaryHow ? { summaryHow } : {}),
        ...(journeyDisplay ? { journeyDisplay } : {}),
        ...(productCategoryDisplay ? { productCategoryDisplay } : {}),
        ...(contentTypeDisplay ? { contentTypeDisplay } : {}),
        ...(useCasesDisplay ? { useCasesDisplay } : {}),
        ...(languageDisplay ? { languageDisplay } : {}),
        ...(regionDisplay ? { regionDisplay } : {}),
      };
    }
  }

  let attached = 0;
  for (const asset of assets) {
    const key = normInventoryFileKey(asset.fileName || "");
    const locs = byFile.get(key);
    if (!locs || !Object.keys(locs).length) continue;
    asset.i18n = locs;
    attached++;
  }
  console.log(`[i18n] Attached localized copy to ${attached} asset(s) (Filename match).`);
}

/** Product page slugs — must match `journeyProducts` in lib/assets.ts */
const KNOWN_PRODUCT_SLUGS = new Set([
  "domains",
  "logo",
  "email",
  "ssl",
  "hosting",
  "website",
  "directory-listings",
  "seo",
  "reputation-management",
  "ecommerce",
  "custom-website-development",
  "online-fax",
  "brand-monitoring",
  "marketing-360",
]);

const APP_LOCALES = new Set([
  "en",
  "fr-CA",
  "es-MX",
  "de",
]);

function normalizeProductSlug(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

function normalizeLocaleKey(raw) {
  const s = decodeCell(String(raw || "").trim());
  if (!s) return "en";
  const k = s.replace(/_/g, "-").toLowerCase();
  if (APP_LOCALES.has(k)) return k;
  const aliases = {
    english: "en",
    eng: "en",
    "fr-ca": "fr-CA",
    "fr_ca": "fr-CA",
    french: "fr-CA",
    français: "fr-CA",
    "french (canada)": "fr-CA",
    "spanish": "es-MX",
    español: "es-MX",
    "es-mx": "es-MX",
    "portuguese": "pt-BR",
    "pt-br": "pt-BR",
    german: "de",
    deutsch: "de",
    italian: "it",
    italiano: "it",
    greek: "el",
    romanian: "ro",
    bulgarian: "bg",
    hungarian: "hu",
    croatian: "hr",
    norwegian: "nb",
    swedish: "sv",
    albanian: "sq",
  };
  if (aliases[k]) return aliases[k];
  const noSpace = k.replace(/\s+/g, "");
  if (aliases[noSpace]) return aliases[noSpace];
  console.warn(`[product-page copy] Unknown locale "${raw}" — using "en".`);
  return "en";
}

/** e.g. "Product pages (fr-CA)" → fr-CA */
function localeHintFromSheetName(sheetName) {
  const m = String(sheetName).match(/\(\s*([^)]+?)\s*\)\s*$/);
  return m ? normalizeLocaleKey(m[1]) : null;
}

function isSkippedProductCopySheet(name) {
  const l = name.trim().toLowerCase();
  if (l === "summary") return true;
  if (l.includes("asset inventory")) return true;
  if (l.includes("new assets")) return true;
  if (l.includes("gaps")) return true;
  if (l.includes("duplicates")) return true;
  if (l.includes("product coverage matrix")) return true;
  return false;
}

function isCandidateProductCopySheet(name) {
  const l = name.trim().toLowerCase();
  if (isSkippedProductCopySheet(name)) return false;
  const env = process.env.PRODUCT_PAGE_COPY_SHEETS?.trim();
  if (env) {
    const allow = env.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    return allow.some((a) => l === a || l.includes(a));
  }
  return (
    (l.includes("product") &&
      (l.includes("page") || l.includes("preview") || l.includes("copy") || l.includes("ui"))) ||
    /^translations.*product/i.test(l) ||
    l.startsWith("products —") ||
    l.startsWith("products -")
  );
}

function rowPick(row, candidates) {
  const map = new Map(Object.keys(row).map((k) => [k.toLowerCase().trim(), k]));
  for (const c of candidates) {
    const key = map.get(c.toLowerCase());
    if (key !== undefined) {
      const v = row[key];
      if (v !== undefined && String(v).trim()) return decodeCell(String(v).trim());
    }
  }
  return "";
}

function looksLikeProductCopySheet(rows, sheetName) {
  if (!rows?.length) return false;
  const keys = Object.keys(rows[0]).map((k) => k.toLowerCase().trim());
  const slugish = keys.some(
    (k) => k.includes("slug") || k.includes("product id") || k === "product slug" || k === "page slug"
  );
  const descish = keys.some(
    (k) =>
      k.includes("description") ||
      k.includes("intro") ||
      k === "body" ||
      k.includes("preview") ||
      k.includes("copy")
  );
  const locish = keys.some((k) => k.includes("locale") || k.includes("language") || k === "lang");
  const sheetLocale = localeHintFromSheetName(sheetName);
  return slugish && descish && (locish || Boolean(sheetLocale));
}

function extractProductPageCopyFromWorkbook(wb) {
  /** @type {Record<string, Record<string, { label?: string; description?: string }>>} */
  const byLocale = {};

  for (const sheetName of wb.SheetNames) {
    if (!isCandidateProductCopySheet(sheetName)) continue;
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
    if (!rows.length) continue;
    if (!looksLikeProductCopySheet(rows, sheetName)) {
      console.log(
        `[product-page copy] Skip "${sheetName}" — headers need product slug + description (+ Locale column, or locale in sheet name like "… (fr-CA)").`
      );
      continue;
    }
    const sheetLocale = localeHintFromSheetName(sheetName);
    console.log(`[product-page copy] Reading sheet "${sheetName}"…`);
    for (const row of rows) {
      const slugRaw = rowPick(row, [
        "Product slug",
        "product slug",
        "Slug",
        "slug",
        "Page slug",
        "Product ID",
      ]);
      const slug = normalizeProductSlug(slugRaw);
      if (!slug) continue;

      if (!KNOWN_PRODUCT_SLUGS.has(slug)) {
        console.warn(`[product-page copy] Unknown product slug "${slug}" (from "${slugRaw}") — still writing row.`);
      }

      const localeRaw = rowPick(row, ["Locale", "language", "lang", "UI locale", "UI Locale"]);
      const locale = normalizeLocaleKey(localeRaw || sheetLocale || "en");

      const description = rowPick(row, [
        "Description",
        "Page description",
        "Intro",
        "Introduction",
        "Preview intro",
        "Body",
        "Copy",
      ]);
      const label = rowPick(row, ["Label", "Page title", "Title", "Product title", "Headline", "Name"]);

      if (!description && !label) continue;

      if (!byLocale[locale]) byLocale[locale] = {};
      byLocale[locale][slug] = {
        ...(label ? { label } : {}),
        ...(description ? { description } : {}),
      };
    }
  }

  if (!byLocale.en) byLocale.en = {};
  return byLocale;
}

function writeProductPageCopy(wb) {
  const data = extractProductPageCopyFromWorkbook(wb);
  const outPath = path.join(root, "lib", "product-page.copy.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  const locales = Object.keys(data).length;
  const entries = Object.values(data).reduce((n, o) => n + Object.keys(o).length, 0);
  console.log(`Wrote lib/product-page.copy.json (${locales} locale(s), ${entries} product row(s)).`);
}

function main() {
  const cliPath = process.argv[2];
  const primaryPath = resolvePrimaryWorkbook(cliPath);
  const { merged, wbPrimary } = loadMergedRows(primaryPath);

  const assets = merged
    .filter((row) => rowFilename(row))
    .map((row, i) => rowToAsset(row, i + 1));

  mergeAssetI18nFromWorkbook(assets, wbPrimary);

  const outPath = path.join(root, "lib", "assets.data.json");
  fs.writeFileSync(outPath, JSON.stringify(assets, null, 2) + "\n", "utf8");
  console.log(
    `Wrote ${assets.length} assets from ${path.basename(primaryPath)} (+ merges) → lib/assets.data.json`
  );

  writeProductPageCopy(wbPrimary);
}

main();
