/** Shared constants for HTML → Office conversion pilot. */

export const DECK_LANGS = ["en", "fr", "es", "de", "pt"];

export const LANG_LABELS = {
  en: "English (American)",
  fr: "French (Canadian)",
  es: "Spanish (Mexican)",
  de: "Deutsch (German)",
  pt: "Portuguese (Brazilian)",
};

/** Hostopia brand tokens for generated Office files. */
export const BRAND = {
  teal: "2CADB2",
  charcoal: "1A1A1A",
  cream: "F5EFE3",
  gray: "4A4A4A",
  gold: "FFB800",
  fontFace: "Arial",
  fontFaceTitle: "Arial",
};

export const LOGO_DESIGN_PILOT = [
  {
    id: "presentation",
    htmlFile: "Professional Logo Design Presentation FINAL 2026-05-18.html",
    format: "pptx",
    outputBase: "Professional Logo Design Presentation",
  },
  {
    id: "sales-slick",
    htmlFile: "Professional Logo Design Sales Slick FINAL 2026-05-18.html",
    format: "docx",
    outputBase: "Professional Logo Design Sales Slick",
  },
  {
    id: "overview",
    htmlFile: "Professional Logo Design Overview FINAL 2026-05-18.html",
    format: "docx",
    outputBase: "Professional Logo Design Overview",
  },
];
