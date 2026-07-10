import { chromium as playwrightChromium } from "playwright";

/** Launch headless Chromium for local dev, CLI scripts, and API routes. */
export async function launchBrowser() {
  return playwrightChromium.launch({ headless: true });
}
