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
        <div className="absolute inset-0 bg-charcoal/70" aria-hidden />
        <div className="relative z-10 max-w-4xl text-center">
          <p className="mb-4 font-heading text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white">
            {t("welcome")}
          </p>
          <h1 className="mb-10 font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-tight">
            <span className="text-teal">Hostopia</span>
            <span className="text-white">Connects</span>
          </h1>
          <p className="font-body mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white">
            {t("tagline")}
          </p>
          <div className="mx-auto mb-10 max-w-2xl">
            <input
              type="search"
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-white/30 bg-white/95 px-5 py-3 font-body text-sm text-charcoal shadow-sm outline-none focus:border-teal focus:ring-1 focus:ring-teal"
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/60 px-8 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 font-heading"
            >
              {t("howItWorks")}
            </Link>
          </div>
        </div>
      </section>
      <HomeHighlights />

      <section id="browse-options" className="py-10 border-t border-black/5 bg-cream scroll-mt-6">
        <div className="max-w-6xl mx-auto px-6">
          <BrowseSectionClient />
        </div>
      </section>
    </>
  );
}
