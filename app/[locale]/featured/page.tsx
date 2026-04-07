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
    <section className="mx-auto max-w-6xl px-6 py-16 font-body">
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-teal">
            <Sparkles size={14} />
            {t("featuredAssets")}
          </span>
        </div>
        <h1 className="mb-3 font-heading text-[clamp(2rem,4vw,3rem)] font-black leading-tight text-charcoal">
          {t("whatsNew")}
        </h1>
        <p className="max-w-xl text-base text-gray-600">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <Link
            key={asset.id}
            href={`/assets/${asset.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
          >
            <div className="absolute -top-6 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-teal/10 via-gold/15 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  <FileText size={12} />
                  {asset.contentType}
                </span>
                <span className="text-[11px] text-gray-500">
                  {asset.productCategory}
                </span>
              </div>
              <h2 className="mb-2 line-clamp-2 font-heading text-[1.05rem] font-black">
                {asset.title}
              </h2>
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {asset.summaryWhat}
              </p>
              <p className="mb-3 text-xs text-gray-500">
                {t("updated")} {new Date(asset.lastUpdated).toLocaleDateString()}
              </p>
              <span className="inline-flex items-center gap-1 font-heading text-xs font-semibold text-teal">
                {t("viewDownload")}
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-teal hover:underline">
          {t("backToHome")}
        </Link>
      </div>
    </section>
  );
}
