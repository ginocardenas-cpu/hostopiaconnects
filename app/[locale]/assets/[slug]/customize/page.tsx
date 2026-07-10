import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  getAssetBySlug,
  getAssetDisplayForLocale,
  getAssetSourceFileName,
} from "@/lib/assets";
import { AssetCustomizeWorkspace } from "@/components/AssetCustomizeWorkspace";

interface CustomizePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function AssetCustomizePage({ params }: CustomizePageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations("brandStudio");
  const asset = getAssetBySlug(slug);

  if (!asset) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-sm text-gray-600 font-raleway">
          {t("assetNotFound")}{" "}
          <Link href="/library" className="text-teal underline">
            {t("browseLibrary")}
          </Link>
        </p>
      </section>
    );
  }

  const display = getAssetDisplayForLocale(asset, locale);
  const sourceFile = getAssetSourceFileName(asset);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3 font-raleway">
          {t("eyebrow")}
        </p>
        <h1
          className="font-black leading-tight mb-2 text-charcoal"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          }}
        >
          {t("customizeTitle", { title: display.title })}
        </h1>
        <p className="text-sm text-gray-600 font-raleway mb-3">{t("customizeIntro")}</p>
        <p className="text-xs text-gray-500 font-raleway break-all">{sourceFile}</p>
        <Link
          href={`/assets/${slug}`}
          className="inline-block mt-4 text-xs text-teal hover:underline font-raleway"
        >
          {t("backToAsset")}
        </Link>
      </div>

      <AssetCustomizeWorkspace asset={asset} displayTitle={display.title} />
    </section>
  );
}
