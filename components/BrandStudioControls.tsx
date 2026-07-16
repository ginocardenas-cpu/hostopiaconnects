"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { BrandColors, BrandCtaLink, BrandProfile, CtaLinkType } from "@/lib/brand-profile";
import { updateCtaLink } from "@/lib/brand-profile";
import { compressLogoDataUrl } from "@/lib/compress-logo";

interface BrandStudioControlsProps {
  profile: BrandProfile;
  onChange: (patch: Partial<BrandProfile>) => void;
  onSave: () => void;
  onReset: () => void;
  compact?: boolean;
}

const FONT_OPTIONS = [
  "Montserrat",
  "Inter",
  "Raleway",
  "Arial",
  "Georgia",
  "Helvetica",
] as const;

const BRAND_COLOR_FIELDS: {
  key: keyof BrandColors;
  labelKey: string;
  hintKey: string;
}[] = [
  { key: "primary", labelKey: "colorPrimary", hintKey: "colorPrimaryHint" },
  { key: "secondary", labelKey: "colorSecondary", hintKey: "colorSecondaryHint" },
  { key: "accent", labelKey: "colorAccent1", hintKey: "colorAccent1Hint" },
  {
    key: "accentSecondary",
    labelKey: "colorAccent2",
    hintKey: "colorAccent2Hint",
  },
];

const SURFACE_COLOR_FIELDS: {
  key: keyof BrandColors;
  labelKey: string;
  hintKey: string;
}[] = [
  { key: "slide", labelKey: "colorSlide", hintKey: "colorSlideHint" },
  { key: "text", labelKey: "colorText", hintKey: "colorTextHint" },
];

const CTA_FIELDS: { type: CtaLinkType; labelKey: string; placeholderKey: string }[] = [
  { type: "website", labelKey: "ctaWebsite", placeholderKey: "ctaWebsitePlaceholder" },
  { type: "email", labelKey: "ctaEmail", placeholderKey: "ctaEmailPlaceholder" },
  { type: "phone", labelKey: "ctaPhone", placeholderKey: "ctaPhonePlaceholder" },
  { type: "linkedin", labelKey: "ctaLinkedin", placeholderKey: "ctaSocialPlaceholder" },
  { type: "facebook", labelKey: "ctaFacebook", placeholderKey: "ctaSocialPlaceholder" },
  { type: "instagram", labelKey: "ctaInstagram", placeholderKey: "ctaSocialPlaceholder" },
  { type: "x", labelKey: "ctaX", placeholderKey: "ctaSocialPlaceholder" },
];

export function BrandStudioControls({
  profile,
  onChange,
  onSave,
  onReset,
  compact = false,
}: BrandStudioControlsProps) {
  const t = useTranslations("brandStudio");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const id = window.setTimeout(() => setJustSaved(false), 2800);
    return () => window.clearTimeout(id);
  }, [justSaved]);

  const handleSaveClick = () => {
    onSave();
    setJustSaved(true);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      const compressed = await compressLogoDataUrl(reader.result);
      onChange({ logoDataUrl: compressed });
    };
    reader.readAsDataURL(file);
  };

  const patchColor = (key: keyof BrandColors, value: string) => {
    onChange({ colors: { ...profile.colors, [key]: value } });
  };

  const patchCta = (type: CtaLinkType, patch: Partial<Pick<BrandCtaLink, "value" | "enabled">>) => {
    onChange({ cta: updateCtaLink(profile, type, patch) });
  };

  return (
    <div className="space-y-8 font-raleway">
      <section>
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 font-montserrat mb-1">
          {t("brandSection")}
        </h2>
        <p className="text-xs text-gray-500 mb-4">{t("brandSectionHint")}</p>

        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">{t("profileName")}</span>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">{t("companyName")}</span>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder={t("companyNamePlaceholder")}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-[11px] text-gray-500">
              {t("companyNameHint")}
            </span>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">{t("logoUpload")}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
              className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-teal file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
            {profile.logoDataUrl ? (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.logoDataUrl}
                  alt=""
                  className="h-10 w-auto max-w-[120px] object-contain rounded border border-black/10 bg-white p-1"
                />
                <button
                  type="button"
                  onClick={() => onChange({ logoDataUrl: undefined })}
                  className="text-xs text-gray-500 hover:text-teal underline"
                >
                  {t("removeLogo")}
                </button>
              </div>
            ) : null}
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 font-montserrat mb-1">
          {t("colorsSection")}
        </h2>
        <p className="text-xs text-gray-500 mb-4">{t("colorsSectionHint")}</p>

        <div className="rounded-xl border border-black/8 bg-cream/30 p-4 mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 mb-3">
            {t("colorsBrandGroup")}
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            {BRAND_COLOR_FIELDS.map(({ key, labelKey }) => (
              <ColorSwatch
                key={key}
                label={t(labelKey)}
                value={profile.colors[key]}
                onChange={(value) => patchColor(key, value)}
              />
            ))}
          </div>
          <div className="space-y-3">
            {BRAND_COLOR_FIELDS.map(({ key, labelKey, hintKey }) => (
              <ColorField
                key={`detail-${key}`}
                label={t(labelKey)}
                hint={t(hintKey)}
                value={profile.colors[key]}
                onChange={(value) => patchColor(key, value)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-black/8 bg-cream/30 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 mb-3">
            {t("colorsSurfaceGroup")}
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            {SURFACE_COLOR_FIELDS.map(({ key, labelKey }) => (
              <ColorSwatch
                key={key}
                label={t(labelKey)}
                value={profile.colors[key]}
                onChange={(value) => patchColor(key, value)}
              />
            ))}
          </div>
          <div className="space-y-3">
            {SURFACE_COLOR_FIELDS.map(({ key, labelKey, hintKey }) => (
              <ColorField
                key={`detail-${key}`}
                label={t(labelKey)}
                hint={t(hintKey)}
                value={profile.colors[key]}
                onChange={(value) => patchColor(key, value)}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 font-montserrat mb-1">
          {t("contentSection")}
        </h2>
        <p className="text-xs text-gray-500 mb-4">{t("contentSectionHint")}</p>
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">{t("contentDescription")}</span>
            <textarea
              value={profile.content.presentationDescription}
              onChange={(e) =>
                onChange({
                  content: {
                    ...profile.content,
                    presentationDescription: e.target.value,
                  },
                })
              }
              rows={3}
              placeholder={t("contentDescriptionPlaceholder")}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm resize-y"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">{t("contentAudience")}</span>
            <input
              type="text"
              value={profile.content.audience}
              onChange={(e) =>
                onChange({
                  content: { ...profile.content, audience: e.target.value },
                })
              }
              placeholder={t("contentAudiencePlaceholder")}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">{t("contentContact")}</span>
            <input
              type="email"
              value={profile.content.contactEmail}
              onChange={(e) =>
                onChange({
                  content: { ...profile.content, contactEmail: e.target.value },
                })
              }
              placeholder={t("contentContactPlaceholder")}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 font-montserrat mb-1">
          {t("typographySection")}
        </h2>
        <label className="block text-sm mt-3">
          <span className="mb-1 block text-gray-600">{t("fontFamily")}</span>
          <select
            value={profile.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 font-montserrat">
            {t("ctaSection")}
          </h2>
          <label className="inline-flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={profile.cta.enabled}
              onChange={(e) =>
                onChange({ cta: { ...profile.cta, enabled: e.target.checked } })
              }
              className="rounded border-gray-300 text-teal focus:ring-teal"
            />
            {t("ctaEnabled")}
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-4">{t("ctaSectionHint")}</p>

        <div className="space-y-3">
          {CTA_FIELDS.map(({ type, labelKey, placeholderKey }) => {
            const link =
              profile.cta.links.find((l) => l.type === type) ??
              ({ type, value: "", enabled: false } as BrandCtaLink);
            return (
              <div
                key={type}
                className="rounded-xl border border-black/8 bg-cream/40 p-3 space-y-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    disabled={!profile.cta.enabled}
                    onChange={(e) => patchCta(type, { enabled: e.target.checked })}
                    className="rounded border-gray-300 text-teal focus:ring-teal"
                  />
                  {t(labelKey)}
                </label>
                <input
                  type="text"
                  value={link.value}
                  disabled={!profile.cta.enabled || !link.enabled}
                  placeholder={t(placeholderKey)}
                  onChange={(e) => patchCta(type, { value: e.target.value })}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm disabled:opacity-50"
                />
              </div>
            );
          })}
        </div>
      </section>

      {!compact ? (
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveClick}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold font-montserrat transition ${
              justSaved
                ? "bg-teal-dark text-white"
                : "bg-teal text-white hover:bg-teal-dark"
            }`}
            aria-live="polite"
          >
            {justSaved ? (
              <>
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]"
                  aria-hidden
                >
                  ✓
                </span>
                {t("editsSaved")}
              </>
            ) : (
              t("saveProfile")
            )}
          </button>
          {justSaved ? (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-teal/30 bg-teal-light px-4 py-3 text-sm text-teal-dark"
            >
              <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal text-white text-xs font-bold"
                aria-hidden
              >
                ✓
              </span>
              <span className="font-semibold font-montserrat">{t("editsSaved")}</span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setJustSaved(false);
              onReset();
            }}
            className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 font-montserrat hover:bg-cream transition"
          >
            {t("resetProfile")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col items-center gap-1.5 text-center">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 cursor-pointer rounded-full border-2 border-white shadow-sm ring-1 ring-black/10 p-0"
        title={label}
      />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 max-w-[72px] leading-tight">
        {label}
      </span>
    </label>
  );
}

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-0.5 block font-medium text-gray-700">{label}</span>
      <span className="mb-2 block text-[11px] text-gray-500">{hint}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 cursor-pointer rounded border border-black/10 bg-white p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-2 py-2 text-xs font-mono"
        />
      </div>
    </label>
  );
}
