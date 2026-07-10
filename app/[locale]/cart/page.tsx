"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { getAssetDisplayForLocale } from "@/lib/assets";
import { deckLangLabel } from "@/lib/html-deck-i18n";
import type { BundleDownloadItem, BundleRequestResponse } from "@/lib/bundle-request";
import { downloadFile, downloadFilesAsZip } from "@/lib/trigger-download";

export default function CartPage() {
  const t = useTranslations("cart");
  const tAsset = useTranslations("asset");
  const locale = useLocale();
  const { lineItems, items, removeItem, clear } = useCart();
  const hasItems = lineItems.length > 0;
  const [downloads, setDownloads] = React.useState<BundleDownloadItem[] | null>(
    null
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [zipping, setZipping] = React.useState(false);
  const [zipError, setZipError] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    if (!hasItems || submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/bundle-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            fullName: formData.get("fullName"),
            company: formData.get("company"),
            email: formData.get("email"),
            optIn: formData.get("optIn") === "on",
          },
          items: items.map(({ assetId, deckLang, exportFormat }) => ({
            assetId,
            ...(deckLang ? { deckLang } : {}),
            ...(exportFormat ? { exportFormat } : {}),
          })),
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("request_failed");
      }

      const data = (await response.json()) as BundleRequestResponse;
      setDownloads(data.downloads);
      clear();
      form.reset();
    } catch {
      setSubmitError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (downloads && downloads.length > 0) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3 font-raleway">
            {t("title")}
          </p>
          <h1
            className="font-black leading-tight mb-3"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.3rem)",
            }}
          >
            {t("successTitle")}
          </h1>
          <p className="text-sm text-gray-600 font-raleway">{t("successBody")}</p>
        </div>

        <div className="rounded-2xl border border-teal/30 bg-teal-light p-5 mb-6">
          <p className="text-sm font-semibold text-teal font-montserrat mb-1">
            {t("downloadReady")}
          </p>
          <p className="text-xs text-gray-700 font-raleway">
            {downloads.length > 1 ? t("downloadReadyHintZip") : t("downloadReadyHint")}
          </p>
          <button
            type="button"
            disabled={zipping}
            onClick={async () => {
              setZipError(null);
              setZipping(true);
              try {
                await downloadFilesAsZip(
                  downloads.map((d) => ({
                    fileUrl: d.fileUrl,
                    fileName: d.fileName,
                    requiresGeneration: d.requiresGeneration,
                    assetId: d.assetId,
                    deckLang: d.deckLang,
                    exportFormat: d.exportFormat,
                  })),
                  "hostopia-connects-resources.zip"
                );
              } catch {
                setZipError(t("zipError"));
              } finally {
                setZipping(false);
              }
            }}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-5 py-2 font-montserrat text-xs font-bold text-charcoal shadow-sm hover:bg-gold-dark disabled:cursor-wait disabled:opacity-70"
          >
            {zipping
              ? t("preparingZip")
              : downloads.length > 1
                ? t("downloadAllZip")
                : t("downloadFile")}
          </button>
          {zipError && (
            <p className="mt-2 text-[11px] text-red-600 font-raleway">{zipError}</p>
          )}
          {downloadError && (
            <p className="mt-2 text-[11px] text-red-600 font-raleway">{downloadError}</p>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {downloads.map((item) => (
            <li
              key={item.assetId}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-black/5 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal font-montserrat truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 font-raleway break-all">
                  {item.fileName}
                </p>
                {item.deckLang && (
                  <p className="text-[11px] font-medium text-teal mt-1 font-raleway">
                    {t("requestedDocumentLanguage", {
                      language: deckLangLabel(item.deckLang),
                    })}
                  </p>
                )}
                {item.exportFormat && (
                  <p className="text-[11px] font-medium text-teal mt-1 font-raleway">
                    {t("requestedExportFormat", {
                      format: tAsset(`exportFormat_${item.exportFormat}`),
                    })}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={downloadingId === item.assetId}
                onClick={async () => {
                  setDownloadError(null);
                  setDownloadingId(item.assetId);
                  try {
                    await downloadFile({
                      fileUrl: item.fileUrl,
                      fileName: item.fileName,
                      requiresGeneration: item.requiresGeneration,
                      assetId: item.assetId,
                      deckLang: item.deckLang,
                      exportFormat: item.exportFormat,
                    });
                  } catch {
                    setDownloadError(t("downloadError"));
                  } finally {
                    setDownloadingId(null);
                  }
                }}
                className="shrink-0 inline-flex items-center justify-center rounded-full border border-teal/40 bg-white px-4 py-2 font-montserrat text-xs font-bold text-teal hover:bg-teal/10"
              >
                {downloadingId === item.assetId ? t("preparingDownload") : t("downloadFile")}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-4 text-xs font-raleway">
          <Link href="/library" className="text-teal hover:underline">
            {t("browseMore")}
          </Link>
          <Link href="/" className="text-gray-600 hover:text-teal hover:underline">
            {t("backToHome")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-start gap-10">
        <div className="flex-1">
          <div className="mb-6">
            <p className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3 font-raleway">
              {t("title")}
            </p>
            <h1
              className="font-black leading-tight mb-2"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.3rem)",
              }}
            >
              {t("reviewTitle")}
            </h1>
            <p className="text-sm text-gray-600 font-raleway">{t("reviewIntro")}</p>
            <p className="mt-3 text-sm font-semibold text-teal font-raleway">
              {t("downloadsAfterForm")}
            </p>
          </div>

          {!hasItems ? (
            <div className="rounded-2xl border border-dashed border-teal/40 bg-teal-light p-6 text-sm text-gray-700">
              <p className="font-raleway">
                {t("empty")}. {t("emptyHint")}{" "}
                <span className="font-semibold">{t("addToMyResourcesBtn")}</span>{" "}
                {t("emptyHintSuffix")}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 mt-4 text-xs text-teal hover:underline font-raleway"
              >
                {t("backToHome")}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {lineItems.map(({ asset, deckLang, exportFormat }) => {
                const display = getAssetDisplayForLocale(asset, locale);
                return (
                  <div
                    key={asset.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-black/5 bg-white p-4"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1 font-raleway">
                        {display.contentType} · {display.productCategory}
                      </p>
                      <Link
                        href={`/assets/${asset.slug}`}
                        className="text-sm font-semibold hover:text-teal transition-colors font-montserrat"
                      >
                        {display.title}
                      </Link>
                      <p className="text-xs text-gray-600 mt-1 font-raleway">
                        {display.summaryWhat}
                      </p>
                      {deckLang && (
                        <p className="text-[11px] font-medium text-teal mt-2 font-raleway">
                          {t("requestedDocumentLanguage", {
                            language: deckLangLabel(deckLang),
                          })}
                        </p>
                      )}
                      {exportFormat && (
                        <p className="text-[11px] font-medium text-teal mt-1 font-raleway">
                          {t("requestedExportFormat", {
                            format: tAsset(`exportFormat_${exportFormat}`),
                          })}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(asset.id)}
                      className="text-[11px] text-gray-500 hover:text-red-600 font-raleway"
                    >
                      {t("remove")}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="w-full md:w-[360px]">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2
              className="font-black mb-2"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "1.1rem",
              }}
            >
              {t("unlockDownloadsTitle")}
            </h2>
            <p className="text-xs text-gray-600 mb-4 font-raleway">
              {t("unlockDownloadsIntro")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold mb-1 text-gray-700 font-raleway"
                >
                  {t("fullName")}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  disabled={submitting}
                  className="w-full rounded-md border border-black/10 bg-cream px-3 py-2 text-xs outline-none focus:border-teal focus:ring-1 focus:ring-teal disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="block text-xs font-semibold mb-1 text-gray-700 font-raleway"
                >
                  {t("company")}
                </label>
                <input
                  id="company"
                  name="company"
                  required
                  disabled={submitting}
                  className="w-full rounded-md border border-black/10 bg-cream px-3 py-2 text-xs outline-none focus:border-teal focus:ring-1 focus:ring-teal disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold mb-1 text-gray-700 font-raleway"
                >
                  {t("emailAddress")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={submitting}
                  className="w-full rounded-md border border-black/10 bg-cream px-3 py-2 text-xs outline-none focus:border-teal focus:ring-1 focus:ring-teal disabled:opacity-60"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="optIn"
                  name="optIn"
                  type="checkbox"
                  disabled={submitting}
                  className="mt-[2px]"
                />
                <label
                  htmlFor="optIn"
                  className="text-[11px] text-gray-600 font-raleway"
                >
                  {t("optInLabel")}
                </label>
              </div>

              <button
                type="submit"
                disabled={!hasItems || submitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-2 font-montserrat text-xs font-bold text-charcoal shadow-md transition hover:bg-gold-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t("submitting") : t("submitButton")}
              </button>

              {!hasItems && (
                <p className="text-[11px] text-gray-500 mt-1 font-raleway">
                  {t("submitHint")}
                </p>
              )}

              {submitError && (
                <p className="text-[11px] text-red-600 mt-1 font-raleway">
                  {submitError}
                </p>
              )}
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
}
