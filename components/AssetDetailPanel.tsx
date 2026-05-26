"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import type { Asset } from "@/lib/assets";
import { getAssetFieldsForLocale, getAssetSourceFileName } from "@/lib/assets";
import { AddToCartButton } from "./AddToCartButton";
import { AssetFeedback } from "./AssetFeedback";
import { AssetPreviewButton } from "./AssetPreviewButton";
import { CopyLinkButton } from "./CopyLinkButton";

interface AssetDetailPanelProps {
  asset: Asset;
}

export function AssetDetailPanel({ asset }: AssetDetailPanelProps) {
  const t = useTranslations("asset");
  const locale = useLocale();
  const sourceFile = getAssetSourceFileName(asset);
  const fields = getAssetFieldsForLocale(asset, locale);
  const copyPath = `/${locale}/assets/${asset.slug}`;

  return (
    <div
      className="rounded-2xl border border-[#2CADB2]/20 bg-white p-6 shadow-sm max-h-[min(85vh,720px)] overflow-y-auto"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
        <span className="inline-flex items-center rounded-full bg-[#ecebe6] px-3 py-1 font-semibold uppercase tracking-[0.14em] text-gray-600">
          {asset.journey}
        </span>
        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-black/8 text-gray-600">
          {asset.productCategory}
        </span>
        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-black/8 text-gray-600">
          {asset.contentType}
        </span>
        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-black/8 text-gray-600">
          {asset.language} · {asset.region}
        </span>
      </div>

      <h2
        className="font-black leading-tight mb-2 text-[#24282B]"
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
        }}
      >
        {asset.title}
      </h2>

      <p className="text-sm text-gray-500 mb-2 break-all">
        <span className="font-medium text-gray-600">{t("sourceFile")}: </span>
        {sourceFile}
      </p>

      <p className="text-xs text-gray-500 mb-4">
        {t("lastUpdated")}{" "}
        {new Date(asset.lastUpdated).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}{" "}
        · {asset.gated ? t("gatedDownload") : t("directDownload")}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <AddToCartButton assetId={asset.id} />
        <AssetPreviewButton fileUrl={asset.fileUrl} title={fields.title} />
        <CopyLinkButton copyPath={copyPath} label={t("copyLink")} />
      </div>

      <div className="mb-5">
        <AssetFeedback assetId={asset.id} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4 text-sm text-gray-800 border-t border-black/6 pt-4">
          <section>
            <h3
              className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 mb-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("whatItIs")}
            </h3>
            <p className="leading-relaxed">{fields.summaryWhat}</p>
          </section>
          <section>
            <h3
              className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 mb-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("whyImportant")}
            </h3>
            <p className="leading-relaxed">{fields.summaryWhy}</p>
          </section>
          <section>
            <h3
              className="text-xs font-bold uppercase tracking-[0.16em] text-gray-700 mb-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("howToUse")}
            </h3>
            <p className="leading-relaxed whitespace-pre-line">{fields.summaryHow}</p>
          </section>
        </div>

        <aside className="space-y-4 border-t border-black/6 pt-4 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
          <div className="rounded-2xl border border-black/6 bg-[#f0efeb] p-4">
            <h3
              className="text-xs font-bold uppercase tracking-[0.16em] mb-3 text-gray-700"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("atAGlance")}
            </h3>
            <dl className="space-y-3 text-xs text-gray-800">
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-500 mb-0.5">
                  {t("sourceFile")}
                </dt>
                <dd className="font-medium break-all leading-snug">{sourceFile}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-500 mb-0.5">
                  {t("primaryUseCases")}
                </dt>
                <dd>{asset.useCases.join(" · ")}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-500 mb-0.5">
                  {t("languageRegion")}
                </dt>
                <dd>
                  {asset.language} · {asset.region}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-500 mb-0.5">
                  {t("downloadType")}
                </dt>
                <dd>{asset.gated ? t("leadGatedBundle") : t("directFileDownload")}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-dashed border-[#5ab8b3] bg-[#e8f7f6] p-3 text-[11px] text-gray-700 leading-relaxed">
            <p>{t("previewHint")}</p>
          </div>
        </aside>
      </div>

      <p className="mt-5 text-center">
        <Link
          href={`/assets/${asset.slug}`}
          className="text-sm font-semibold text-[#2CADB2] hover:underline"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Open full page →
        </Link>
      </p>
    </div>
  );
}
