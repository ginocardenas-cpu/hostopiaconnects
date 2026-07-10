import fs from "fs";
import path from "path";
import PptxGenJS from "pptxgenjs";
import { BRAND } from "./constants.mjs";

function dataUrlToBase64(dataUrl) {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

/**
 * @param {import('./extract-bundle.mjs').ExtractedContent} content
 * @param {{ productTitle: string; lang: string; langLabel: string }} meta
 */
export async function writePresentationPptx(content, meta, outPath) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Hostopia Connects";
  pptx.subject = meta.productTitle;
  pptx.title = `${meta.productTitle} (${meta.langLabel})`;

  const sections = content.slides.length > 0 ? content.slides : content.pages;
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

    let y = 0.95;
    const maxY = 6.8;

    for (const block of section.blocks) {
      if (y >= maxY) break;

      if (block.type === "heading") {
        const fontSize = block.level === "H1" ? 28 : block.level === "H2" ? 22 : 16;
        slide.addText(block.text, {
          x: 0.5,
          y,
          w: 12,
          h: 0.65,
          fontSize,
          bold: true,
          color: BRAND.charcoal,
          fontFace: BRAND.fontFaceTitle,
        });
        y += fontSize >= 24 ? 0.85 : 0.65;
      } else if (block.type === "paragraph") {
        slide.addText(block.text, {
          x: 0.5,
          y,
          w: 12,
          h: 0.9,
          fontSize: 13,
          color: BRAND.gray,
          fontFace: BRAND.fontFace,
          valign: "top",
        });
        y += Math.min(1.1, 0.35 + block.text.length / 140);
      } else if (block.type === "list") {
        const runs = block.items.map((item) => ({
          text: item,
          options: { bullet: true, breakLine: true },
        }));
        slide.addText(runs, {
          x: 0.65,
          y,
          w: 11.5,
          h: Math.min(2.5, 0.35 * block.items.length + 0.3),
          fontSize: 12,
          color: BRAND.gray,
          fontFace: BRAND.fontFace,
          valign: "top",
        });
        y += Math.min(2.6, 0.4 * block.items.length + 0.35);
      }
    }

    const firstImage = section.images?.[0];
    if (firstImage?.dataUrl && y < 5.5) {
      slide.addImage({
        data: `image/png;base64,${dataUrlToBase64(firstImage.dataUrl)}`,
        x: 8.5,
        y: 1.2,
        w: 4,
        h: 2.5,
      });
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await pptx.writeFile({ fileName: outPath });
}
