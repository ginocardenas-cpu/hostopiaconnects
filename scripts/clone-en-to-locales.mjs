/**
 * Copies messages/en.json to messages/{locale}.json for locales that don't
 * have a file yet (baseline before overlay merge in a separate step).
 * Optional: use after apply-locale-overlays for any locale missing from overlays.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));

const needBaseline = ["el", "ro", "bg", "hu", "hr", "nb", "sv", "sq"];
for (const code of needBaseline) {
  const target = path.join(messagesDir, `${code}.json`);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, JSON.stringify(en, null, 2) + "\n", "utf8");
    console.log("Created baseline", code + ".json");
  }
}
