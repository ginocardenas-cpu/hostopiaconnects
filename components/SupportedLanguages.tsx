import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import { assetLanguagesWithFlags } from "@/lib/assetLanguageFlags";

export async function SupportedLanguages() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <section className="py-12 bg-white border-b border-gray-100" aria-labelledby="supported-languages-heading">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-[0.7rem] font-heading font-bold uppercase tracking-[0.2em] text-[#2CADB2] mb-2">
          {t("supportedLanguagesEyebrow")}
        </p>
        <h2
          id="supported-languages-heading"
          className="font-heading font-bold text-2xl text-[#24282B] mb-2"
        >
          {t("supportedLanguagesTitle")}
        </h2>
        <p className="text-[#555A5E] text-sm font-body leading-relaxed max-w-2xl mb-8">
          {t("supportedLanguagesSubtitle")}
        </p>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 list-none p-0 m-0">
          {assetLanguagesWithFlags.map(({ lang, flag }) => (
            <li key={lang}>
              <Link
                href={`/${locale}/library?language=${encodeURIComponent(lang)}`}
                className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-[#24282B] shadow-sm hover:border-[#2CADB2]/40 hover:shadow-md hover:text-[#2CADB2] transition-all duration-200"
              >
                <span className="text-xl emoji-flag shrink-0" aria-hidden>
                  {flag}
                </span>
                <span className="truncate font-heading">{lang}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center">
          <Link
            href={`/${locale}/library`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2CADB2] hover:text-[#1d8f93] transition-colors font-heading"
          >
            {t("supportedLanguagesViewAll")}
            <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
