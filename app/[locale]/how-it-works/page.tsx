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
          <p
            className="uppercase tracking-[0.2em] text-xs mb-3 text-gray-500"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {t("title")}
          </p>
          <h1
            className="font-black leading-tight mb-4"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#24282B"
            }}
          >
            {t("headline")}
          </h1>
          <p
            className="text-base md:text-lg text-gray-600 max-w-xl"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {t("intro")}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2CADB2] hover:underline"
          style={{ fontFamily: "Montserrat, sans-serif" }}
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
            <span
              className="inline-block text-3xl font-black mb-3"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#2CADB2" }}
            >
              {step}
            </span>
            <h2
              className="font-black mb-2"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "1.25rem",
                color: "#24282B"
              }}
            >
              {t(titleKey)}
            </h2>
            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2CADB2]/30 bg-[#f0fbfa] p-6">
        <h2
          className="font-black mb-3"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "1.25rem",
            color: "#24282B"
          }}
        >
          {t("leadCaptureTitle")}
        </h2>
        <p
          className="text-sm text-gray-700 mb-4"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {t("leadCaptureBody")}
        </p>
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-bold"
          style={{
            fontFamily: "Montserrat, sans-serif",
            backgroundColor: "#F8CF41",
            color: "#24282B"
          }}
        >
          {t("goToMyResources")}
        </Link>
      </div>
    </section>
  );
}
