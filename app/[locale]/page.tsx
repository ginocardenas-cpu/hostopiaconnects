import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { HomeHighlights } from "@/components/HomeHighlights";
import { BrowseSectionClient } from "@/components/BrowseSectionClient";

export default async function Home() {
  const t = await getTranslations("hero");

  return (
    <>
      <section
        className="relative min-h-[70vh] flex flex-col justify-center items-center px-6 py-16 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-hands.png')" }}
      >
        <div className="absolute inset-0 bg-[#24282B]/70" aria-hidden />
        <div className="relative z-10 max-w-4xl text-center">
          <p
            className="uppercase mb-4 text-white"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em"
            }}
          >
            {t("welcome")}
          </p>
          <h1
            className="font-black leading-tight mb-10"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)"
            }}
          >
            <span style={{ color: "#2CADB2" }}>Hostopia</span>
            <span className="text-white">Connects</span>
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-10 text-white"
            style={{
              fontFamily: "Raleway, sans-serif",
              lineHeight: 1.625
            }}
          >
            {t("tagline")}
          </p>
          <div className="max-w-2xl mx-auto mb-10">
            <input
              type="search"
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-white/30 bg-white/95 px-5 py-3 text-sm outline-none shadow-sm focus:border-[#2CADB2] focus:ring-1 focus:ring-[#2CADB2] text-[#24282B]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="#browse-options"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold shadow-md transition hover:shadow-lg"
              style={{
                fontFamily: "Montserrat, sans-serif",
                backgroundColor: "#F8CF41",
                color: "#24282B"
              }}
            >
              {t("startBrowsing")}
            </a>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold border-2 border-white/60 text-white transition hover:bg-white/10 hover:border-white"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("howItWorks")}
            </Link>
          </div>
        </div>
      </section>
      <HomeHighlights />

      <section id="browse-options" className="py-10 border-t border-black/5 bg-[#f7f6f2] scroll-mt-6">
        <div className="max-w-6xl mx-auto px-6">
          <BrowseSectionClient />
        </div>
      </section>
    </>
  );
}
