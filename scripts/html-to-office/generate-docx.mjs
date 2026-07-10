import fs from "fs";
import path from "path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  PageBreak,
} from "docx";
import { BRAND } from "./constants.mjs";

function dataUrlToBuffer(dataUrl) {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Buffer.from(base64, "base64");
}

function headingLevel(tag) {
  if (tag === "H1") return HeadingLevel.HEADING_1;
  if (tag === "H2") return HeadingLevel.HEADING_2;
  if (tag === "H3") return HeadingLevel.HEADING_3;
  return HeadingLevel.HEADING_2;
}

/**
 * @param {import('./extract-bundle.mjs').ExtractedContent} content
 * @param {{ productTitle: string; lang: string; langLabel: string }} meta
 */
export async function writeDocumentDocx(content, meta, outPath) {
  const sections = content.pages.length > 0 ? content.pages : content.slides;
  if (sections.length === 0) {
    throw new Error("No pages found to export");
  }

  const children = [
    new Paragraph({
      children: [
        new TextRun({
          text: meta.productTitle,
          bold: true,
          size: 32,
          color: BRAND.teal,
        }),
      ],
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: meta.langLabel,
          italics: true,
          size: 20,
          color: BRAND.gray,
        }),
      ],
    }),
    new Paragraph({ text: "" }),
  ];

  sections.forEach((section, index) => {
    children.push(
      new Paragraph({
        text: section.label,
        heading: HeadingLevel.HEADING_1,
      })
    );

    for (const block of section.blocks) {
      if (block.type === "heading") {
        children.push(
          new Paragraph({
            text: block.text,
            heading: headingLevel(block.level),
          })
        );
      } else if (block.type === "paragraph") {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: block.text, size: 22 })],
            spacing: { after: 160 },
          })
        );
      } else if (block.type === "list") {
        for (const item of block.items) {
          children.push(
            new Paragraph({
              text: item,
              bullet: { level: 0 },
              spacing: { after: 80 },
            })
          );
        }
      }
    }

    const firstImage = section.images?.[0];
    if (firstImage?.dataUrl) {
      try {
        const buffer = dataUrlToBuffer(firstImage.dataUrl);
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: buffer,
                transformation: { width: 420, height: 260 },
              }),
            ],
            spacing: { before: 120, after: 120 },
          })
        );
      } catch {
        /* skip broken image */
      }
    }

    if (index < sections.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  const doc = new Document({
    creator: "Hostopia Connects",
    title: `${meta.productTitle} (${meta.langLabel})`,
    sections: [{ properties: {}, children }],
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
}
