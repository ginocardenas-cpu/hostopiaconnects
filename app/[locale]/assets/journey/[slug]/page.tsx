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
      <section className="mx-auto max-w-4xl px-6 py-20 font-body">
        <p className="text-sm text-gray-600">
          {t("notFound")}{" "}
          <Link href="/" className="text-teal underline">
            {t("goBackHome")}
          </Link>
        </p>
      </section>
    );
  }

  const products = journeyProducts.filter((p) => p.journey === journey);
  const descriptionKey = journeyDescriptionKeys[journey];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="section-label mb-3">
            {t("productJourney")}
          </p>
          <h1 className="mb-3 font-heading text-[clamp(2rem,3.5vw,2.8rem)] font-black leading-tight text-charcoal">
            {journey}
          </h1>
          <p className="max-w-xl text-sm text-gray-600 md:text-base">
            {t(descriptionKey)}
          </p>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            {t("chooseProduct")}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-teal hover:underline"
          >
            {t("backToJourneys")}
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-600">
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
              <div className="absolute -top-10 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-teal/10 via-gold/15 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600"
                  >
                    <span>◆</span>
                    <span>{t("product")}</span>
                  </span>
                  <span
                    className="text-[11px] text-gray-500"
                  >
                    {product.label}
                  </span>
                </div>
                <h2 className="mb-2 font-heading text-[1.05rem] font-black text-charcoal">
                  {product.label}
                </h2>
                <p className="mb-3 text-sm text-gray-600">
                  {product.description}
                </p>
                <span className="inline-flex items-center gap-1 font-heading text-xs font-semibold text-teal">
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
