import JSZip from "jszip";
import type { BrandProfile } from "@/lib/brand-profile";
import type { ExportFormat } from "@/lib/export/formats";
import type { DeckLang } from "@/lib/html-deck-i18n";

export interface DownloadDescriptor {
  fileUrl: string;
  fileName: string;
  requiresGeneration?: boolean;
  assetId?: string;
  deckLang?: DeckLang;
  exportFormat?: ExportFormat;
  brandProfile?: BrandProfile;
  useExportPost?: boolean;
}

function isFetchDownloadUrl(fileUrl: string): boolean {
  return (
    fileUrl.startsWith("/api/download") || fileUrl.startsWith("/api/export")
  );
}

/** Trigger a same-origin file download via a temporary anchor. */
export function triggerFileDownload(fileUrl: string, fileName: string): void {
  const url = fileUrl.startsWith("http")
    ? fileUrl
    : new URL(fileUrl, window.location.origin).href;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function fetchFileBlob(file: DownloadDescriptor): Promise<Blob> {
  const url = file.fileUrl.startsWith("http")
    ? file.fileUrl
    : new URL(file.fileUrl, window.location.origin).href;

  const response = await fetch(url, {
    credentials: "same-origin",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${file.fileName} (${response.status})`);
  }

  return response.blob();
}

async function postExportBlob(file: DownloadDescriptor): Promise<Blob> {
  if (!file.assetId || !file.exportFormat) {
    throw new Error("Missing export metadata");
  }

  const response = await fetch("/api/export", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assetId: file.assetId,
      deckLang: file.deckLang ?? "en",
      format: file.exportFormat,
      ...(file.brandProfile ? { brandProfile: file.brandProfile } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to export (${response.status})`);
  }

  return response.blob();
}

async function resolveFileBlob(file: DownloadDescriptor): Promise<Blob> {
  if (file.useExportPost) {
    return postExportBlob(file);
  }

  const tryFetch = async (url: string) => {
    const response = await fetch(new URL(url, window.location.origin).href, {
      credentials: "same-origin",
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch (${response.status})`);
    }
    return response.blob();
  };

  if (file.requiresGeneration || isFetchDownloadUrl(file.fileUrl)) {
    try {
      return await tryFetch(file.fileUrl);
    } catch {
      if (file.assetId && file.exportFormat) {
        return postExportBlob(file);
      }
      throw new Error(`Failed to download ${file.fileName}`);
    }
  }

  return fetchFileBlob(file);
}

/** Download a file via API or static URL. */
export async function downloadFile(file: DownloadDescriptor): Promise<void> {
  const blob = await resolveFileBlob(file);
  triggerBlobDownload(blob, file.fileName);
}

/** Ensure every entry in the zip has a unique path. */
function uniqueZipPaths(fileNames: string[]): string[] {
  const seen = new Map<string, number>();
  return fileNames.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    if (count === 0) return name;
    const dot = name.lastIndexOf(".");
    if (dot === -1) return `${name} (${count + 1})`;
    return `${name.slice(0, dot)} (${count + 1})${name.slice(dot)}`;
  });
}

export async function downloadFilesAsZip(
  files: DownloadDescriptor[],
  zipFileName = "hostopia-connects-resources.zip"
): Promise<void> {
  if (files.length === 0) return;

  if (files.length === 1) {
    await downloadFile(files[0]);
    return;
  }

  const zip = new JSZip();
  const paths = uniqueZipPaths(files.map((f) => f.fileName));

  for (let i = 0; i < files.length; i++) {
    const blob = await resolveFileBlob(files[i]);
    zip.file(paths[i], await blob.arrayBuffer());
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  triggerBlobDownload(blob, zipFileName);
}
