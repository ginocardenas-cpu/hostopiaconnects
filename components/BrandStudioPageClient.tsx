"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useBrandProfile } from "@/components/BrandProfileProvider";
import { BrandStudioControls } from "@/components/BrandStudioControls";
import { createDefaultBrandProfile } from "@/lib/brand-profile";

export function BrandStudioPageClient() {
  const t = useTranslations("brandStudio");
  const { profile, updateProfile, saveProfile, resetProfile } = useBrandProfile();
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-8">
        <p className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3 font-raleway">
          {t("eyebrow")}
        </p>
        <h1
          className="font-black leading-tight mb-3 text-charcoal"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(1.8rem, 3vw, 2.3rem)",
          }}
        >
          {t("title")}
        </h1>
        <p className="text-sm text-gray-600 font-raleway leading-relaxed">
          {t("intro")}
        </p>
      </div>

      <div className="rounded-2xl border border-black/6 bg-white p-6 shadow-sm">
        <BrandStudioControls
          profile={draft}
          onChange={(patch) =>
            setDraft((prev) => ({
              ...prev,
              ...patch,
              colors: { ...prev.colors, ...(patch.colors ?? {}) },
              cta: patch.cta
                ? {
                    ...prev.cta,
                    ...patch.cta,
                    links: patch.cta.links ?? prev.cta.links,
                  }
                : prev.cta,
            }))
          }
          onSave={() => {
            updateProfile(draft);
            saveProfile();
          }}
          onReset={() => {
            const defaults = createDefaultBrandProfile();
            resetProfile();
            setDraft(defaults);
          }}
        />
      </div>

      <p className="mt-6 text-sm text-gray-600 font-raleway">
        {t("nextStep")}{" "}
        <Link href="/library" className="text-teal underline">
          {t("browseLibrary")}
        </Link>
      </p>
    </section>
  );
}
