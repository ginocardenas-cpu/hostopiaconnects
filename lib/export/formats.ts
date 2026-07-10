import type { ContentType } from "@/lib/assets";
import type { DeckLang } from "@/lib/html-deck-i18n";
import { assetSupportsDeckI18n } from "@/lib/html-deck-i18n";

export type ExportFormat = "pdf" | "pptx" | "docx" | "html";

export const EXPORT_FORMATS: ExportFormat[] = ["pdf", "pptx", "docx", "html"];

export const EXPORT_FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  pdf: "pdf",
  pptx: "pptx",
  docx: "docx",
  html: "html",
};

export const EXPORT_FORMAT_MIME: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  html: "text/html; charset=utf-8",
};

export function isHtmlExportable(fileName: string): boolean {
  return assetSupportsDeckI18n(fileName);
}

export function defaultExportFormat(
  contentType: ContentType,
  fileName: string
): ExportFormat {
  if (!isHtmlExportable(fileName)) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "pptx" || ext === "ppt") return "pptx";
    if (ext === "docx" || ext === "doc") return "docx";
    if (ext === "html" || ext === "htm") return "html";
    return "pdf";
  }
  if (contentType === "Presentation") return "pptx";
  return "docx";
}

export function availableExportFormats(
  contentType: ContentType,
  fileName: string
): ExportFormat[] {
  if (!isHtmlExportable(fileName)) {
    const fmt = defaultExportFormat(contentType, fileName);
    return [fmt];
  }
  if (contentType === "Presentation") {
    return ["pdf", "pptx", "docx", "html"];
  }
  return ["pdf", "docx", "html"];
}

export function exportFileName(
  assetTitle: string,
  lang: DeckLang | undefined,
  format: ExportFormat
): string {
  const ext = EXPORT_FORMAT_EXTENSIONS[format];
  const safeTitle = assetTitle.replace(/[<>:"/\\|?*]/g, "").trim();
  if (lang) {
    return `${safeTitle} - ${lang}.${ext}`;
  }
  return `${safeTitle}.${ext}`;
}

export function parseExportFormat(value: unknown): ExportFormat | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase() as ExportFormat;
  return EXPORT_FORMATS.includes(v) ? v : null;
}
