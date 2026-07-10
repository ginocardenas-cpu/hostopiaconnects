/** Plain browser function — read via fs.readFileSync, never import through tsx. */
async () => {
  // Hidden slides use visibility:hidden — innerText is empty; force visible for
  // images and any layout-dependent reads during export.
  document.querySelectorAll("section.slide, div.page, section.page").forEach((el) => {
    const node = el;
    node.style.visibility = "visible";
    node.style.opacity = "1";
    node.style.pointerEvents = "auto";
  });

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

  /** Use textContent — innerText is empty on visibility:hidden slides. */
  function elementText(el) {
    return cleanText(el.textContent || "");
  }

  function isChromeElement(el) {
    if (!el || el.nodeType !== 1) return true;
    if (el.closest(".chrome-top, .chrome-bot, .page-chrome-top, .page-chrome-bottom")) {
      return true;
    }
    const i18n = el.getAttribute("data-i18n") || "";
    if (/chrome|brand$/i.test(i18n)) return true;
    if (el.classList?.contains("brandmark")) return true;
    return false;
  }

  function pushBlock(blocks, seen, block) {
    if (block.type === "list") {
      const key = `list:${block.items.join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      blocks.push(block);
      return;
    }
    const t = cleanText(block.text);
    if (t.length <= 1 || seen.has(t)) return;
    seen.add(t);
    blocks.push({ ...block, text: t });
  }

  function classifyElement(el) {
    if (isChromeElement(el)) return null;
    if (el.matches("h1, h2, h3, h4")) {
      return {
        type: "heading",
        text: elementText(el),
        level: el.tagName || "H2",
      };
    }
    if (
      el.matches(
        ".p-hero, .eyebrow, .p-eyebrow, p[data-i18n$='.h'], p[data-i18n$='.h2'], [data-i18n$='.eyebrow']"
      )
    ) {
      return { type: "heading", text: elementText(el), level: "H2" };
    }
    if (el.matches("p")) {
      if (el.closest("li")) return null;
      return { type: "paragraph", text: elementText(el) };
    }
    if (el.matches("ul, ol")) {
      const items = [...el.querySelectorAll(":scope > li")]
        .map((li) => elementText(li))
        .filter((t) => t.length > 0);
      if (items.length === 0) return null;
      return { type: "list", items };
    }
    if (el.matches(".agenda-row, .stat-row, .feature-row")) {
      return { type: "row", el };
    }
    if (el.matches("[data-i18n*='.lbl'], [data-i18n*='.stat']")) {
      if (el.matches("h1,h2,h3,h4,p,li")) return null;
      const text = elementText(el);
      if (text.length > 2 && text.length < 80) {
        return { type: "heading", text, level: "H3" };
      }
    }
    return null;
  }

  function extractBlocks(root) {
    const blocks = [];
    const seen = new Set();
    const selector = [
      "h1",
      "h2",
      "h3",
      "h4",
      "p",
      "ul",
      "ol",
      ".p-hero",
      ".eyebrow",
      ".p-eyebrow",
      ".agenda-row",
      ".stat-row",
      ".feature-row",
      "[data-i18n$='.h']",
      "[data-i18n$='.h2']",
      "[data-i18n$='.eyebrow']",
      "[data-i18n*='.lbl']",
      "[data-i18n*='.stat']",
    ].join(", ");

    const elements = [...root.querySelectorAll(selector)].filter(
      (el) => !isChromeElement(el)
    );
    elements.sort((a, b) => {
      if (a === b) return 0;
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    for (const el of elements) {
      const classified = classifyElement(el);
      if (!classified) continue;

      if (classified.type === "row") {
        const row = classified.el;
        const heading = row.querySelector("h3, h4, .num + *, [data-i18n$='.h']");
        const body = row.querySelector("p, [data-i18n$='.p']");
        const headText = heading ? elementText(heading) : "";
        const bodyText = body ? elementText(body) : "";
        if (headText) {
          pushBlock(blocks, seen, {
            type: "heading",
            text: headText,
            level: "H3",
          });
        }
        if (bodyText) {
          pushBlock(blocks, seen, { type: "paragraph", text: bodyText });
        }
        continue;
      }

      if (classified.type === "list") {
        pushBlock(blocks, seen, classified);
        continue;
      }

      pushBlock(blocks, seen, classified);
    }

    if (blocks.length === 0) {
      root.querySelectorAll("[data-i18n]").forEach((el) => {
        if (isChromeElement(el)) return;
        pushBlock(blocks, seen, { type: "paragraph", text: elementText(el) });
      });
    }

    return blocks;
  }

  async function extractSection(section, index) {
    const label =
      section.getAttribute("data-screen-label")?.trim() ||
      cleanText(
        section.querySelector("[data-i18n*='chrome']")?.textContent || ""
      ) ||
      cleanText(
        section.querySelector(".page-chrome-top, .chrome-top")?.textContent ||
          ""
      ) ||
      `Section ${index + 1}`;

    const blocks = extractBlocks(section);

    const images = [];
    for (const img of section.querySelectorAll("img")) {
      if (isChromeElement(img)) continue;
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
}
