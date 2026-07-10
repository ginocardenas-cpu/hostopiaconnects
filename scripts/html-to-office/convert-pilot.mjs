/**
 * @deprecated Use `npm run assets:convert-pilot` (tsx scripts/export-pregenerate.ts --pilot)
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");

const result = spawnSync(
  "npx",
  ["tsx", "scripts/export-pregenerate.ts", "--pilot"],
  { cwd: root, stdio: "inherit", shell: true }
);

process.exit(result.status ?? 1);
