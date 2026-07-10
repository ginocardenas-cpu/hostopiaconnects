import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");

function extractTemplateHtml(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(
    /<script type="__bundler\/template">([\s\S]*?)<\/script>/
  );
  if (!match) return null;
  return JSON.parse(match[1]);
}

function extractLangScript(raw) {
  const idx = raw.indexOf("const LANG = window.LANG");
  if (idx < 0) return null;
  // LANG is populated from preceding script src UUID - find script before applyLang block
  const langScriptMatch = raw.match(
    /<script src="([a-f0-9-]+)"><\/script>\s*<script>\s*const LANG = window\.LANG = \{\};/
  );
  return { idx, langScriptUuid: langScriptMatch?.[1] || null };
}

function countInTemplate(template, pattern) {
  return (template.match(pattern) || []).length;
}

const files = [
  "Professional Logo Design Presentation FINAL 2026-05-18.html",
  "Professional Logo Design Sales Slick FINAL 2026-05-18.html",
  "Professional Logo Design Overview FINAL 2026-05-18.html",
];

for (const file of files) {
  const fp = path.join(root, "public", "assets", file);
  const raw = fs.readFileSync(fp, "utf8");
  const template = extractTemplateHtml(fp);
  console.log("\n===", file, "===");
  console.log("template bytes:", template?.length || 0);
  if (template) {
    console.log("section.slide:", countInTemplate(template, /class=\\"slide\\"/g));
    console.log("section.page:", countInTemplate(template, /class=\\"page\\"/g));
    console.log("div.page:", countInTemplate(template, /class=\\"page\\"/g));
    console.log("data-i18n:", countInTemplate(template, /data-i18n=/g));
    console.log("snippet:", template.slice(template.indexOf("slide") - 20, template.indexOf("slide") + 400));
  }
  console.log("lang info:", extractLangScript(raw));
}
