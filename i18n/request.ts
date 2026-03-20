import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { AppLocale } from "./routing";
import { deepMergeMessages } from "@/lib/i18n/deepMergeMessages";

/**
 * English is the base catalog. Each locale file (`messages/{locale}.json`) is
 * merged on top so missing keys still show English. Missing files use English only.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale =
    locale && routing.locales.includes(locale as AppLocale)
      ? locale
      : routing.defaultLocale;

  const localeToUse: string = resolvedLocale ?? routing.defaultLocale;

  const en = (await import(`../messages/en.json`)).default as Record<
    string,
    unknown
  >;

  let messages: Record<string, unknown> = en;

  if (localeToUse !== "en") {
    try {
      const overlay = (await import(`../messages/${localeToUse}.json`))
        .default as Record<string, unknown>;
      messages = deepMergeMessages(en, overlay);
    } catch {
      messages = en;
    }
  }

  return {
    locale: localeToUse,
    messages,
  };
});
