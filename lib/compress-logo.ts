/** Resize/compress a logo data URL so brand exports stay under serverless body limits. */

const MAX_EDGE = 480;
const MAX_BYTES = 96_000;

function dataUrlByteLength(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return dataUrl.length;
  const b64 = dataUrl.slice(comma + 1);
  return Math.floor((b64.length * 3) / 4);
}

/**
 * Compress an image data URL for brand-profile storage and export payloads.
 * Returns the original string if compression is unavailable or already small.
 */
export async function compressLogoDataUrl(
  dataUrl: string,
  maxBytes = MAX_BYTES
): Promise<string> {
  if (!dataUrl.startsWith("data:image/") || dataUrlByteLength(dataUrl) <= maxBytes) {
    return dataUrl;
  }

  if (typeof document === "undefined") return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        let quality = 0.82;
        let out = canvas.toDataURL("image/jpeg", quality);
        while (dataUrlByteLength(out) > maxBytes && quality > 0.4) {
          quality -= 0.12;
          out = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrlByteLength(out) < dataUrlByteLength(dataUrl) ? out : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
