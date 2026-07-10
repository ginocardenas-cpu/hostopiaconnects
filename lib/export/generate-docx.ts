import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  PageBreak,
} from "docx";
import { BRAND } from "./brand";
import type { ExportContentModel, ExportMeta } from "./content-model";
import { sectionsFromModel } from "./content-model";

function dataUrlToBuffer(dataUrl: string): Buffer {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Buffer.from(base64, "base64");
}

function headingLevel(tag: string) {
  if (tag === "H1") return HeadingLevel.HEADING_1;
  if (tag === "H2") return HeadingLevel.HEADING_2;
  if (tag === "H3") return HeadingLevel.HEADING_3;
  return HeadingLevel.HEADING_2;
}

export async function generateDocxBuffer(
  content: ExportContentModel,
  meta: ExportMeta
): Promise<Buffer> {
  const sections = sectionsFromModel(content);
  if (sections.length === 0) {
    throw new Error("No pages found to export");
  }

  const children: Paragraph[] = [
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
                type: "png",
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

  return Packer.toBuffer(doc);
}
