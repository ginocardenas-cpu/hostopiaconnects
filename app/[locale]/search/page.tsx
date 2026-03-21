import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { searchAssets } from "@/lib/assets";
import { AssetCard } from "@/components/AssetCard";
import { SearchBar } from "@/components/SearchBar";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations("search");
  const { q } = await searchParams;
  const query = q || "";

  const results = query ? searchAssets(query, 100) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-brand-teal hover:underline mb-4">
            ← {t("back") || "Back"}
          </Link>
          {query ? (
            <>
              <h1 className="font-heading font-bold text-3xl text-gray-900 mb-2">
                {t("resultsTitle") || "Search results"} for{" "}
                <span className="text-brand-teal">"{query}"</span>
              </h1>
              <p className="text-gray-600">
                {t("found") || "Found"} <span className="font-semibold">{results.length}</span>{" "}
                {results.length === 1 ? "asset" : "assets"}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading font-bold text-3xl text-gray-900 mb-6">
                {t("title") || "Search HostopiaConnects"}
              </h1>
              <div className="max-w-2xl">
                <SearchBar variant="toolbar" wideTrigger />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results or empty state */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {query ? (
          results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">
                {t("noResults") || "No assets match your search."}
              </p>
              <p className="text-gray-500 text-sm">
                {t("tryDifferent") || "Try different keywords."}
              </p>
            </div>
          )
        ) : (
          <div className="max-w-2xl">
            <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">{t("enterQuery") || "Enter a search query to get started"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
