import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { HomeHighlights } from "@/components/HomeHighlights";
import { SearchBar } from "@/components/SearchBar";
import { SupportedLanguages } from "@/components/SupportedLanguages";

const QUICK_LINKS = [
  { label: "Sales Decks", href: "/library?type=Presentation", icon: "fa-solid fa-chart-bar" },
  { label: "Training", href: "/library?type=Training", icon: "fa-solid fa-graduation-cap" },
  { label: "Videos", href: "/library?type=Video", icon: "fa-solid fa-video" },
  { label: "Playbooks", href: "/library?type=Playbook", icon: "fa-solid fa-book" },
  { label: "Case Studies", href: "/library?type=Case+Study", icon: "fa-solid fa-file-lines" },
  { label: "Documents", href: "/library?type=Document", icon: "fa-solid fa-file-pdf" },
];

export default async function Home() {
  const t = await getTranslations("hero");

  return (
    <>
      {/* Hero – dark background */}
      <section
        className="relative min-h-[50vh] flex flex-col justify-center items-center px-6 py-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-hands.png')" }}
      >
        <div className="absolute inset-0 bg-[#2A2930]/80" aria-hidden />
        <div className="relative z-10 max-w-4xl w-full text-center">
          <p className="uppercase mb-3 text-white/60 font-heading text-[0.7rem] font-semibold tracking-[0.25em]">
            {t("welcome")}
          </p>
          <h1
            className="font-heading font-light leading-tight mb-6 text-white"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)" }}
          >
            <span className="text-[#2CADB2]">Hostopia</span>Connects
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-white/70 font-body leading-relaxed">
            {t("tagline")}
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Jump To – quick content type links */}
      <section className="py-5 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-gray-400 font-body mr-2 uppercase tracking-wider">Jump to:</span>
            {QUICK_LINKS.map((link) => (
              <Link key={link.label} href={link.href}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-[#2CADB2] hover:text-[#2CADB2] transition-colors font-heading">
                  <i className={`${link.icon} text-[10px]`} />
                  {link.label}
                </span>
              </Link>
            ))}
            <Link href="/library">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2CADB2] text-white text-xs font-semibold hover:bg-[#249599] transition-colors font-heading">
                <i className="fa-solid fa-grid-2 text-[10px]" />
                Browse All
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Asset content languages — same as Library filter, with flags */}
      <SupportedLanguages />

      {/* Highlights – What's New, Most Popular, Most Downloaded */}
      <HomeHighlights />

      {/* Explore Library + Request a Document */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Explore Library card */}
            <div className="group rounded-2xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-lg hover:border-[#2CADB2]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#2CADB2]/10 flex items-center justify-center mb-5">
                <i className="fa-solid fa-grid-2 text-xl text-[#2CADB2]" />
              </div>
              <h3 className="font-bold text-xl text-[#24282B] mb-2">
                Explore Full Library
              </h3>
              <p className="text-[#555A5E] text-sm leading-relaxed mb-6">
                Browse and filter the complete asset collection by product, content type, language, and more.
              </p>
              <Link href="/library">
                <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#2CADB2] text-white text-sm font-semibold hover:bg-[#1d8f93] transition-colors shadow-sm">
                  Browse Library
                  <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Request a Document card */}
            <div className="group rounded-2xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-lg hover:border-[#F8CF41]/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#F8CF41]/15 flex items-center justify-center mb-5">
                <i className="fa-solid fa-lightbulb text-xl text-[#e0b82a]" />
              </div>
              <h3 className="font-bold text-xl text-[#24282B] mb-2">
                Can&apos;t Find What You Need?
              </h3>
              <p className="text-[#555A5E] text-sm leading-relaxed mb-6">
                Let us know what materials would help your team sell more effectively. We&apos;ll prioritize creating them.
              </p>
              <Link href="/request">
                <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-200 text-[#24282B] text-sm font-semibold hover:border-[#2CADB2] hover:text-[#2CADB2] transition-colors">
                  <i className="fa-solid fa-paper-plane text-xs" />
                  Request or Suggest a Document
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
