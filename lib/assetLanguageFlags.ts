import type { AssetLanguage } from "./assets";
import { allAssetLanguages } from "./assets";

/**
 * Representative flag per asset content language (matches library filter order).
 * English → US, French → Canada, Spanish → Mexico; others use a common country pairing.
 */
export const ASSET_LANGUAGE_FLAGS: Record<AssetLanguage, string> = {
  English: "🇺🇸",
  French: "🇨🇦",
  Spanish: "🇲🇽",
  Portuguese: "🇧🇷",
  German: "🇩🇪",
  Italian: "🇮🇹",
  Greek: "🇬🇷",
  Romanian: "🇷🇴",
  Bulgarian: "🇧🇬",
  Hungarian: "🇭🇺",
  Croatian: "🇭🇷",
  Norwegian: "🇳🇴",
  Swedish: "🇸🇪",
  Albanian: "🇦🇱",
};

/** Same order as the Asset Library language filter (`allAssetLanguages`). */
export const assetLanguagesWithFlags = allAssetLanguages.map((lang) => ({
  lang,
  flag: ASSET_LANGUAGE_FLAGS[lang],
}));
