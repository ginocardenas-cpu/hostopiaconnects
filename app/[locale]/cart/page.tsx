"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { DownloadProgressPanel } from "@/components/DownloadProgressPanel";
import { getAssetDisplayForLocale } from "@/lib/assets";
import { deckLangLabel } from "@/lib/html-deck-i18n";
import type { BundleDownloadItem, BundleRequestResponse } from "@/lib/bundle-request";
import {
  downloadFile,
  downloadFilesAsZip,
  type DownloadDescriptor,
  type DownloadProgress,
} from "@/lib/trigger-download";

const IDLE_PROGRESS: DownloadProgress = {
  phase: "idle",
  percent: 0,
  etaSeconds: null,
};

function toDescriptor(item: BundleDownloadItem): DownloadDescriptor {
  return {
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    requiresGeneration: item.requiresGeneration,
    assetId: item.assetId,
    deckLang: item.deckLang,
    exportFormat: item.exportFormat,
    brandProfile: item.brandProfile,
    useExportPost: item.useExportPost,
  };
}

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
  const [busy, setBusy] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<DownloadProgress>(IDLE_PROGRESS);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [deliveredHint, setDeliveredHint] = React.useState<string | null>(null);

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
          items: items.map(({ assetId, deckLang, exportFormat, brandProfile }) => ({
            assetId,
            ...(deckLang ? { deckLang } : {}),
            ...(exportFormat ? { exportFormat } : {}),
            ...(brandProfile ? { brandProfile } : {}),
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

  const runDownload = async (
    action: (onProgress: (p: DownloadProgress) => void) => Promise<string | void>,
    id: string | null,
    item?: BundleDownloadItem
  ) => {
    setActionError(null);
    setDeliveredHint(null);
    setBusy(true);
    setActiveId(id);
    setProgress({
      phase: "preparing",
      percent: 2,
      etaSeconds: null,
    });
    try {
      const deliveredName = await action(setProgress);
      setProgress({
        phase: "complete",
        percent: 100,
        etaSeconds: 0,
      });
      if (
        item?.brandProfile &&
        item.exportFormat === "pdf" &&
        typeof deliveredName === "string" &&
        deliveredName.toLowerCase().endsWith(".html")
      ) {
        setDeliveredHint(
          t("downloadDeliveredAsHtml", { fileName: deliveredName })
        );
      }
    } catch (err) {
      const detail =
        err instanceof Error && err.message
          ? err.message
          : t("downloadError");
      setActionError(detail);
      setProgress((prev) => ({
        phase: "error",
        percent: Math.max(prev.percent, 8),
        etaSeconds: null,
      }));
    } finally {
      setBusy(false);
      setActiveId(null);
    }
  };

  if (downloads && downloads.length > 0) {
    const isSingle = downloads.length === 1;
    const single = downloads[0];

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
          <p className="text-sm text-gray-600 font-raleway">
            {isSingle ? t("successBodySingle") : t("successBodyMulti")}
          </p>
        </div>

        {isSingle ? (
          <div className="rounded-2xl border border-teal/30 bg-teal-light p-5 mb-8">
            <p className="text-sm font-semibold text-charcoal font-montserrat">
              {single.title}
            </p>
            <p className="text-[11px] text-gray-600 mt-1 font-raleway break-all">
              {single.fileName}
            </p>
            {single.deckLang ? (
              <p className="text-[11px] font-medium text-teal mt-2 font-raleway">
                {t("requestedDocumentLanguage", {
                  language: deckLangLabel(single.deckLang),
                })}
              </p>
            ) : null}
            {single.exportFormat ? (
              <p className="text-[11px] font-medium text-teal mt-1 font-raleway">
                {t("requestedExportFormat", {
                  format: tAsset(`exportFormat_${single.exportFormat}`),
                })}
              </p>
            ) : null}
            {single.brandProfile && single.exportFormat === "pdf" ? (
              <p className="text-[11px] text-gray-600 mt-2 font-raleway">
                {t("brandedPdfFallbackHint")}
              </p>
            ) : null}

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runDownload(
                  (onProgress) => downloadFile(toDescriptor(single), onProgress),
                  single.assetId,
                  single
                )
              }
              className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-5 py-2.5 font-montserrat text-xs font-bold text-charcoal shadow-sm hover:bg-gold-dark disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? t("preparingDownload") : t("downloadFile")}
            </button>

            <DownloadProgressPanel progress={progress} busy={busy} />

            {actionError ? (
              <p className="mt-3 text-[11px] text-red-600 font-raleway">{actionError}</p>
            ) : null}
            {deliveredHint ? (
              <p className="mt-3 text-[11px] text-teal-dark font-raleway">{deliveredHint}</p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-teal/30 bg-teal-light p-5 mb-6">
              <p className="text-sm font-semibold text-teal font-montserrat mb-1">
                {t("downloadReady")}
              </p>
              <p className="text-xs text-gray-700 font-raleway">
                {t("downloadReadyHintZip")}
              </p>
              <button
                type="button"
                disabled={busy || downloads.length === 0}
                onClick={() =>
                  runDownload(
                    (onProgress) =>
                      downloadFilesAsZip(
                        downloads.map(toDescriptor),
                        "hostopia-connects-resources.zip",
                        onProgress
                      ).then(() => undefined),
                    "zip"
                  )
                }
                className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-5 py-2.5 font-montserrat text-xs font-bold text-charcoal shadow-sm hover:bg-gold-dark disabled:cursor-wait disabled:opacity-70"
              >
                {busy && activeId === "zip"
                  ? t("preparingZip")
                  : t("downloadAllZip")}
              </button>

              <DownloadProgressPanel progress={progress} busy={busy} />

              {actionError ? (
                <p className="mt-3 text-[11px] text-red-600 font-raleway">
                  {actionError}
                </p>
              ) : null}
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
                    {item.deckLang ? (
                      <p className="text-[11px] font-medium text-teal mt-1 font-raleway">
                        {t("requestedDocumentLanguage", {
                          language: deckLangLabel(item.deckLang),
                        })}
                      </p>
                    ) : null}
                    {item.exportFormat ? (
                      <p className="text-[11px] font-medium text-teal mt-1 font-raleway">
                        {t("requestedExportFormat", {
                          format: tAsset(`exportFormat_${item.exportFormat}`),
                        })}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        runDownload(
                          (onProgress) =>
                            downloadFile(toDescriptor(item), onProgress),
                          item.assetId,
                          item
                        )
                      }
                      className="inline-flex items-center justify-center rounded-full border border-teal/40 bg-white px-4 py-2 font-montserrat text-xs font-bold text-teal hover:bg-teal/10 disabled:opacity-60"
                    >
                      {busy && activeId === item.assetId
                        ? t("preparingDownload")
                        : t("downloadFile")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setDownloads((prev) =>
                          prev
                            ? prev.filter((d) => d.assetId !== item.assetId)
                            : prev
                        );
                        setActionError(null);
                      }}
                      className="text-[11px] text-gray-500 hover:text-red-600 font-raleway px-2"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

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
