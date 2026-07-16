import fs from "fs";

function inspectSlide(n: number) {
  const xml = fs.readFileSync(`tmp-pptx-unzip/ppt/slides/slide${n}.xml`, "utf8");
  const shapes = [...xml.matchAll(/<p:sp>[\s\S]*?<\/p:sp>/g)].map((m) => m[0]);
  const EMU = 914400;

  console.log(`\n=== slide ${n} (${shapes.length} shapes) ===`);
  for (const [i, s] of shapes.entries()) {
    const t = (s.match(/<a:t>([^<]*)<\/a:t>/) || [])[1] || "";
    const off = s.match(/<a:off x="(\d+)" y="(\d+)"\/>/);
    const ext = s.match(/<a:ext cx="(\d+)" cy="(\d+)"\/>/);
    const sz = (s.match(/<a:sz val="(\d+)"/) || [])[1];
    console.log({
      i,
      text: t.slice(0, 45),
      y: off ? +(off[2]) / EMU : null,
      h: ext ? +(ext[2]) / EMU : null,
      fontPt: sz ? +sz / 100 : null,
    });
  }
}

inspectSlide(1);
inspectSlide(4);
