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
        <h2
          className="font-black leading-tight"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
            color: "#24282B"
          }}
        >
          {t("title")}
        </h2>
        <p
          className="text-base max-w-2xl"
          style={{
            fontFamily: "Raleway, sans-serif",
            color: "#555A5E",
            lineHeight: 1.625
          }}
        >
          {t("subtitle")}
        </p>
        <ol className="list-decimal list-inside space-y-2 text-base max-w-2xl" style={{ fontFamily: "Raleway, sans-serif", color: "#555A5E", lineHeight: 1.625 }}>
          <li><strong style={{ color: "#24282B" }}>{t("step1")}</strong> – {t("step1Desc")}</li>
          <li><strong style={{ color: "#24282B" }}>{t("step2")}</strong> – {t("step2Desc")}</li>
          <li><strong style={{ color: "#24282B" }}>{t("step3")}</strong> – {t("step3Desc")}</li>
          <li><strong style={{ color: "#24282B" }}>{t("step4")}</strong> – {t("step4Desc")}</li>
        </ol>
        <div className="pt-2">
          <p className="font-semibold text-[#24282B]" style={{ fontFamily: "Montserrat, sans-serif" }}>{t("viewResults")}</p>
          <p className="text-sm mt-0.5 max-w-2xl" style={{ fontFamily: "Raleway, sans-serif", color: "#555A5E", lineHeight: 1.625 }}>
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
