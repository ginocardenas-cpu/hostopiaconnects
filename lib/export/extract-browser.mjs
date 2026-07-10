/** DOM extraction logic (runs inside Playwright — must stay plain JS, no tsx transforms). */
export const EXTRACT_FN = async () => {
  async function imageToDataUrl(img) {
    try {
      if (!img.src || img.naturalWidth < 16 || img.naturalHeight < 16) {
        return null;
      }
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  function cleanText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function extractBlocks(root) {
    const blocks = [];
    const seen = new Set();

    const pushText = (type, text, extra = {}) => {
      const t = cleanText(text);
      if (t.length <= 1 || seen.has(t)) return;
      seen.add(t);
      blocks.push({ type, text: t, ...extra });
    };

    root.querySelectorAll("h1, h2, h3, h4").forEach((el) => {
      pushText("heading", el.innerText, {
        level: el.tagName || "H2",
      });
    });

    root.querySelectorAll(".p-hero, .eyebrow, .p-eyebrow").forEach((el) => {
      if (el.matches("h1,h2,h3,h4")) return;
      pushText("heading", el.innerText, { level: "H2" });
    });

    root.querySelectorAll("p").forEach((el) => {
      if (el.closest("li")) return;
      pushText("paragraph", el.innerText);
    });

    root.querySelectorAll("ul, ol").forEach((list) => {
      const items = [...list.querySelectorAll(":scope > li")]
        .map((li) => cleanText(li.innerText))
        .filter((t) => t.length > 0);
      if (items.length === 0) return;
      const key = `list:${items.join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      blocks.push({ type: "list", items });
    });

    if (blocks.length === 0) {
      root.querySelectorAll("[data-i18n]").forEach((el) => {
        const text = cleanText(el.innerText);
        if (text.length > 2) pushText("paragraph", text);
      });
    }

    return blocks;
  }

  async function extractSection(section, index) {
    const label =
      section.getAttribute("data-screen-label")?.trim() ||
      cleanText(section.querySelector("[data-i18n*='chrome']")?.textContent || "") ||
      cleanText(section.querySelector(".page-chrome-top, .chrome-top")?.textContent || "") ||
      `Section ${index + 1}`;

    const blocks = extractBlocks(section);

    const images = [];
    for (const img of section.querySelectorAll("img")) {
      const dataUrl = await imageToDataUrl(img);
      if (dataUrl) images.push({ alt: img.alt || "", dataUrl });
    }

    return { label, blocks, images };
  }

  const slides = [];
  for (const [i, el] of [...document.querySelectorAll("section.slide")].entries()) {
    slides.push(await extractSection(el, i));
  }

  const pages = [];
  const pageEls = [...document.querySelectorAll("div.page, section.page")];
  for (const [i, el] of pageEls.entries()) {
    pages.push(await extractSection(el, i));
  }

  return {
    title: document.title || "",
    slides,
    pages,
  };
};
