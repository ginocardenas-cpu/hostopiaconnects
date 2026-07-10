"use client";

import { useTranslations } from "next-intl";
import type { BrandProfile } from "@/lib/brand-profile";

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
  "Arial",
  "Georgia",
  "Helvetica",
] as const;

export function BrandStudioControls({
  profile,
  onChange,
  onSave,
  onReset,
  compact = false,
}: BrandStudioControlsProps) {
  const t = useTranslations("brandStudio");

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange({ logoDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 font-raleway">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 font-montserrat mb-3">
          {t("brandSection")}
        </h2>
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
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
            />
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

          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label={t("primaryColor")}
              value={profile.colors.primary}
              onChange={(primary) =>
                onChange({ colors: { ...profile.colors, primary } })
              }
            />
            <ColorField
              label={t("accentColor")}
              value={profile.colors.accent}
              onChange={(accent) =>
                onChange({ colors: { ...profile.colors, accent } })
              }
            />
            <ColorField
              label={t("backgroundColor")}
              value={profile.colors.background}
              onChange={(background) =>
                onChange({ colors: { ...profile.colors, background } })
              }
            />
            <ColorField
              label={t("textColor")}
              value={profile.colors.text}
              onChange={(text) => onChange({ colors: { ...profile.colors, text } })}
            />
          </div>

          <label className="block text-sm">
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
        </div>
      </div>

      {!compact ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center rounded-full bg-teal px-5 py-2.5 text-xs font-bold text-white font-montserrat hover:bg-teal-dark transition"
          >
            {t("saveProfile")}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 font-montserrat hover:bg-cream transition"
          >
            {t("resetProfile")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600">{label}</span>
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
