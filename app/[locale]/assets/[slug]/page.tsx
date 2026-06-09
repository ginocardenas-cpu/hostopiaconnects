import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  getAssetBySlug,
  getAssetDisplayForLocale,
  getAssetSourceFileName
} from "@/lib/assets";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AssetFeedback } from "@/components/AssetFeedback";
import { AssetMarkSeen } from "@/components/AssetMarkSeen";
import { AssetPreviewButton } from "@/components/AssetPreviewButton";
import { CopyLinkButton } from "@/components/CopyLinkButton";

interface AssetDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations("asset");
  const asset = getAssetBySlug(slug);

  if (!asset) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p
          className="text-sm text-gray-600 font-raleway"
        >
          {t("notFound")}{" "}
          <Link href="/" className="text-teal underline">
            {t("goBackHome")}
          </Link>
        </p>
      </section>
    );
  }

  const sourceFile = getAssetSourceFileName(asset);
  const display = getAssetDisplayForLocale(asset, locale);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <AssetMarkSeen slug={slug} />
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
          <span
            className="inline-flex items-center rounded-full bg-cream-muted px-3 py-1 font-semibold uppercase tracking-[0.14em] text-gray-600 font-raleway"
          >
            {display.journey}
          </span>
          <span
            className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-black/8 text-gray-600 font-raleway"
          >
            {display.productCategory}
          </span>
          <span
            className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-black/8 text-gray-600 font-raleway"
          >
            {display.contentType}
          </span>
          <span
            className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-black/8 text-gray-600 font-raleway"
          >
            {display.language} · {display.region}
          </span>
        </div>

        <h1
          className="font-black leading-tight mb-2 text-charcoal"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)",
          }}
        >
          {display.title}
        </h1>

        <p
          className="text-sm text-gray-500 mb-2 break-all font-raleway"
        >
          <span className="font-medium text-gray-600">{t("sourceFile")}: </span>
          {sourceFile}
        </p>

        <p
          className="text-xs text-gray-500 mb-6 font-raleway"
        >
          {t("lastUpdated")}{" "}
          {new Date(asset.lastUpdated).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}{" "}
          · {asset.gated ? t("gatedDownload") : t("directDownload")}
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <AddToCartButton assetId={asset.id} fileName={sourceFile} />
          <AssetPreviewButton
            fileUrl={asset.fileUrl}
            title={display.title}
            fileName={sourceFile}
          />
          <CopyLinkButton copyPath={`/${locale}/assets/${slug}`} label={t("copyLink")} />
        </div>
        <div className="mb-8">
          <AssetFeedback assetId={asset.id} />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] items-start">
        <div className="space-y-8">
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-[0.16em] mb-3 text-gray-700 font-montserrat"
            >
              {t("whatItIs")}
            </h2>
            <p
              className="text-sm md:text-base text-gray-800 leading-relaxed font-raleway"
            >
              {display.summaryWhat}
            </p>
          </section>

          <section>
            <h2
              className="text-xs font-bold uppercase tracking-[0.16em] mb-3 text-gray-700 font-montserrat"
            >
              {t("whyImportant")}
            </h2>
            <p
              className="text-sm md:text-base text-gray-800 leading-relaxed font-raleway"
            >
              {display.summaryWhy}
            </p>
          </section>

          <section>
            <h2
              className="text-xs font-bold uppercase tracking-[0.16em] mb-3 text-gray-700 font-montserrat"
            >
              {t("howToUse")}
            </h2>
            <p
              className="text-sm md:text-base text-gray-800 leading-relaxed whitespace-pre-line font-raleway"
            >
              {display.summaryHow}
            </p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-black/6 bg-[#f0efeb] p-5 shadow-sm">
            <h3
              className="text-xs font-bold uppercase tracking-[0.16em] mb-4 text-gray-700 font-montserrat"
            >
              {t("atAGlance")}
            </h3>
            <dl className="space-y-4 text-sm font-raleway">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1">
                  {t("sourceFile")}
                </dt>
                <dd className="text-gray-900 font-medium break-all leading-snug">{sourceFile}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1">
                  {t("primaryUseCases")}
                </dt>
                <dd className="text-gray-900">{display.useCasesLine}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1">
                  {t("languageRegion")}
                </dt>
                <dd className="text-gray-900">
                  {display.language} · {display.region}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1">
                  {t("downloadType")}
                </dt>
                <dd className="text-gray-900">
                  {asset.gated ? t("leadGatedBundle") : t("directFileDownload")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-dashed border-teal/70 bg-teal-light p-4 text-xs text-gray-700 leading-relaxed">
            <p className="font-raleway">{t("previewHint")}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
