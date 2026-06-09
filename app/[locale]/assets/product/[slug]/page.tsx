import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  getAssetDisplayForLocale,
  getAssetsByProductCategory,
  journeyProducts,
  type ProductCategory
} from "@/lib/assets";
import { getProductPageCopy } from "@/lib/product-page-copy";

interface ProductAssetsPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function productCategoryFromSlug(slug: string): ProductCategory | undefined {
  const match = journeyProducts.find((p) => p.slug === slug);
  return match?.category;
}

export default async function ProductAssetsPage({ params }: ProductAssetsPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations("productList");
  const productMeta = journeyProducts.find((p) => p.slug === slug);
  const category = productCategoryFromSlug(slug);

  if (!productMeta || !category) {
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

  const assets = getAssetsByProductCategory(category);
  const journeySlug = journeyProducts.find((p) => p.slug === slug)?.journey
    ?.toLowerCase()
    .replace(/\s+/g, "-") ?? "";

  const copy = getProductPageCopy(locale, slug);
  const displayLabel = copy?.label?.trim() || productMeta.label;
  const displayDescription = copy?.description?.trim() || productMeta.description;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p
            className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3 font-raleway"
          >
            {productMeta.journey}
          </p>
          <h1
            className="font-black leading-tight mb-3"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2rem, 3.5vw, 2.6rem)"
            }}
          >
            {displayLabel}
          </h1>
          <p
            className="text-sm md:text-base text-gray-600 max-w-xl whitespace-pre-wrap font-raleway"
          >
            {displayDescription}
          </p>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-raleway">
            {t("filteredIntro")}
          </p>
          <Link
            href={`/assets/journey/${journeySlug}`}
            className="inline-flex items-center gap-1 text-teal hover:underline font-raleway"
          >
            {t("backToJourney")}
          </Link>
        </div>
      </div>

      {assets.length === 0 ? (
        <p
          className="text-sm text-gray-600 font-raleway"
        >
          {t("noAssets")}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {assets.map((asset) => {
            const display = getAssetDisplayForLocale(asset, locale);
            return (
            <Link
              key={asset.id}
              href={`/assets/${asset.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <div className="absolute -top-10 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-teal/10 via-gold/15 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600 font-raleway"
                  >
                    <span>▢</span>
                    <span>{display.contentType}</span>
                  </span>
                  <span
                    className="text-[11px] text-gray-500 font-raleway"
                  >
                    {display.language} · {display.region}
                  </span>
                </div>
                <h2
                  className="font-black mb-2"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1.05rem"
                  }}
                >
                  {display.title}
                </h2>
                <p
                  className="text-sm text-gray-600 mb-3 whitespace-pre-wrap font-raleway"
                >
                  {display.summaryWhat}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal font-montserrat"
                >
                  {t("viewAssetDetails")}
                  <span>↗</span>
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
