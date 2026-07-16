import path from "path";
import type { Asset } from "@/lib/assets";
import { getAssetSourceFileName } from "@/lib/assets";

export function htmlSourcePath(asset: Asset, root = process.cwd()): string {
  const fileName = getAssetSourceFileName(asset);
  return path.join(root, "public", "assets", fileName);
}

/** True on hosts where Playwright/Chromium is not available for PDF/Office export. */
export function isServerlessExportHost(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.CF_PAGES ||
      process.env.NEXT_PUBLIC_SERVERLESS_EXPORT === "1"
  );
}
