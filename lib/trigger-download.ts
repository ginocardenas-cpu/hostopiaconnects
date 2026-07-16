import {
  slimBrandProfileForExport,
  type BrandProfile,
} from "@/lib/brand-profile";
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

export type DownloadPhase =
  | "idle"
  | "preparing"
  | "rendering"
  | "downloading"
  | "packaging"
  | "complete"
  | "error";

export interface DownloadProgress {
  phase: DownloadPhase;
  /** 0–100 */
  percent: number;
  /** Estimated seconds remaining; null when unknown */
  etaSeconds: number | null;
  message?: string;
  currentFile?: string;
  fileIndex?: number;
  fileCount?: number;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

interface ResolvedDownload {
  blob: Blob;
  fileName: string;
}

function isFetchDownloadUrl(fileUrl: string): boolean {
  return (
    fileUrl.startsWith("/api/download") || fileUrl.startsWith("/api/export")
  );
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

function withExtension(fileName: string, format: ExportFormat): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  return `${base}.${format}`;
}

function fileNameFromDisposition(
  header: string | null,
  fallback: string
): string {
  if (!header) return fallback;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim());
    } catch {
      /* ignore */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain?.[1]?.trim() || fallback;
}

/** Soft progress ticker while waiting on server-side render (no Content-Length yet). */
function startIndeterminateProgress(
  onProgress: ProgressCallback | undefined,
  phase: DownloadPhase,
  opts: {
    startPercent: number;
    maxPercent: number;
    estimatedTotalMs: number;
    currentFile?: string;
    fileIndex?: number;
    fileCount?: number;
  }
): () => void {
  if (!onProgress) return () => undefined;

  const started = Date.now();
  const tick = () => {
    const elapsed = Date.now() - started;
    const ratio = Math.min(1, elapsed / opts.estimatedTotalMs);
    const percent =
      opts.startPercent +
      (opts.maxPercent - opts.startPercent) * (1 - Math.exp(-2.2 * ratio));
    const remaining = Math.max(
      0,
      Math.ceil((opts.estimatedTotalMs - elapsed) / 1000)
    );
    onProgress({
      phase,
      percent: Math.min(opts.maxPercent, Math.round(percent)),
      etaSeconds: remaining,
      currentFile: opts.currentFile,
      fileIndex: opts.fileIndex,
      fileCount: opts.fileCount,
    });
  };

  tick();
  const id = setInterval(tick, 400);
  return () => clearInterval(id);
}

async function readResponseBlob(
  response: Response,
  onProgress?: ProgressCallback,
  meta?: { currentFile?: string; fileIndex?: number; fileCount?: number }
): Promise<Blob> {
  const total = Number(response.headers.get("content-length") || 0);
  if (!response.body || !total || !onProgress) {
    return response.blob();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  const started = Date.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      const percent = Math.min(99, Math.round((received / total) * 100));
      const elapsed = Math.max(1, Date.now() - started);
      const rate = received / elapsed;
      const remainingBytes = Math.max(0, total - received);
      const etaSeconds =
        rate > 0 ? Math.max(1, Math.ceil(remainingBytes / rate / 1000)) : null;
      onProgress({
        phase: "downloading",
        percent,
        etaSeconds,
        currentFile: meta?.currentFile,
        fileIndex: meta?.fileIndex,
        fileCount: meta?.fileCount,
      });
    }
  }

  return new Blob(chunks as BlobPart[]);
}

async function postExportBlob(
  file: DownloadDescriptor,
  onProgress?: ProgressCallback,
  meta?: { fileIndex?: number; fileCount?: number }
): Promise<ResolvedDownload> {
  if (!file.assetId || !file.exportFormat) {
    throw new Error("Missing export metadata");
  }

  const stop = startIndeterminateProgress(onProgress, "rendering", {
    startPercent: 5,
    maxPercent: 88,
    estimatedTotalMs: file.brandProfile ? 45_000 : 35_000,
    currentFile: file.fileName,
    fileIndex: meta?.fileIndex,
    fileCount: meta?.fileCount,
  });

  try {
    const brandProfile = file.brandProfile
      ? slimBrandProfileForExport(file.brandProfile)
      : undefined;

    const response = await fetch("/api/export", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetId: file.assetId,
        deckLang: file.deckLang ?? "en",
        format: file.exportFormat,
        ...(brandProfile ? { brandProfile } : {}),
      }),
    });

    stop();

    if (!response.ok) {
      let detail = "";
      try {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const json = (await response.json()) as { error?: string };
          detail = json.error ?? "";
        } else {
          detail = (await response.text().catch(() => "")).slice(0, 180);
        }
      } catch {
        detail = "";
      }
      throw new Error(
        detail
          ? detail.slice(0, 180)
          : `Export failed (${response.status})`
      );
    }

    const deliveredHeader = response.headers.get("X-Export-Format");
    const delivered =
      (deliveredHeader as ExportFormat | null) ||
      file.exportFormat ||
      "html";
    const fileName = fileNameFromDisposition(
      response.headers.get("Content-Disposition"),
      withExtension(file.fileName, delivered)
    );

    const blob = await readResponseBlob(response, onProgress, {
      currentFile: fileName,
      fileIndex: meta?.fileIndex,
      fileCount: meta?.fileCount,
    });

    return { blob, fileName };
  } catch (err) {
    stop();
    throw err;
  }
}

async function getFetchBlob(
  url: string,
  file: DownloadDescriptor,
  onProgress?: ProgressCallback,
  meta?: { fileIndex?: number; fileCount?: number }
): Promise<ResolvedDownload> {
  const stop = startIndeterminateProgress(onProgress, "preparing", {
    startPercent: 2,
    maxPercent: 40,
    estimatedTotalMs: 12_000,
    currentFile: file.fileName,
    fileIndex: meta?.fileIndex,
    fileCount: meta?.fileCount,
  });

  try {
    const response = await fetch(new URL(url, window.location.origin).href, {
      credentials: "same-origin",
      redirect: "follow",
    });
    stop();

    if (!response.ok) {
      throw new Error(`Failed to fetch (${response.status})`);
    }

    const blob = await readResponseBlob(response, onProgress, {
      currentFile: file.fileName,
      fileIndex: meta?.fileIndex,
      fileCount: meta?.fileCount,
    });
    return { blob, fileName: file.fileName };
  } catch (err) {
    stop();
    throw err;
  }
}

async function resolveFileBlob(
  file: DownloadDescriptor,
  onProgress?: ProgressCallback,
  meta?: { fileIndex?: number; fileCount?: number }
): Promise<ResolvedDownload> {
  onProgress?.({
    phase: "preparing",
    percent: 1,
    etaSeconds: null,
    currentFile: file.fileName,
    fileIndex: meta?.fileIndex,
    fileCount: meta?.fileCount,
  });

  if (file.useExportPost) {
    try {
      return await postExportBlob(file, onProgress, meta);
    } catch (primaryError) {
      if (
        file.assetId &&
        file.exportFormat &&
        file.exportFormat !== "html"
      ) {
        try {
          const htmlFile = {
            ...file,
            exportFormat: "html" as const,
            fileName: withExtension(file.fileName, "html"),
          };
          return await postExportBlob(htmlFile, onProgress, meta);
        } catch {
          throw primaryError;
        }
      }
      throw primaryError;
    }
  }

  if (file.requiresGeneration || isFetchDownloadUrl(file.fileUrl)) {
    try {
      return await getFetchBlob(file.fileUrl, file, onProgress, meta);
    } catch {
      if (file.assetId && file.exportFormat) {
        return postExportBlob(file, onProgress, meta);
      }
      throw new Error(`Failed to download ${file.fileName}`);
    }
  }

  return getFetchBlob(file.fileUrl, file, onProgress, meta);
}

/** Download a file via API or static URL. */
export async function downloadFile(
  file: DownloadDescriptor,
  onProgress?: ProgressCallback
): Promise<void> {
  const { blob, fileName } = await resolveFileBlob(file, onProgress, {
    fileIndex: 1,
    fileCount: 1,
  });
  onProgress?.({
    phase: "complete",
    percent: 100,
    etaSeconds: 0,
    currentFile: fileName,
    fileIndex: 1,
    fileCount: 1,
  });
  triggerBlobDownload(blob, fileName);
}

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
  zipFileName = "hostopia-connects-resources.zip",
  onProgress?: ProgressCallback
): Promise<void> {
  if (files.length === 0) return;

  if (files.length === 1) {
    await downloadFile(files[0], onProgress);
    return;
  }

  const zip = await import("jszip").then((m) => new m.default());
  const resolvedNames: string[] = [];
  const buffers: ArrayBuffer[] = [];

  for (let i = 0; i < files.length; i++) {
    const { blob, fileName } = await resolveFileBlob(files[i], onProgress, {
      fileIndex: i + 1,
      fileCount: files.length,
    });
    resolvedNames.push(fileName);
    buffers.push(await blob.arrayBuffer());
  }

  const paths = uniqueZipPaths(resolvedNames);
  for (let i = 0; i < paths.length; i++) {
    zip.file(paths[i], buffers[i]);
  }

  onProgress?.({
    phase: "packaging",
    percent: 92,
    etaSeconds: 2,
    fileCount: files.length,
  });

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  onProgress?.({
    phase: "complete",
    percent: 100,
    etaSeconds: 0,
    fileCount: files.length,
  });

  triggerBlobDownload(blob, zipFileName);
}
