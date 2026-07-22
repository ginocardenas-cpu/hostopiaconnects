"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
      <div className="py-10 text-center text-sm text-gray-500 font-raleway">
        {t("loadingStudio")}
      </div>
    );
  }

  if (!direction) {
    return (
      <div className={`text-center ${compact ? "py-6 px-2" : "py-10 px-4"}`}>
        <h2
          className="font-black text-charcoal mb-2"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: compact ? "1.45rem" : "clamp(1.75rem, 3vw, 2.25rem)",
          }}
        >
          {t("aiTitle")}
        </h2>
        <p className="text-sm text-gray-500 font-raleway mb-10 tracking-wide">
          {t("gettingStarted")}
        </p>
        <div
          className={`grid gap-6 ${compact ? "grid-cols-1" : "sm:grid-cols-2 gap-10 max-w-2xl mx-auto"}`}
        >
          <button
            type="button"
            onClick={() => chooseDirection("diy")}
            className="group rounded-xl border border-transparent px-4 py-6 text-left sm:text-center transition hover:border-teal/30 hover:bg-teal/5"
          >
            <span className="block text-base sm:text-lg font-medium text-gray-600 group-hover:text-teal font-raleway leading-snug">
              {t("directionDiy")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => chooseDirection("scrape")}
            className="group rounded-xl border border-transparent px-4 py-6 text-left sm:text-center transition hover:border-teal/30 hover:bg-teal/5"
          >
            <span className="block text-base sm:text-lg font-medium text-gray-600 group-hover:text-teal font-raleway leading-snug">
              {t("directionScrape")}
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (direction === "scrape" && awaitingScrape) {
    return (
      <div className={`space-y-5 font-raleway ${compact ? "" : "max-w-xl mx-auto py-4"}`}>
        <div className="text-center mb-2">
          <h2
            className="font-black text-charcoal mb-1"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: compact ? "1.25rem" : "1.5rem",
            }}
          >
            {t("aiTitle")}
          </h2>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
            {t("directionScrape")}
          </p>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">{t("scrapeUrlLabel")}</span>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder={t("scrapeUrlPlaceholder")}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleImport();
              }
            }}
          />
        </label>

        <p className="text-xs text-amber-800/90 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 leading-relaxed">
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
            className="inline-flex items-center justify-center rounded-full bg-teal px-5 py-2.5 text-xs font-bold text-white font-montserrat hover:bg-teal-dark transition disabled:opacity-60"
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
            className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 font-montserrat hover:bg-gray-50 transition"
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
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 font-montserrat">
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
        <div className="rounded-lg border border-teal/20 bg-teal/5 px-3 py-2.5 text-xs text-gray-700 font-raleway space-y-1">
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
          <p className="text-amber-800/90 pt-1">{t("scrapeDisclaimer")}</p>
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
