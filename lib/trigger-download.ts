import JSZip from "jszip";

export interface DownloadDescriptor {
  fileUrl: string;
  fileName: string;
  requiresGeneration?: boolean;
}

/** Trigger a same-origin file download via a temporary anchor. */
export function triggerFileDownload(fileUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = fileUrl;
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
  const response = await fetch(file.fileUrl, {
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${file.fileName}`);
  }
  return response.blob();
}

/** Download a file, using fetch when served from the export API. */
export async function downloadFile(file: DownloadDescriptor): Promise<void> {
  if (file.requiresGeneration || file.fileUrl.startsWith("/api/export")) {
    const blob = await fetchFileBlob(file);
    triggerBlobDownload(blob, file.fileName);
    return;
  }
  triggerFileDownload(file.fileUrl, file.fileName);
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
    const file = files[i];
    const blob = await fetchFileBlob(file);
    zip.file(paths[i], await blob.arrayBuffer());
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  triggerBlobDownload(blob, zipFileName);
}
