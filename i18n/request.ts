import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { AppLocale } from "./routing";
import { tier1Locales } from "./routing";

/**
 * Tier 1 locales (en, fr-CA, es-MX, pt-BR) load their own message file.
 * Tier 2 locales load English messages as fallback (UI in English).
 * Missing message files gracefully fall back to English.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale =
    locale && routing.locales.includes(locale as AppLocale)
      ? locale
      : routing.defaultLocale;

  const localeToUse: string = resolvedLocale ?? routing.defaultLocale;

  // Tier 1 locales have their own translation files; Tier 2 falls back to English
  const messageLocale = tier1Locales.includes(localeToUse as AppLocale)
    ? localeToUse
    : "en";

  let messages;
  try {
    messages = (await import(`../messages/${messageLocale}.json`)).default;
  } catch {
    // Fallback to English if message file is missing
    messages = (await import(`../messages/en.json`)).default;
  }

  return {
    locale: localeToUse,
    messages,
  };
});
