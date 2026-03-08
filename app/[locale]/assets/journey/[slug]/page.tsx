import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  journeyFromSlug,
  journeyProducts,
  type ProductJourney
} from "@/lib/assets";

const journeyDescriptionKeys: Record<ProductJourney, string> = {
  "Build a Brand": "journeyBuildABrand",
  "Get Online": "journeyGetOnline",
  "Get Found": "journeyGetFound",
  "Grow their Business": "journeyGrowTheirBusiness",
};

interface JourneyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function JourneyPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const t = await getTranslations("journeyList");
  const journey = journeyFromSlug(slug);

  if (!journey) {
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

  const products = journeyProducts.filter((p) => p.journey === journey);
  const descriptionKey = journeyDescriptionKeys[journey];

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p
            className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {t("productJourney")}
          </p>
          <h1
            className="font-black leading-tight mb-3"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)"
            }}
          >
            {journey}
          </h1>
          <p
            className="text-sm md:text-base text-gray-600 max-w-xl"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {t(descriptionKey)}
          </p>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p style={{ fontFamily: "Raleway, sans-serif" }}>
            {t("chooseProduct")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[#2CADB2] hover:underline"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {t("backToJourneys")}
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {t("noProducts")}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/assets/product/${product.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <div className="absolute -top-10 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-[#2CADB2]/10 via-[#F8CF41]/15 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-[#f7f6f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <span>◆</span>
                    <span>{t("product")}</span>
                  </span>
                  <span
                    className="text-[11px] text-gray-500"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {product.label}
                  </span>
                </div>
                <h2
                  className="font-black mb-2"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1.05rem"
                  }}
                >
                  {product.label}
                </h2>
                <p
                  className="text-sm text-gray-600 mb-3"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {product.description}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2CADB2]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {t("viewAssetsForProduct")}
                  <span>↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
