"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UniqueAccordion } from "@/components/ui/interactive-accordion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function BrowseSectionClient() {
  const t = useTranslations("browse");
  const [showWizard, setShowWizard] = useState(false);

  if (showWizard) {
    return (
      <UniqueAccordion onStartOver={() => setShowWizard(false)} />
    );
  }

  return (
    <>
      <div className="space-y-4 mb-10">
        <h2 className="font-heading text-[clamp(1.75rem,3vw,2.25rem)] font-black leading-tight text-charcoal">
          {t("title")}
        </h2>
        <p className="font-body max-w-2xl text-base leading-relaxed text-gray-500">
          {t("subtitle")}
        </p>
        <ol className="font-body list-inside list-decimal max-w-2xl space-y-2 text-base leading-relaxed text-gray-500">
          <li>
            <strong className="font-semibold text-charcoal">{t("step1")}</strong> – {t("step1Desc")}
          </li>
          <li>
            <strong className="font-semibold text-charcoal">{t("step2")}</strong> – {t("step2Desc")}
          </li>
          <li>
            <strong className="font-semibold text-charcoal">{t("step3")}</strong> – {t("step3Desc")}
          </li>
          <li>
            <strong className="font-semibold text-charcoal">{t("step4")}</strong> – {t("step4Desc")}
          </li>
        </ol>
        <div className="pt-2">
          <p className="font-heading font-semibold text-charcoal">{t("viewResults")}</p>
          <p className="font-body mt-0.5 max-w-2xl text-sm leading-relaxed text-gray-500">
            {t("viewResultsDesc")}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-6">
        <InteractiveHoverButton
          text={t("begin")}
          onClick={() => setShowWizard(true)}
          className="!w-auto min-w-[140px] px-6"
        />
      </div>
    </>
  );
}
