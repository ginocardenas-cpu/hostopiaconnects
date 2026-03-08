import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Sparkles, ArrowRight, FileText } from "lucide-react";
import { getLatestAssets } from "@/lib/assets";

export async function generateMetadata() {
  const t = await getTranslations("featured");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function FeaturedPage() {
  const t = await getTranslations("featured");
  const assets = getLatestAssets(12);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]"
            style={{ fontFamily: "Raleway, sans-serif", color: "#2CADB2" }}
          >
            <Sparkles size={14} />
            {t("featuredAssets")}
          </span>
        </div>
        <h1
          className="font-black leading-tight mb-3"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "#24282B"
          }}
        >
          {t("whatsNew")}
        </h1>
        <p
          className="text-base text-gray-600 max-w-xl"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <Link
            key={asset.id}
            href={`/assets/${asset.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
          >
            <div className="absolute -top-6 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#2CADB2]/10 via-[#F8CF41]/15 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f6f2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-600"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  <FileText size={12} />
                  {asset.contentType}
                </span>
                <span
                  className="text-[11px] text-gray-500"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {asset.productCategory}
                </span>
              </div>
              <h2
                className="font-black mb-2 line-clamp-2"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "1.05rem"
                }}
              >
                {asset.title}
              </h2>
              <p
                className="text-sm text-gray-600 line-clamp-2 mb-3"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {asset.summaryWhat}
              </p>
              <p
                className="text-xs text-gray-500 mb-3"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {t("updated")} {new Date(asset.lastUpdated).toLocaleDateString()}
              </p>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2CADB2]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {t("viewDownload")}
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2CADB2] hover:underline"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {t("backToHome")}
        </Link>
      </div>
    </section>
  );
}
