"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Globe2, Palette } from "lucide-react";
import type { BrandProfile } from "@/lib/brand-profile";
import {
  applyBrandImportToProfile,
  BRAND_DIRECTION_STORAGE_KEY,
  type BrandImportResult,
  type BrandStudioDirection,
} from "@/lib/brand-from-url";
import { BrandStudioControls } from "@/components/BrandStudioControls";
import { compressLogoDataUrl } from "@/lib/compress-logo";

interface BrandStudioShellProps {
  profile: BrandProfile;
  onChange: (patch: Partial<BrandProfile>) => void;
  onSave: () => void;
  onReset: () => void;
  /** Replace the whole draft profile (used after scrape import). */
  onReplaceProfile: (next: BrandProfile) => void;
  compact?: boolean;
}

function readStoredDirection(): BrandStudioDirection | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(BRAND_DIRECTION_STORAGE_KEY);
    if (v === "diy" || v === "scrape") return v;
  } catch {
    /* ignore */
  }
  return null;
}

function storeDirection(direction: BrandStudioDirection | null) {
  if (typeof window === "undefined") return;
  try {
    if (!direction) sessionStorage.removeItem(BRAND_DIRECTION_STORAGE_KEY);
    else sessionStorage.setItem(BRAND_DIRECTION_STORAGE_KEY, direction);
  } catch {
    /* ignore */
  }
}

export function BrandStudioShell({
  profile,
  onChange,
  onSave,
  onReset,
  onReplaceProfile,
  compact = false,
}: BrandStudioShellProps) {
  const t = useTranslations("brandStudio");
  const [direction, setDirection] = useState<BrandStudioDirection | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMeta, setImportMeta] = useState<BrandImportResult["meta"] | null>(
    null
  );
  const [awaitingScrape, setAwaitingScrape] = useState(false);
  const [hoveredMethod, setHoveredMethod] = useState<BrandStudioDirection | null>(
    null
  );

  useEffect(() => {
    setDirection(readStoredDirection());
    setHydrated(true);
  }, []);

  const chooseDirection = (next: BrandStudioDirection) => {
    setDirection(next);
    storeDirection(next);
    setImportError(null);
    setImportMeta(null);
    setAwaitingScrape(next === "scrape");
  };

  const handleReset = () => {
    storeDirection(null);
    setDirection(null);
    setAwaitingScrape(false);
    setWebsiteUrl("");
    setImportError(null);
    setImportMeta(null);
    onReset();
  };

  const handleImport = useCallback(async () => {
    setImporting(true);
    setImportError(null);
    try {
      const res = await fetch("/api/brand-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const json = (await res.json()) as BrandImportResult & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || t("scrapeImportFailed"));
      }

      let logoDataUrl = json.logoDataUrl;
      if (logoDataUrl) {
        logoDataUrl = await compressLogoDataUrl(logoDataUrl);
      }

      const imported: BrandImportResult = {
        ...json,
        logoDataUrl,
      };
      const next = applyBrandImportToProfile(profile, imported);
      onReplaceProfile(next);
      setImportMeta(imported.meta);
      setAwaitingScrape(false);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : t("scrapeImportFailed")
      );
    } finally {
      setImporting(false);
    }
  }, [websiteUrl, profile, onReplaceProfile, t]);

  if (!hydrated) {
    return (
      <div className="py-10 text-center text-sm text-charcoal/60 font-raleway">
        {t("loadingStudio")}
      </div>
    );
  }

  if (!direction) {
    const methods: {
      id: BrandStudioDirection;
      title: string;
      desc: string;
      badge?: string;
      Icon: typeof Globe2;
    }[] = [
      {
        id: "scrape",
        title: t("directionScrapeTitle"),
        desc: t("directionScrapeDesc"),
        badge: t("directionScrapeBadge"),
        Icon: Globe2,
      },
      {
        id: "diy",
        title: t("directionDiyTitle"),
        desc: t("directionDiyDesc"),
        Icon: Palette,
      },
    ];

    return (
      <div
        className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${
          compact ? "p-4" : "p-6 max-w-xl mx-auto"
        }`}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal font-montserrat mb-1">
          {t("step1Eyebrow")}
        </p>
        <h2 className="text-base font-bold text-charcoal font-montserrat mb-1">
          {t("chooseMethodTitle")}
        </h2>
        <p className="text-sm text-charcoal/70 font-raleway mb-4">
          {t("chooseMethodHint")}
        </p>

        <div
          className="space-y-3"
          role="radiogroup"
          aria-label={t("chooseMethodTitle")}
        >
          {methods.map(({ id, title, desc, badge, Icon }) => {
            const emphasized = hoveredMethod === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={false}
                onClick={() => chooseDirection(id)}
                onMouseEnter={() => setHoveredMethod(id)}
                onMouseLeave={() => setHoveredMethod(null)}
                onFocus={() => setHoveredMethod(id)}
                onBlur={() => setHoveredMethod(null)}
                className={`w-full text-left flex items-start gap-3 rounded-xl px-4 py-3.5 transition cursor-pointer border ${
                  emphasized
                    ? "border-teal bg-teal/10 shadow-sm ring-1 ring-teal"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-cream"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    emphasized
                      ? "border-teal bg-teal"
                      : "border-gray-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {emphasized ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                    emphasized ? "bg-teal/20 text-teal" : "bg-cream text-teal"
                  }`}
                  aria-hidden
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-charcoal font-montserrat">
                      {title}
                    </span>
                    {badge ? (
                      <span className="inline-flex rounded-full bg-teal/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-dark font-montserrat">
                        {badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-xs text-charcoal/65 font-raleway leading-relaxed">
                    {desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (direction === "scrape" && awaitingScrape) {
    return (
      <div
        className={`space-y-5 font-raleway ${compact ? "" : "max-w-xl mx-auto py-4"}`}
      >
        <div className="mb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal font-montserrat mb-1">
            {t("step1Eyebrow")}
          </p>
          <h2
            className="font-black text-charcoal mb-1"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: compact ? "1.25rem" : "1.5rem",
            }}
          >
            {t("directionScrapeTitle")}
          </h2>
          <p className="text-sm text-charcoal/70">{t("directionScrapeDesc")}</p>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-charcoal/75">{t("scrapeUrlLabel")}</span>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder={t("scrapeUrlPlaceholder")}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleImport();
              }
            }}
          />
        </label>

        <p className="text-xs text-amber-900/90 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2.5 leading-relaxed">
          {t("scrapeDisclaimer")}
        </p>

        {importError ? (
          <p className="text-sm text-red-600" role="alert">
            {importError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={importing || !websiteUrl.trim()}
            onClick={() => void handleImport()}
            className="inline-flex items-center justify-center rounded-full bg-teal px-5 py-2.5 text-xs font-semibold text-white font-montserrat hover:bg-teal-dark transition disabled:opacity-60"
          >
            {importing ? t("scrapeImporting") : t("scrapeImport")}
          </button>
          <button
            type="button"
            onClick={() => {
              storeDirection(null);
              setDirection(null);
              setAwaitingScrape(false);
            }}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-charcoal font-montserrat hover:bg-cream transition"
          >
            {t("changeDirection")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-charcoal/65 font-montserrat font-medium">
          {direction === "diy" ? t("directionDiy") : t("directionScrape")}
        </p>
        <button
          type="button"
          onClick={() => {
            storeDirection(null);
            setDirection(null);
            setAwaitingScrape(false);
            setImportMeta(null);
          }}
          className="text-xs text-teal font-medium font-raleway hover:underline"
        >
          {t("changeDirection")}
        </button>
      </div>

      {importMeta ? (
        <div className="rounded-lg border border-teal/20 bg-teal/5 px-3 py-2.5 text-xs text-charcoal/80 font-raleway space-y-1">
          <p className="font-medium text-teal-dark">
            {t("scrapeImportedFrom", { url: importMeta.websiteUrl })}
          </p>
          {importMeta.found.length > 0 ? (
            <p>
              {t("scrapeFound")}: {importMeta.found.join(", ")}
            </p>
          ) : null}
          {importMeta.missing.length > 0 ? (
            <p>
              {t("scrapeMissing")}: {importMeta.missing.join(", ")}
            </p>
          ) : null}
          <p className="text-amber-900/90 pt-1">{t("scrapeDisclaimer")}</p>
        </div>
      ) : null}

      <BrandStudioControls
        profile={profile}
        onChange={onChange}
        onSave={onSave}
        onReset={handleReset}
        compact={compact}
      />
    </div>
  );
}
