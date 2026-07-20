import path from "path";
import type { Browser } from "playwright-core";
import { isServerlessExportHost } from "./paths";

/**
 * Launch headless Chromium for local dev, CLI scripts, and API routes.
 * On Vercel/Lambda, uses @sparticuz/chromium + playwright-core.
 */
export async function launchBrowser(): Promise<Browser> {
  if (isServerlessExportHost()) {
    const [{ chromium: playwrightChromium }, chromiumMod] = await Promise.all([
      import("playwright-core"),
      import("@sparticuz/chromium"),
    ]);
    const chromium = chromiumMod.default;

    // Disable WebGL / graphics to avoid freezes on Lambda.
    chromium.setGraphicsMode = false;

    const executablePath = await chromium.executablePath();
    process.env.LD_LIBRARY_PATH = [
      path.dirname(executablePath),
      process.env.LD_LIBRARY_PATH,
    ]
      .filter(Boolean)
      .join(path.delimiter);

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  }

  // Local: full Playwright installs its own Chromium binary.
  const { chromium: playwrightChromium } = await import("playwright");
  return playwrightChromium.launch({ headless: true }) as unknown as Browser;
}
