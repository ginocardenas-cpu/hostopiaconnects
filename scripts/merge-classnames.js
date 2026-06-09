/* eslint-disable */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(f, out);
    } else if (/\.tsx?$/.test(e.name)) out.push(f);
  }
}

const files = [];
for (const d of ["app", "components"]) walk(path.join(ROOT, d), files);

let count = 0;
for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const orig = text;
  for (let i = 0; i < 10; i++) {
    text = text.replace(/className="([^"]+)"\s+className="([^"]+)"/g, 'className="$1 $2"');
  }
  if (text !== orig) {
    fs.writeFileSync(file, text, "utf8");
    count++;
    console.log(path.relative(ROOT, file));
  }
}
console.log("Merged duplicate className in", count, "files");
