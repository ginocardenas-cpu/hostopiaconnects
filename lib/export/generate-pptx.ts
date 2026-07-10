import PptxGenJS from "pptxgenjs";
import { BRAND } from "./brand";
import type { ExportBlock, ExportContentModel, ExportMeta } from "./content-model";
import { sectionsFromModel } from "./content-model";

function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

function labelCore(label: string): string {
  return label.replace(/^\d+\s+/, "").trim().toLowerCase();
}

function filterBlocks(blocks: ExportBlock[], sectionLabel: string): ExportBlock[] {
  const core = labelCore(sectionLabel);
  return blocks.filter((block) => {
    if (block.type === "heading" && block.text.trim().toLowerCase() === core) {
      return false;
    }
    if (
      block.type === "heading" &&
      block.text.length <= 3 &&
      /^[A-Z0-9\s]+$/.test(block.text)
    ) {
      return false;
    }
    return true;
  });
}

function estimateTextHeight(
  text: string,
  width: number,
  fontSize: number,
  min = 0.45
): number {
  const charsPerLine = Math.max(18, Math.floor((width * 72) / (fontSize * 0.55)));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return Math.max(min, (lines * fontSize) / 72 + 0.12);
}

export async function generatePptxBuffer(
  content: ExportContentModel,
  meta: ExportMeta
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Hostopia Connects";
  pptx.subject = meta.productTitle;
  pptx.title = `${meta.productTitle} (${meta.langLabel})`;

  const sections = sectionsFromModel(content);
  if (sections.length === 0) {
    throw new Error("No slides found to export");
  }

  for (const section of sections) {
    const slide = pptx.addSlide();
    slide.background = { color: BRAND.cream };

    slide.addText("Hostopia Connects", {
      x: 0.4,
      y: 0.2,
      w: 3,
      h: 0.25,
      fontSize: 9,
      color: BRAND.teal,
      bold: true,
      fontFace: BRAND.fontFace,
    });

    slide.addText(section.label, {
      x: 0.4,
      y: 0.45,
      w: 12,
      h: 0.35,
      fontSize: 10,
      color: BRAND.gray,
      fontFace: BRAND.fontFace,
    });

    const blocks = filterBlocks(section.blocks, section.label);
    const hasImages = (section.images?.length ?? 0) > 0;
    const contentWidth = hasImages ? 7.6 : 12;
    let y = 0.95;
    const maxY = 6.85;

    for (const block of blocks) {
      if (y >= maxY) break;

      if (block.type === "heading") {
        const fontSize =
          block.level === "H1" ? 28 : block.level === "H2" ? 22 : 16;
        const h = estimateTextHeight(block.text, contentWidth, fontSize, 0.55);
        slide.addText(block.text, {
          x: 0.5,
          y,
          w: contentWidth,
          h,
          fontSize,
          bold: true,
          color: BRAND.charcoal,
          fontFace: BRAND.fontFaceTitle,
          fit: "shrink",
          valign: "top",
        });
        y += h + 0.12;
      } else if (block.type === "paragraph") {
        const h = estimateTextHeight(block.text, contentWidth, 13, 0.55);
        slide.addText(block.text, {
          x: 0.5,
          y,
          w: contentWidth,
          h: Math.min(2.4, h),
          fontSize: 13,
          color: BRAND.gray,
          fontFace: BRAND.fontFace,
          valign: "top",
          fit: "shrink",
        });
        y += Math.min(2.5, h + 0.15);
      } else if (block.type === "list") {
        const h = Math.min(3.2, 0.32 * block.items.length + 0.35);
        const runs = block.items.map((item) => ({
          text: item,
          options: { bullet: true, breakLine: true },
        }));
        slide.addText(runs, {
          x: 0.65,
          y,
          w: contentWidth - 0.2,
          h,
          fontSize: 12,
          color: BRAND.gray,
          fontFace: BRAND.fontFace,
          valign: "top",
          fit: "shrink",
        });
        y += h + 0.15;
      }
    }

    const images = section.images ?? [];
    if (images.length === 1) {
      const img = images[0];
      if (img?.dataUrl) {
        slide.addImage({
          data: `image/png;base64,${dataUrlToBase64(img.dataUrl)}`,
          x: 8.4,
          y: 1.1,
          w: 4.2,
          h: 2.8,
        });
      }
    } else if (images.length > 1) {
      const cols = Math.min(3, images.length);
      const rows = Math.ceil(images.length / cols);
      const cellW = 3.8;
      const cellH = 1.6;
      const startX = 8.2;
      const startY = 1.0;

      images.slice(0, 9).forEach((img, index) => {
        if (!img.dataUrl) return;
        const col = index % cols;
        const row = Math.floor(index / cols);
        slide.addImage({
          data: `image/png;base64,${dataUrlToBase64(img.dataUrl)}`,
          x: startX + col * (cellW + 0.15),
          y: startY + row * (cellH + 0.15),
          w: cellW,
          h: cellH,
        });
      });
    }
  }

  const arrayBuffer = (await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}
