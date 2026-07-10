/** Structured content extracted from rendered HTML bundles. */

export type ExportBlock =
  | { type: "heading"; text: string; level: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export interface ExportImage {
  alt: string;
  dataUrl: string;
}

export interface ExportSection {
  label: string;
  blocks: ExportBlock[];
  images: ExportImage[];
}

export interface ExportContentModel {
  title: string;
  slides: ExportSection[];
  pages: ExportSection[];
}

export interface ExportMeta {
  productTitle: string;
  lang: string;
  langLabel: string;
}

export function sectionsFromModel(
  content: ExportContentModel
): ExportSection[] {
  return content.slides.length > 0 ? content.slides : content.pages;
}

export function productTitleFromContent(
  content: ExportContentModel,
  fallback: string
): string {
  if (content.title) {
    return content.title
      .replace(/^Sales (Deck|Slick) — /i, "")
      .replace(/^Product Overview — /i, "")
      .trim();
  }
  return fallback;
}
