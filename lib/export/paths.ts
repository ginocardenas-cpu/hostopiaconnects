import path from "path";
import type { Asset } from "@/lib/assets";
import { getAssetSourceFileName } from "@/lib/assets";

export function htmlSourcePath(asset: Asset, root = process.cwd()): string {
  const fileName = getAssetSourceFileName(asset);
  return path.join(root, "public", "assets", fileName);
}

/** True on serverless hosts that need @sparticuz/chromium instead of full Playwright. */
export function isServerlessExportHost(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.CF_PAGES ||
      process.env.NEXT_PUBLIC_SERVERLESS_EXPORT === "1"
  );
}
