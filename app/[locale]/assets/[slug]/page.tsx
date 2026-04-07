import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { FileText } from "lucide-react";
import { getAssetBySlug } from "@/lib/assets";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AssetFeedback } from "@/components/AssetFeedback";
import { AssetMarkSeen } from "@/components/AssetMarkSeen";
import { CopyLinkButton } from "@/components/CopyLinkButton";

interface AssetDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { slug } = await params;
  const t = await getTranslations("asset");
  const asset = getAssetBySlug(slug);

  if (!asset) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {t("notFound")}{" "}
          <Link href="/" className="text-[#2CADB2] underline">
            {t("goBackHome")}
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <AssetMarkSeen slug={slug} />
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-[#f7f6f2] px-3 py-1 uppercase tracking-[0.18em] text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <span>◎</span>
            <span>{asset.journey}</span>
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-black/5 text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {asset.productCategory}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-black/5 text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {asset.contentType}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-black/5 text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {asset.language} · {asset.region}
          </span>
        </div>

        <h1
          className="font-black leading-tight mb-3"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)"
          }}
        >
          {asset.title}
        </h1>

        <p
          className="text-xs text-gray-500 mb-6"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {t("lastUpdated")} {new Date(asset.lastUpdated).toLocaleDateString()} ·{" "}
          {asset.gated ? t("gatedDownload") : t("directDownload")}
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <AddToCartButton assetId={asset.id} />
          <a
            href={asset.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold border border-[#24282B]/20 bg-white transition hover:bg-[#f7f6f2] hover:border-[#2CADB2]"
            style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
          >
            <FileText size={16} />
            {t("preview")}
          </a>
          <CopyLinkButton />
        </div>
        <div className="mb-8">
          <AssetFeedback assetId={asset.id} />
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
        <div className="space-y-6">
          <section>
            <h2
              className="text-sm font-semibold uppercase tracking-[0.18em] mb-2 text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t("whatItIs")}
            </h2>
            <p
              className="text-sm md:text-base text-gray-800"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {asset.summaryWhat}
            </p>
          </section>

          <section>
            <h2
              className="text-sm font-semibold uppercase tracking-[0.18em] mb-2 text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t("whyImportant")}
            </h2>
            <p
              className="text-sm md:text-base text-gray-800"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {asset.summaryWhy}
            </p>
          </section>

          <section>
            <h2
              className="text-sm font-semibold uppercase tracking-[0.18em] mb-2 text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t("howToUse")}
            </h2>
            <p
              className="text-sm md:text-base text-gray-800 whitespace-pre-line"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {asset.summaryHow}
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-[#f7f6f2] p-4">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.18em] mb-3 text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t("atAGlance")}
            </h3>
            <dl
              className="space-y-2 text-xs text-gray-700"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">{t("primaryUseCases")}</dt>
                <dd className="text-right">{asset.useCases.join(" · ")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">{t("languageRegion")}</dt>
                <dd className="text-right">
                  {asset.language} ·{" "}
                  {asset.region === "Global" ? "Global" : asset.region}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">{t("downloadType")}</dt>
                <dd className="text-right">
                  {asset.gated ? t("leadGatedBundle") : t("directFileDownload")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-dashed border-[#2CADB2]/50 bg-[#f0fbfa] p-4 text-xs text-gray-700">
            <p style={{ fontFamily: "Raleway, sans-serif" }}>
              {t("previewHint")}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
