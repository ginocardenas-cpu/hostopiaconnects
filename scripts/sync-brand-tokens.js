/* eslint-disable */
// One-off: replace hardcoded Hostopia hex with Tailwind token classes.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const SCAN_DIRS = ["app", "components"];
const SCAN_EXT = new Set([".tsx", ".ts"]);

// Order matters: longer / more specific first
const REPLACEMENTS = [
  // Opacity variants with hex
  [/text-\[#24282B\]\/80/gi, "text-charcoal/80"],
  [/text-\[#24282B\]\/70/gi, "text-charcoal/70"],
  [/border-\[#24282B\]\/20/gi, "border-charcoal/20"],
  [/border-\[#2CADB2\]\/60/gi, "border-teal/60"],
  [/border-\[#2CADB2\]\/40/gi, "border-teal/40"],
  [/border-\[#2CADB2\]\/30/gi, "border-teal/30"],
  [/border-\[#2CADB2\]\/20/gi, "border-teal/20"],
  [/border-\[#F8CF41\]\/40/gi, "border-gold/40"],
  [/hover:border-\[#2CADB2\]\/60/gi, "hover:border-teal/60"],
  [/hover:border-\[#2CADB2\]\/30/gi, "hover:border-teal/30"],
  [/hover:border-\[#2CADB2\]\/20/gi, "hover:border-teal/20"],
  [/hover:border-\[#F8CF41\]\/40/gi, "hover:border-gold/40"],
  [/bg-\[#2CADB2\]\/20/gi, "bg-teal/20"],
  [/bg-\[#2CADB2\]\/15/gi, "bg-teal/15"],
  [/bg-\[#2CADB2\]\/10/gi, "bg-teal/10"],
  [/bg-\[#F8CF41\]\/15/gi, "bg-gold/15"],
  [/bg-\[#F8CF41\]\/20/gi, "bg-gold/20"],
  [/from-\[#2CADB2\]\/10/gi, "from-teal/10"],
  [/via-\[#F8CF41\]\/15/gi, "via-gold/15"],
  [/via-\[#F8CF41\]\/20/gi, "via-gold/20"],
  [/hover:bg-\[#2CADB2\]\/10/gi, "hover:bg-teal/10"],
  [/hover:bg-\[#2CADB2\]\/20/gi, "hover:bg-teal/20"],
  [/hover:border-\[#2CADB2\]/gi, "hover:border-teal"],
  [/focus:border-\[#2CADB2\]/gi, "focus:border-teal"],
  [/focus:ring-\[#2CADB2\]/gi, "focus:ring-teal"],
  [/focus-visible:ring-\[#2CADB2\]/gi, "focus-visible:ring-teal"],
  [/hover:text-\[#249599\]/gi, "hover:text-teal-dark"],
  [/hover:bg-\[#249599\]/gi, "hover:bg-teal-dark"],
  [/hover:bg-\[#1d8f93\]/gi, "hover:bg-teal-dark"],
  [/hover:text-\[#2CADB2\]/gi, "hover:text-teal"],
  [/hover:bg-\[#f7f6f2\]/gi, "hover:bg-cream"],
  [/hover:bg-\[#ecebe6\]/gi, "hover:bg-cream-muted"],
  [/hover:bg-\[#f0fbfa\]/gi, "hover:bg-teal-light"],
  // Solid hex in arbitrary values
  [/text-\[#2CADB2\]/gi, "text-teal"],
  [/text-\[#24282B\]/gi, "text-charcoal"],
  [/bg-\[#2CADB2\]/gi, "bg-teal"],
  [/bg-\[#24282B\]/gi, "bg-charcoal"],
  [/bg-\[#F8CF41\]/gi, "bg-gold"],
  [/bg-\[#f7f6f2\]/gi, "bg-cream"],
  [/bg-\[#ecebe6\]/gi, "bg-cream-muted"],
  [/bg-\[#f0fbfa\]/gi, "bg-teal-light"],
  [/bg-\[#e8f7f6\]/gi, "bg-teal-light"],
  [/border-\[#2CADB2\]/gi, "border-teal"],
  [/border-\[#5ab8b3\]/gi, "border-teal/70"],
  [/border-\[#24282B\]/gi, "border-charcoal"],
  // Inline style color strings (keep for style={{ color: ... }})
  [/color:\s*"#2CADB2"/gi, 'className token — fix manually'],
  [/color:\s*"#24282B"/gi, 'className token — fix manually'],
];

// Inline style object replacements
const STYLE_REPLACEMENTS = [
  {
    from: /style=\{\{\s*backgroundColor:\s*"#F8CF41",\s*color:\s*"#24282B"\s*\}\}/g,
    to: 'className="bg-gold text-charcoal"',
  },
  {
    from: /style=\{\{\s*fontFamily:\s*"Montserrat,\s*sans-serif",\s*color:\s*"#24282B"\s*\}\}/g,
    to: 'className="font-montserrat text-charcoal"',
  },
  {
    from: /style=\{\{\s*fontFamily:\s*"Raleway,\s*sans-serif",\s*color:\s*"#2CADB2"\s*\}\}/g,
    to: 'className="font-raleway text-teal"',
  },
  {
    from: /style=\{\{\s*fontFamily:\s*"Montserrat,\s*sans-serif"\s*\}\}/g,
    to: 'className="font-montserrat"',
  },
  {
    from: /style=\{\{\s*fontFamily:\s*"Raleway,\s*sans-serif"\s*\}\}/g,
    to: 'className="font-raleway"',
  },
  {
    from: /,\s*color:\s*"#24282B"\s*\}\}/g,
    to: " }}",
  },
  {
    from: /style=\{\{\s*color:\s*"#24282B"\s*\}\}/g,
    to: 'className="text-charcoal"',
  },
];

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(f, out);
    } else if (SCAN_EXT.has(path.extname(e.name))) out.push(f);
  }
}

const files = [];
for (const d of SCAN_DIRS) {
  const p = path.join(ROOT, d);
  if (fs.existsSync(p)) walk(p, files);
}

let changed = [];
for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const orig = text;
  for (const [re, rep] of REPLACEMENTS) {
    if (rep.includes("fix manually")) continue;
    text = text.replace(re, rep);
  }
  for (const { from, to } of STYLE_REPLACEMENTS) {
    text = text.replace(from, to);
  }
  // AssetCard lifecycle color map
  text = text.replace(/Domains:\s*"#2CADB2"/g, 'Domains: "#2cadb2" /* use text-teal in UI */');
  if (text !== orig) {
    changed.push(path.relative(ROOT, file));
    if (APPLY) fs.writeFileSync(file, text, "utf8");
  }
}

console.log(`${APPLY ? "Updated" : "Would update"} ${changed.length} files:`);
changed.forEach((f) => console.log("  " + f));
