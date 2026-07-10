import fs from "fs";
import type { DeckLang } from "@/lib/html-deck-i18n";

const PIN_SCRIPT = (lang: DeckLang) => `<!-- Hostopia Connects export: language pinned to ${lang} -->
<script id="__hostopia_export_lang">
(function(){
  var lang=${JSON.stringify(lang)};
  function pin(){
    try{
      if(typeof applyLang==="function") applyLang(lang);
      var t=document.getElementById("lang-toggle");
      if(t) t.style.display="none";
      var s=document.getElementById("__portal_hide_toggle");
      if(!s&&document.head){
        s=document.createElement("style");
        s.id="__portal_hide_toggle";
        s.textContent="#lang-toggle{display:none!important}";
        document.head.appendChild(s);
      }
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",pin);
  else pin();
  var n=0;
  var iv=setInterval(function(){
  if(typeof applyLang==="function"||++n>90){ pin(); clearInterval(iv); }
  },500);
})();
</script>`;

/** Read HTML bundle and inject language pin script before </body>. */
export function generatePinnedHtmlBuffer(
  htmlPath: string,
  lang: DeckLang
): Buffer {
  const raw = fs.readFileSync(htmlPath, "utf8");
  const script = PIN_SCRIPT(lang);
  let html = raw;
  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${script}\n</body>`);
  } else {
    html = `${html}\n${script}`;
  }
  return Buffer.from(html, "utf8");
}
