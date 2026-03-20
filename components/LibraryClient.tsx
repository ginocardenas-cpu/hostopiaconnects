"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { AssetCard } from "@/components/AssetCard";
import {
  filterAssets,
  journeys,
  journeyProducts,
  sampleAssets,
  type Asset,
  type ProductJourney,
  type ProductCategory,
  type ContentType,
  type UseCase,
  type AssetLanguage,
} from "@/lib/assets";
import { LibraryLanguageFilter } from "@/components/LibraryLanguageFilter";
import { ASSET_LANGUAGE_FLAGS } from "@/lib/assetLanguageFlags";

const ALL_CONTENT_TYPES: ContentType[] = [
  "Video",
  "Presentation",
  "Document",
  "Case Study",
  "Playbook",
  "Training",
  "Tool",
];

const ALL_USE_CASES: UseCase[] = [
  "Sales",
  "Marketing",
  "Training & Onboarding",
  "Support",
];

type SortOption = "newest" | "most-viewed" | "most-downloaded" | "a-z";

export function LibraryClient() {
  const t = useTranslations("library");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial filters from URL params
  const initialJourney = searchParams.get("journey") || "";
  const initialProduct = searchParams.get("product") || "";
  const initialType = searchParams.get("type") || "";
  const initialUseCase = searchParams.get("useCase") || "";
  const initialLanguage = searchParams.get("language") || "";
  const initialQuery = searchParams.get("q") || "";

  const [selectedJourney, setSelectedJourney] = useState(initialJourney);
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedUseCase, setSelectedUseCase] = useState(initialUseCase);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Products filtered by selected journey
  const availableProducts = useMemo(() => {
    if (!selectedJourney) return journeyProducts;
    return journeyProducts.filter((p) => {
      const j = journeys.find((j) => j.slug === selectedJourney);
      return j && p.journey === j.label;
    });
  }, [selectedJourney]);

  // Build filter criteria
  const filtered = useMemo(() => {
    const journeyLabel = journeys.find((j) => j.slug === selectedJourney)?.label;
    const productCategory = journeyProducts.find(
      (p) => p.slug === selectedProduct
    )?.category;

    return filterAssets({
      journeys: journeyLabel ? [journeyLabel] : [],
      productCategories: productCategory ? [productCategory] : [],
      contentTypes: selectedType ? [selectedType as ContentType] : [],
      useCases: selectedUseCase ? [selectedUseCase as UseCase] : [],
      languages: selectedLanguage ? [selectedLanguage as AssetLanguage] : [],
      query,
    });
  }, [selectedJourney, selectedProduct, selectedType, selectedUseCase, selectedLanguage, query]);

  // Sort results
  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case "newest":
        return copy.sort((a, b) => (b.lastUpdated > a.lastUpdated ? 1 : -1));
      case "most-viewed":
        return copy.sort((a, b) => b.viewCount - a.viewCount);
      case "most-downloaded":
        return copy.sort((a, b) => b.downloadCount - a.downloadCount);
      case "a-z":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return copy;
    }
  }, [filtered, sort]);

  const hasFilters =
    selectedJourney || selectedProduct || selectedType || selectedUseCase || selectedLanguage || query;

  const clearAll = () => {
    setSelectedJourney("");
    setSelectedProduct("");
    setSelectedType("");
    setSelectedUseCase("");
    setSelectedLanguage("");
    setQuery("");
  };

  const activeFilterCount = [
    selectedJourney,
    selectedProduct,
    selectedType,
    selectedUseCase,
    selectedLanguage,
  ].filter(Boolean).length;

  const filterPanel = (
    <div className="space-y-6">
      {/* Search within library */}
      <div>
        <label className="block text-xs font-heading font-bold uppercase text-gray-500 mb-2">
          Search
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by keyword…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-body outline-none focus:border-[#2CADB2] focus:ring-1 focus:ring-[#2CADB2]"
        />
      </div>

      {/* Journey filter */}
      <div>
        <label className="block text-xs font-heading font-bold uppercase text-gray-500 mb-2">
          {t("journey")}
        </label>
        <select
          value={selectedJourney}
          onChange={(e) => {
            setSelectedJourney(e.target.value);
            setSelectedProduct(""); // reset product when journey changes
          }}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-body bg-white outline-none focus:border-[#2CADB2]"
        >
          <option value="">{t("allJourneys")}</option>
          {journeys.map((j) => (
            <option key={j.slug} value={j.slug}>
              {j.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product filter */}
      <div>
        <label className="block text-xs font-heading font-bold uppercase text-gray-500 mb-2">
          {t("product")}
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-body bg-white outline-none focus:border-[#2CADB2]"
        >
          <option value="">{t("allProducts")}</option>
          {availableProducts.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content Type filter */}
      <div>
        <label className="block text-xs font-heading font-bold uppercase text-gray-500 mb-2">
          {t("contentType")}
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-body bg-white outline-none focus:border-[#2CADB2]"
        >
          <option value="">{t("allTypes")}</option>
          {ALL_CONTENT_TYPES.map((ct) => (
            <option key={ct} value={ct}>
              {ct}
            </option>
          ))}
        </select>
      </div>

      {/* Use Case filter */}
      <div>
        <label className="block text-xs font-heading font-bold uppercase text-gray-500 mb-2">
          {t("useCase")}
        </label>
        <select
          value={selectedUseCase}
          onChange={(e) => setSelectedUseCase(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-body bg-white outline-none focus:border-[#2CADB2]"
        >
          <option value="">{t("allUseCases")}</option>
          {ALL_USE_CASES.map((uc) => (
            <option key={uc} value={uc}>
              {uc}
            </option>
          ))}
        </select>
      </div>

      <LibraryLanguageFilter
        value={selectedLanguage}
        onChange={setSelectedLanguage}
        t={t}
      />

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full text-center text-sm font-semibold text-[#2CADB2] hover:text-[#249599] transition-colors"
        >
          {t("clearAll")}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="font-heading font-bold text-3xl text-[#24282B]">
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-1 font-body">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <i className="fa-solid fa-sliders text-xs" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2CADB2] text-white text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-heading font-bold text-sm text-gray-900 mb-4">
                {t("filters")}
              </h2>
              {filterPanel}
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                  <h2 className="font-heading font-bold text-sm">
                    {t("filters")}
                  </h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">{filterPanel}</div>
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm text-gray-600 font-body">
                {hasFilters
                  ? `Showing ${sorted.length} of ${sampleAssets.length} assets`
                  : `Showing ${sorted.length} assets`}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-body">
                  {t("sortBy")}
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-body bg-white outline-none focus:border-[#2CADB2]"
                >
                  <option value="newest">{t("newest")}</option>
                  <option value="most-viewed">{t("mostViewed")}</option>
                  <option value="most-downloaded">{t("mostDownloaded")}</option>
                  <option value="a-z">{t("alphabetical")}</option>
                </select>
              </div>
            </div>

            {/* Active filter pills */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedJourney && (
                  <FilterPill
                    label={journeys.find((j) => j.slug === selectedJourney)?.label || selectedJourney}
                    onRemove={() => { setSelectedJourney(""); setSelectedProduct(""); }}
                  />
                )}
                {selectedProduct && (
                  <FilterPill
                    label={journeyProducts.find((p) => p.slug === selectedProduct)?.label || selectedProduct}
                    onRemove={() => setSelectedProduct("")}
                  />
                )}
                {selectedType && (
                  <FilterPill label={selectedType} onRemove={() => setSelectedType("")} />
                )}
                {selectedUseCase && (
                  <FilterPill label={selectedUseCase} onRemove={() => setSelectedUseCase("")} />
                )}
                {selectedLanguage && (
                  <FilterPill
                    icon={ASSET_LANGUAGE_FLAGS[selectedLanguage as AssetLanguage]}
                    label={selectedLanguage}
                    onRemove={() => setSelectedLanguage("")}
                  />
                )}
                {query && (
                  <FilterPill label={`"${query}"`} onRemove={() => setQuery("")} />
                )}
              </div>
            )}

            {/* Results grid */}
            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sorted.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-600 font-body mb-2">
                  {t("noResults")}
                </p>
                <p className="text-gray-400 text-sm font-body">
                  {t("noResultsHint")}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-[#2CADB2] text-white text-sm font-semibold hover:bg-[#249599] transition-colors"
                  >
                    {t("clearAll")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  onRemove,
  icon,
}: {
  label: string;
  onRemove: () => void;
  icon?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d1f0ee] text-[#0f766e] text-xs font-semibold">
      {icon && <span className="leading-none" aria-hidden>{icon}</span>}
      {label}
      <button
        onClick={onRemove}
        className="hover:text-[#24282B] transition-colors leading-none"
        aria-label={`Remove ${label} filter`}
      >
        ✕
      </button>
    </span>
  );
}
