import fs from "fs";

const s = fs.readFileSync(
  "public/assets/Professional Logo Design Sales Slick FINAL 2026-05-18.html",
  "utf8"
);
const i = s.indexOf('class=\\"page');
console.log(s.slice(i, i + 900));
