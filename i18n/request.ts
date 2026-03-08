import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale =
    locale && routing.locales.includes(locale as "en" | "es-MX")
      ? locale
      : routing.defaultLocale;

  const localeToUse: string = resolvedLocale ?? routing.defaultLocale;

  return {
    locale: localeToUse,
    messages: (await import(`../messages/${localeToUse}.json`)).default,
  };
});
