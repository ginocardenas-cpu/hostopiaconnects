import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function generateMetadata() {
  const t = await getTranslations("howItWorks");
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorks");

  const steps = [
    { step: "1", titleKey: "step1Title" as const, descKey: "step1Desc" as const },
    { step: "2", titleKey: "step2Title" as const, descKey: "step2Desc" as const },
    { step: "3", titleKey: "step3Title" as const, descKey: "step3Desc" as const },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <p className="section-label mb-3">{t("title")}</p>
          <h1 className="mb-4 font-heading text-[clamp(2rem,4vw,3rem)] font-black leading-tight text-charcoal">
            {t("headline")}
          </h1>
          <p className="font-body max-w-xl text-base text-gray-600 md:text-lg">{t("intro")}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline font-heading"
        >
          {t("backToHome")}
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        {steps.map(({ step, titleKey, descKey }) => (
          <div
            key={step}
            className="rounded-2xl border border-black/5 bg-white p-6"
          >
            <span className="mb-3 inline-block font-heading text-3xl font-black text-teal">{step}</span>
            <h2 className="mb-2 font-heading text-xl font-black text-charcoal">{t(titleKey)}</h2>
            <p className="font-body text-sm text-gray-600">
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-teal/30 bg-teal-light p-6">
        <h2 className="mb-3 font-heading text-xl font-black text-charcoal">{t("leadCaptureTitle")}</h2>
        <p className="mb-4 font-body text-sm text-gray-700">{t("leadCaptureBody")}</p>
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2 text-sm font-bold text-charcoal transition hover:bg-gold-dark font-heading"
        >
          {t("goToMyResources")}
        </Link>
      </div>
    </section>
  );
}
