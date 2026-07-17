import type { Page } from "playwright";
import type { BrandProfile } from "@/lib/brand-profile";
import { buildBrandApplyScriptBody } from "@/lib/brand-apply";

/**
 * Apply brand customization on a Playwright page (PDF/extract pipeline).
 * Runs the same script as pinned HTML exports, then waits for its
 * post-applyLang re-apply pass to settle before rendering.
 */
export async function applyBrandOnPage(
  page: Page,
  profile: BrandProfile
): Promise<void> {
  const script = buildBrandApplyScriptBody(profile);
  await page.evaluate(script);
  await page.waitForTimeout(1000);
  await page.evaluate(script);
}
