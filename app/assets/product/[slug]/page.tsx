import Link from "next/link";
import {
  getAssetsByProductCategory,
  journeyProducts,
  type ProductCategory
} from "@/lib/assets";

interface ProductAssetsPageProps {
  params: { slug: string };
}

function productCategoryFromSlug(slug: string): ProductCategory | undefined {
  const match = journeyProducts.find((p) => p.slug === slug);
  return match?.category;
}

export default function ProductAssetsPage({ params }: ProductAssetsPageProps) {
  const productMeta = journeyProducts.find((p) => p.slug === params.slug);
  const category = productCategoryFromSlug(params.slug);

  if (!productMeta || !category) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          We couldn&apos;t find that product.{" "}
          <Link href="/" className="text-[#2CADB2] underline">
            Go back to Hostopia Connects home.
          </Link>
        </p>
      </section>
    );
  }

  const assets = getAssetsByProductCategory(category);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p
            className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3"
            style={{ fontFamily: "Raleway, sans-serif" }}
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
            {productMeta.label}
          </h1>
          <p
            className="text-sm md:text-base text-gray-600 max-w-xl"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {productMeta.description}
          </p>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p style={{ fontFamily: "Raleway, sans-serif" }}>
            Assets below are filtered to this product. From here, reps can open
            individual assets or add them to a Download Cart (coming next).
          </p>
          <Link
            href={`/assets/journey/${journeyProducts.find((p) => p.slug === params.slug)?.journey
              ?.toLowerCase()
              .replace(/\s+/g, "-") ?? ""}`}
            className="inline-flex items-center gap-1 text-[#2CADB2] hover:underline"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            ← Back to journey
          </Link>
        </div>
      </div>

      {assets.length === 0 ? (
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          We don&apos;t have any sample assets wired up for this product yet.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/assets/${asset.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <div className="absolute -top-10 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-[#2CADB2]/10 via-[#F8CF41]/15 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-[#f7f6f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <span>▢</span>
                    <span>{asset.contentType}</span>
                  </span>
                  <span
                    className="text-[11px] text-gray-500"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {asset.language} ·{" "}
                    {asset.region === "Global" ? "Global" : asset.region}
                  </span>
                </div>
                <h2
                  className="font-black mb-2"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1.05rem"
                  }}
                >
                  {asset.title}
                </h2>
                <p
                  className="text-sm text-gray-600 mb-3"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {asset.summaryWhat}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#2CADB2]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  View asset details
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

