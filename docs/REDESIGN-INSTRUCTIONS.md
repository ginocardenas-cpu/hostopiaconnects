# HostopiaConnects Partner Portal Redesign Instructions

**Version:** 1.0
**Date:** 2026-03-17
**Target:** Next.js 14 + TypeScript + Tailwind CSS + next-intl
**Audience:** Developers using Claude Code for implementation

## Overview

This document provides detailed, actionable instructions for redesigning the HostopiaConnects partner portal. Every instruction references specific files, components, and code patterns from the existing codebase. Follow these instructions sequentially to implement the complete redesign.

### Key Design Goals

- **Homepage Hero:** Reduce visual weight, elevate guided wizard as primary entry point
- **Search & Discovery:** Full-featured search with autocomplete and dedicated results page
- **Content Library:** Browse-focused destination with persistent filtering
- **Navigation:** Restructured header with product/content dropdowns and search integration
- **Visual Polish:** Card-based design system with consistent spacing and hover states

---

## 1. TAILWIND & DESIGN SYSTEM SETUP

### 1.1 Extend Tailwind Configuration

**File to Modify:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/tailwind.config.ts`

Add product color palette and spacing refinements to `theme.extend`:

```typescript
colors: {
  brand: {
    teal: "#2CADB2",
    yellow: "#F8CF41",
    dark: "#24282B",
    beige: "#f7f6f2"
  },
  product: {
    domains: "#E8F4F1",      // Teal tint
    ssl: "#FFF9E6",          // Yellow tint
    website: "#E8F4F1",      // Teal tint
    logo: "#FCE8F3",         // Pink tint
    email: "#F0E8FF",        // Purple tint
    ecommerce: "#FFF4E6",    // Orange tint
    fax: "#E8F4F1",          // Teal tint
    directory: "#FFE8E8",    // Red tint
    reputation: "#F0F9FF"    // Blue tint
  }
},
spacing: {
  // Existing spacing remains; add refinements as needed
},
boxShadow: {
  "card": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)"
}
```

This provides product-specific color backgrounds for asset cards and consistent shadow depth for interactive elements.

---

## 2. SEARCH FUNCTIONALITY IMPLEMENTATION

### 2.1 Add Search Helper Function

**File to Modify:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/lib/assets.ts`

Add this function after the existing filter functions (around line 199):

```typescript
/**
 * Search assets by text query (title, summary, product category, content type).
 * Returns results sorted by relevance (title match > summary match).
 */
export function searchAssets(query: string): Asset[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const scored = sampleAssets
    .map(asset => {
      let score = 0;
      // Title match: highest priority
      if (asset.title.toLowerCase().includes(q)) score += 100;
      // Category/ContentType match
      if (asset.productCategory.toLowerCase().includes(q)) score += 50;
      if (asset.contentType.toLowerCase().includes(q)) score += 40;
      // Summary match: lowest priority
      if (asset.summaryWhat.toLowerCase().includes(q)) score += 10;
      return { asset, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(({ asset }) => asset);
}

/**
 * Get popular search suggestions and recent search trends.
 * Returns an array of suggestion strings grouped by category.
 */
export function getSearchSuggestions(limit = 8): {
  category: string;
  suggestions: string[];
}[] {
  const contentTypes = new Set(sampleAssets.map(a => a.contentType));
  const products = new Set(sampleAssets.map(a => a.productCategory));

  return [
    {
      category: "Popular Content Types",
      suggestions: Array.from(contentTypes).slice(0, 4)
    },
    {
      category: "Featured Products",
      suggestions: Array.from(products).slice(0, 4)
    }
  ];
}
```

### 2.2 Create SearchBar Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/SearchBar.tsx`

This component renders an interactive search input with autocomplete dropdown:

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { searchAssets, getSearchSuggestions } from "@/lib/assets";

interface SearchBarProps {
  /** Whether to show the search input inline (default: false = overlay mode) */
  inline?: boolean;
  /** Called when search input is closed (overlay mode only) */
  onClose?: () => void;
}

export function SearchBar({ inline = false, onClose }: SearchBarProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(searchAssets(""));
  const [suggestions, setSuggestions] = useState(getSearchSuggestions());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update search results as user types
  useEffect(() => {
    if (query.trim()) {
      setResults(searchAssets(query));
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setSuggestions(getSearchSuggestions());
    }
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      if (!inline && onClose) onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const max = results.length > 0 ? results.length : 0;
      setSelectedIndex(selectedIndex < max - 1 ? selectedIndex + 1 : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/assets/${results[selectedIndex].slug}`);
        setQuery("");
        setIsOpen(false);
        if (!inline && onClose) onClose();
      } else if (query.trim()) {
        // Go to search results page
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setQuery("");
        setIsOpen(false);
        if (!inline && onClose) onClose();
      }
    }
  };

  const handleSearchSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(true);
  };

  const displayResults = query.trim() ? results : [];

  return (
    <div
      ref={containerRef}
      className={inline ? "w-full" : "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20"}
    >
      <div className={inline ? "w-full" : "w-full max-w-2xl mx-6"}>
        <div className="relative">
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-4 text-gray-400 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder") || "Search assets, products..."}
              className={`w-full rounded-full border border-gray-300 bg-white px-12 py-3 text-sm outline-none transition focus:border-[#2CADB2] focus:ring-2 focus:ring-[#2CADB2]/20 text-[#24282B] placeholder-gray-500`}
              style={{ fontFamily: "Raleway, sans-serif" }}
              autoFocus={!inline}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Keyboard shortcut hint */}
          {!query && inline && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-200">⌘K</kbd>
            </div>
          )}

          {/* Dropdown with results or suggestions */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
              {displayResults.length > 0 ? (
                <div className="p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 px-3 py-2 font-semibold">
                    {t("results") || `Results (${displayResults.length})`}
                  </p>
                  <div className="space-y-2">
                    {displayResults.map((asset, idx) => (
                      <button
                        key={asset.id}
                        onClick={() => {
                          router.push(`/assets/${asset.slug}`);
                          setQuery("");
                          setIsOpen(false);
                          if (!inline && onClose) onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left rounded-xl border px-3 py-2 transition ${
                          selectedIndex === idx
                            ? "bg-[#f0fbfa] border-[#2CADB2]"
                            : "bg-white border-gray-200 hover:border-[#2CADB2]/60"
                        }`}
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1">
                          {asset.productCategory} · {asset.contentType}
                        </p>
                        <p className="text-xs font-semibold text-[#24282B]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {asset.title}
                        </p>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                      setQuery("");
                      setIsOpen(false);
                    }}
                    className="w-full text-center text-xs font-semibold text-[#2CADB2] hover:bg-gray-50 py-2 mt-2 border-t border-gray-200"
                  >
                    {t("viewAll") || "View all results"}
                  </button>
                </div>
              ) : query ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-600">{t("noResults") || "No results found"}</p>
                </div>
              ) : (
                // Show suggestions when empty
                <div className="p-4 space-y-4">
                  {suggestions.map((group) => (
                    <div key={group.category}>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 px-2 mb-2 font-semibold">
                        {group.category}
                      </p>
                      <div className="space-y-1">
                        {group.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSearchSuggestion(suggestion)}
                            className="w-full text-left px-3 py-2 text-sm text-[#24282B] hover:bg-gray-50 rounded-lg transition"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Key Features:**
- Real-time autocomplete as user types (filters against asset titles, categories, content types)
- Arrow key navigation through results
- Enter key to select/submit
- Escape key to close
- Shows suggestions (popular content types, featured products) when empty
- Supports both inline and overlay modes
- Responsive dropdown that doesn't overflow viewport

### 2.3 Create Search Results Page

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/app/[locale]/search/page.tsx`

This page displays full search results with filters:

```typescript
"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { sampleAssets, searchAssets, type ContentType, type ProductCategory, type UseCase } from "@/lib/assets";
import { FilterSidebar } from "@/components/FilterSidebar";
import { AssetCard } from "@/components/AssetCard";
import { X } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("search");
  const query = searchParams.get("q") || "";

  // Filter state
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductCategory[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<UseCase[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "downloaded">("newest");

  // Get search results
  const searchResults = useMemo(() => {
    let results = searchAssets(query);

    // Apply filters
    if (selectedContentTypes.length > 0) {
      results = results.filter(a => selectedContentTypes.includes(a.contentType));
    }
    if (selectedProducts.length > 0) {
      results = results.filter(a => selectedProducts.includes(a.productCategory));
    }
    if (selectedUseCases.length > 0) {
      results = results.filter(a => a.useCases.some(u => selectedUseCases.includes(u)));
    }

    // Apply sort
    if (sortBy === "popular") {
      results.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortBy === "downloaded") {
      results.sort((a, b) => b.downloadCount - a.downloadCount);
    } else {
      results.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    return results;
  }, [query, selectedContentTypes, selectedProducts, selectedUseCases, sortBy]);

  const hasActiveFilters = selectedContentTypes.length > 0 || selectedProducts.length > 0 || selectedUseCases.length > 0;

  const clearAllFilters = () => {
    setSelectedContentTypes([]);
    setSelectedProducts([]);
    setSelectedUseCases([]);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-black text-[#24282B]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {t("title") || "Search Results"}
          </h1>
          {query && (
            <p className="text-gray-600 mt-2">
              {t("resultsFor") || "Results for"}: <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <FilterSidebar
          selectedContentTypes={selectedContentTypes}
          onContentTypeChange={setSelectedContentTypes}
          selectedProducts={selectedProducts}
          onProductChange={setSelectedProducts}
          selectedUseCases={selectedUseCases}
          onUseCaseChange={setSelectedUseCases}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Main content */}
        <div className="flex-1">
          {/* Filter chips and sort */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
              {selectedContentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedContentTypes(prev => prev.filter(t => t !== type))}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2CADB2] text-white px-3 py-1 text-xs font-semibold hover:bg-[#2CADB2]/90"
                >
                  {type}
                  <X size={12} />
                </button>
              ))}
              {selectedProducts.map(product => (
                <button
                  key={product}
                  onClick={() => setSelectedProducts(prev => prev.filter(p => p !== product))}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2CADB2] text-white px-3 py-1 text-xs font-semibold hover:bg-[#2CADB2]/90"
                >
                  {product}
                  <X size={12} />
                </button>
              ))}
              {selectedUseCases.map(useCase => (
                <button
                  key={useCase}
                  onClick={() => setSelectedUseCases(prev => prev.filter(u => u !== useCase))}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2CADB2] text-white px-3 py-1 text-xs font-semibold hover:bg-[#2CADB2]/90"
                >
                  {useCase}
                  <X size={12} />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600" style={{ fontFamily: "Raleway, sans-serif" }}>
                {t("sortBy") || "Sort by"}:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-[#24282B] focus:border-[#2CADB2] focus:ring-2 focus:ring-[#2CADB2]/20"
              >
                <option value="newest">{t("newest") || "Newest"}</option>
                <option value="popular">{t("popular") || "Most Popular"}</option>
                <option value="downloaded">{t("downloaded") || "Most Downloaded"}</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: "Raleway, sans-serif" }}>
            {searchResults.length} {t("assetsFound") || "assets found"}
          </p>

          {/* Results grid */}
          {searchResults.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-2">{t("noResults") || "No assets match your search."}</p>
              <p className="text-sm text-gray-500">
                {t("tryAdjusting") || "Try adjusting your filters or search query."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 3. ASSET CARD COMPONENT (Reusable)

### 3.1 Create AssetCard Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/AssetCard.tsx`

This component renders a single asset in grid layouts (used on library, search, featured pages):

```typescript
"use client";

import Link from "next/link";
import { Asset } from "@/lib/assets";
import { Download, Eye } from "lucide-react";

interface AssetCardProps {
  asset: Asset;
  /** Optional badge text to display */
  badge?: string;
}

// Map content type to icon (simple)
const contentTypeIcons: Record<string, string> = {
  "Video": "🎬",
  "Presentation": "📊",
  "Document": "📄",
  "Case Study": "📈",
  "Playbook": "📋",
  "Training": "🎓",
  "Tool": "🛠"
};

export function AssetCard({ asset, badge }: AssetCardProps) {
  const icon = contentTypeIcons[asset.contentType] || "📄";

  return (
    <Link
      href={`/assets/${asset.slug}`}
      className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200"
    >
      {/* Thumbnail area */}
      <div className="relative h-40 bg-gradient-to-br from-[#2CADB2]/5 to-[#F8CF41]/5 flex items-center justify-center border-b border-gray-200 group-hover:from-[#2CADB2]/10 group-hover:to-[#F8CF41]/10 transition">
        <span className="text-5xl">{icon}</span>
        {badge && (
          <div className="absolute top-2 right-2 bg-[#2CADB2] text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 font-semibold">
            {asset.productCategory}
          </p>
          <span className="text-[11px] font-semibold text-gray-400">
            {asset.contentType}
          </span>
        </div>

        <h3
          className="font-black text-sm mb-2 text-[#24282B] line-clamp-2 group-hover:text-[#2CADB2] transition"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {asset.title}
        </h3>

        <p
          className="text-xs text-gray-600 mb-4 line-clamp-3"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {asset.summaryWhat}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{asset.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={12} />
            <span>{asset.downloadCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

**Key Features:**
- Emoji icons for quick visual distinction by content type
- Hover state with subtle shadow and text color change
- Displays product category, content type, title, summary
- View and download count display
- Responsive grid usage with gap control

---

## 4. FILTER SIDEBAR COMPONENT

### 4.1 Create FilterSidebar Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/FilterSidebar.tsx`

Persistent filter panel for search and library pages:

```typescript
"use client";

import { useTranslations } from "next-intl";
import { type ContentType, type ProductCategory, type UseCase, journeyProducts } from "@/lib/assets";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FilterSidebarProps {
  selectedContentTypes: ContentType[];
  onContentTypeChange: (types: ContentType[]) => void;
  selectedProducts: ProductCategory[];
  onProductChange: (products: ProductCategory[]) => void;
  selectedUseCases: UseCase[];
  onUseCaseChange: (useCases: UseCase[]) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

const contentTypeOptions: ContentType[] = [
  "Video",
  "Presentation",
  "Document",
  "Case Study",
  "Playbook",
  "Training",
  "Tool"
];

const useCaseOptions: UseCase[] = [
  "Sales",
  "Marketing",
  "Training & Onboarding",
  "Support"
];

export function FilterSidebar({
  selectedContentTypes,
  onContentTypeChange,
  selectedProducts,
  onProductChange,
  selectedUseCases,
  onUseCaseChange,
  onClearAll,
  hasActiveFilters
}: FilterSidebarProps) {
  const t = useTranslations("filters");
  const [openSections, setOpenSections] = useState({
    products: true,
    contentTypes: true,
    useCases: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleContentType = (type: ContentType) => {
    onContentTypeChange(
      selectedContentTypes.includes(type)
        ? selectedContentTypes.filter(t => t !== type)
        : [...selectedContentTypes, type]
    );
  };

  const toggleProduct = (product: ProductCategory) => {
    onProductChange(
      selectedProducts.includes(product)
        ? selectedProducts.filter(p => p !== product)
        : [...selectedProducts, product]
    );
  };

  const toggleUseCase = (useCase: UseCase) => {
    onUseCaseChange(
      selectedUseCases.includes(useCase)
        ? selectedUseCases.filter(u => u !== useCase)
        : [...selectedUseCases, useCase]
    );
  };

  // Get unique product categories from data
  const allProducts = Array.from(
    new Set(journeyProducts.map(p => p.category))
  );

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-sm text-[#24282B]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {t("title") || "Filters"}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-[#2CADB2] hover:text-[#2CADB2]/80"
            >
              {t("clearAll") || "Clear all"}
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Products Filter */}
          <div>
            <button
              onClick={() => toggleSection("products")}
              className="w-full flex items-center justify-between text-sm font-semibold text-[#24282B] mb-3 hover:text-[#2CADB2]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("products") || "Products"}
              <ChevronDown
                size={16}
                className={`transition-transform ${openSections.products ? "rotate-180" : ""}`}
              />
            </button>
            {openSections.products && (
              <div className="space-y-2 pl-2">
                {allProducts.map(product => (
                  <label key={product} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product)}
                      onChange={() => toggleProduct(product)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2CADB2] focus:ring-[#2CADB2]"
                    />
                    <span className="text-sm text-gray-700">{product}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Content Type Filter */}
          <div>
            <button
              onClick={() => toggleSection("contentTypes")}
              className="w-full flex items-center justify-between text-sm font-semibold text-[#24282B] mb-3 hover:text-[#2CADB2]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("contentType") || "Content Type"}
              <ChevronDown
                size={16}
                className={`transition-transform ${openSections.contentTypes ? "rotate-180" : ""}`}
              />
            </button>
            {openSections.contentTypes && (
              <div className="space-y-2 pl-2">
                {contentTypeOptions.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedContentTypes.includes(type)}
                      onChange={() => toggleContentType(type)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2CADB2] focus:ring-[#2CADB2]"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Use Case Filter */}
          <div>
            <button
              onClick={() => toggleSection("useCases")}
              className="w-full flex items-center justify-between text-sm font-semibold text-[#24282B] mb-3 hover:text-[#2CADB2]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("useCase") || "Use Case"}
              <ChevronDown
                size={16}
                className={`transition-transform ${openSections.useCases ? "rotate-180" : ""}`}
              />
            </button>
            {openSections.useCases && (
              <div className="space-y-2 pl-2">
                {useCaseOptions.map(useCase => (
                  <label key={useCase} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUseCases.includes(useCase)}
                      onChange={() => toggleUseCase(useCase)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2CADB2] focus:ring-[#2CADB2]"
                    />
                    <span className="text-sm text-gray-700">{useCase}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
```

**Key Features:**
- Collapsible sections with chevron indicators
- Checkbox controls for multi-select filtering
- Sticky positioning so it stays visible while scrolling
- "Clear all" button when filters are active
- Mobile responsive (will collapse on smaller screens - handled by parent layout)

---

## 5. LIBRARY PAGE IMPLEMENTATION

### 5.1 Create LibraryGrid Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/LibraryGrid.tsx`

Grid layout wrapper for asset cards with responsive behavior:

```typescript
"use client";

import { Asset } from "@/lib/assets";
import { AssetCard } from "./AssetCard";

interface LibraryGridProps {
  assets: Asset[];
  columns?: 3 | 4;
}

export function LibraryGrid({ assets, columns = 3 }: LibraryGridProps) {
  const gridClass = columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gridClass} gap-6`}>
      {assets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
```

### 5.2 Create Library Page

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/app/[locale]/library/page.tsx`

The main library/browse destination with persistent filters:

```typescript
"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { sampleAssets, type ContentType, type ProductCategory, type UseCase } from "@/lib/assets";
import { FilterSidebar } from "@/components/FilterSidebar";
import { LibraryGrid } from "@/components/LibraryGrid";
import { X } from "lucide-react";

export default function LibraryPage() {
  const t = useTranslations("library");

  // Filter state
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductCategory[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<UseCase[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "downloaded">("newest");

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let results = [...sampleAssets];

    // Apply filters
    if (selectedContentTypes.length > 0) {
      results = results.filter(a => selectedContentTypes.includes(a.contentType));
    }
    if (selectedProducts.length > 0) {
      results = results.filter(a => selectedProducts.includes(a.productCategory));
    }
    if (selectedUseCases.length > 0) {
      results = results.filter(a => a.useCases.some(u => selectedUseCases.includes(u)));
    }

    // Apply sort
    if (sortBy === "popular") {
      results.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortBy === "downloaded") {
      results.sort((a, b) => b.downloadCount - a.downloadCount);
    } else {
      results.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    return results;
  }, [selectedContentTypes, selectedProducts, selectedUseCases, sortBy]);

  const hasActiveFilters = selectedContentTypes.length > 0 || selectedProducts.length > 0 || selectedUseCases.length > 0;

  const clearAllFilters = () => {
    setSelectedContentTypes([]);
    setSelectedProducts([]);
    setSelectedUseCases([]);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-black text-[#24282B]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {t("title") || "Resource Library"}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("subtitle") || "Browse all training, sales, and marketing materials."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <FilterSidebar
          selectedContentTypes={selectedContentTypes}
          onContentTypeChange={setSelectedContentTypes}
          selectedProducts={selectedProducts}
          onProductChange={setSelectedProducts}
          selectedUseCases={selectedUseCases}
          onUseCaseChange={setSelectedUseCases}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Main content */}
        <div className="flex-1">
          {/* Filter chips and sort */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
              {selectedContentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedContentTypes(prev => prev.filter(t => t !== type))}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2CADB2] text-white px-3 py-1 text-xs font-semibold hover:bg-[#2CADB2]/90"
                >
                  {type}
                  <X size={12} />
                </button>
              ))}
              {selectedProducts.map(product => (
                <button
                  key={product}
                  onClick={() => setSelectedProducts(prev => prev.filter(p => p !== product))}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2CADB2] text-white px-3 py-1 text-xs font-semibold hover:bg-[#2CADB2]/90"
                >
                  {product}
                  <X size={12} />
                </button>
              ))}
              {selectedUseCases.map(useCase => (
                <button
                  key={useCase}
                  onClick={() => setSelectedUseCases(prev => prev.filter(u => u !== useCase))}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2CADB2] text-white px-3 py-1 text-xs font-semibold hover:bg-[#2CADB2]/90"
                >
                  {useCase}
                  <X size={12} />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600" style={{ fontFamily: "Raleway, sans-serif" }}>
                {t("sortBy") || "Sort by"}:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-[#24282B] focus:border-[#2CADB2] focus:ring-2 focus:ring-[#2CADB2]/20"
              >
                <option value="newest">{t("newest") || "Newest"}</option>
                <option value="popular">{t("popular") || "Most Popular"}</option>
                <option value="downloaded">{t("downloaded") || "Most Downloaded"}</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: "Raleway, sans-serif" }}>
            {filteredAssets.length} {t("assetsFound") || "assets"}
          </p>

          {/* Results grid */}
          {filteredAssets.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-2">{t("noAssets") || "No assets match your filters."}</p>
              <button
                onClick={clearAllFilters}
                className="text-sm font-semibold text-[#2CADB2] hover:underline mt-3"
              >
                {t("clearFilters") || "Clear all filters"}
              </button>
            </div>
          ) : (
            <LibraryGrid assets={filteredAssets} />
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 6. HOMEPAGE REDESIGN

### 6.1 Update Hero Section

**File to Modify:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/app/[locale]/page.tsx`

Reduce hero height from 70vh to ~40-50vh and remove the background image dominance:

```typescript
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { HomeHighlights } from "@/components/HomeHighlights";
import { HomeBrowseSection } from "@/components/HomeBrowseSection";

export default async function Home() {
  const t = await getTranslations("hero");

  return (
    <>
      {/* Minimal Hero */}
      <section className="relative min-h-[45vh] flex flex-col justify-center items-center px-6 py-16 bg-gradient-to-br from-white via-white to-[#f0fbfa]">
        <div className="relative z-10 max-w-4xl text-center">
          <p
            className="uppercase mb-4 text-[#2CADB2]"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em"
            }}
          >
            {t("welcome")}
          </p>
          <h1
            className="font-black leading-tight mb-4"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)"
            }}
          >
            <span style={{ color: "#2CADB2" }}>Hostopia</span>
            <span className="text-[#24282B]">Connects</span>
          </h1>
          <p
            className="text-base max-w-2xl mx-auto mb-8 text-gray-700"
            style={{
              fontFamily: "Raleway, sans-serif",
              lineHeight: 1.625
            }}
          >
            {t("tagline")}
          </p>
          <div className="max-w-md mx-auto">
            <Link
              href="/library"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold bg-[#2CADB2] text-white hover:bg-[#2CADB2]/90 transition"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("browse") || "Browse All Resources"}
            </Link>
          </div>
        </div>
      </section>

      {/* Role-based Quick Entry Cards */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-2xl font-black text-center mb-10 text-[#24282B]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            What are you looking for?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Training */}
            <Link
              href="/library?useCase=Training%20%26%20Onboarding"
              className="rounded-xl border-2 border-gray-200 bg-white p-8 hover:border-[#2CADB2] hover:shadow-lg transition group"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-black text-lg mb-2 text-[#24282B] group-hover:text-[#2CADB2]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Train My Team
              </h3>
              <p className="text-sm text-gray-600">
                Sales enablement, product training, and onboarding materials
              </p>
            </Link>

            {/* Card 2: Product Positioning */}
            <Link
              href="/library?useCase=Sales"
              className="rounded-xl border-2 border-gray-200 bg-white p-8 hover:border-[#2CADB2] hover:shadow-lg transition group"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-black text-lg mb-2 text-[#24282B] group-hover:text-[#2CADB2]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Position a Product
              </h3>
              <p className="text-sm text-gray-600">
                Value props, case studies, and sales decks
              </p>
            </Link>

            {/* Card 3: Marketing Materials */}
            <Link
              href="/library?useCase=Marketing"
              className="rounded-xl border-2 border-gray-200 bg-white p-8 hover:border-[#2CADB2] hover:shadow-lg transition group"
            >
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="font-black text-lg mb-2 text-[#24282B] group-hover:text-[#2CADB2]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Create a Campaign
              </h3>
              <p className="text-sm text-gray-600">
                Email templates, presentations, and promotional assets
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* What's New Highlights */}
      <HomeHighlights />

      {/* Interactive Browse Section */}
      <HomeBrowseSection />
    </>
  );
}
```

### 6.2 Create HomeBrowseSection Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/HomeBrowseSection.tsx`

Inline, interactive guided wizard for the homepage:

```typescript
"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  journeys,
  journeyProducts,
  sampleAssets,
  type ProductJourney,
  type ProductCategory,
  type ContentType
} from "@/lib/assets";
import { AssetCard } from "./AssetCard";
import { ArrowRight } from "lucide-react";

type Step = 1 | 2 | 3;

export function HomeBrowseSection() {
  const t = useTranslations("browse");
  const [step, setStep] = useState<Step>(1);
  const [selectedJourneys, setSelectedJourneys] = useState<ProductJourney[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductCategory[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  const [showResults, setShowResults] = useState(false);

  const journeyProductsForSelection = useMemo(() => {
    return selectedJourneys.length > 0
      ? journeyProducts.filter(p => selectedJourneys.includes(p.journey))
      : [];
  }, [selectedJourneys]);

  const filteredAssets = useMemo(() => {
    let results = sampleAssets;
    if (selectedJourneys.length > 0) {
      results = results.filter(a => selectedJourneys.includes(a.journey));
    }
    if (selectedProducts.length > 0) {
      results = results.filter(a => selectedProducts.includes(a.productCategory));
    }
    if (selectedContentTypes.length > 0) {
      results = results.filter(a => selectedContentTypes.includes(a.contentType));
    }
    return results;
  }, [selectedJourneys, selectedProducts, selectedContentTypes]);

  const resetWizard = () => {
    setStep(1);
    setSelectedJourneys([]);
    setSelectedProducts([]);
    setSelectedContentTypes([]);
    setShowResults(false);
  };

  return (
    <section className="py-16 bg-[#f7f6f2] border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <h2
          className="text-3xl font-black text-center mb-4 text-[#24282B]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {t("title")}
        </h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>

        {!showResults ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            {/* Step 1: Journey Selection */}
            {step === 1 && (
              <div>
                <p className="text-sm font-semibold text-[#2CADB2] uppercase tracking-widest mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Step 1: {t("step1")}
                </p>
                <p className="text-gray-700 mb-6">{t("step1Desc")}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {journeys.map(j => {
                    const selected = selectedJourneys.includes(j.label);
                    return (
                      <button
                        key={j.slug}
                        onClick={() => {
                          setSelectedJourneys(prev =>
                            prev.includes(j.label)
                              ? prev.filter(x => x !== j.label)
                              : [...prev, j.label]
                          );
                          setSelectedProducts([]);
                          setSelectedContentTypes([]);
                        }}
                        className={`rounded-xl border-2 p-4 text-left transition ${
                          selected
                            ? "border-[#2CADB2] bg-[#f0fbfa]"
                            : "border-gray-200 bg-white hover:border-[#2CADB2]/50"
                        }`}
                      >
                        <p className="font-black text-[#24282B]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {j.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedJourneys.length === 0}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold bg-[#2CADB2] text-white hover:bg-[#2CADB2]/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {t("next")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Product Selection */}
            {step === 2 && (
              <div>
                <p className="text-sm font-semibold text-[#2CADB2] uppercase tracking-widest mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Step 2: {t("step2")}
                </p>
                <p className="text-gray-700 mb-6">{t("step2Desc")}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {journeyProductsForSelection.map(p => {
                    const selected = selectedProducts.includes(p.category);
                    return (
                      <button
                        key={p.slug}
                        onClick={() => {
                          setSelectedProducts(prev =>
                            prev.includes(p.category)
                              ? prev.filter(x => x !== p.category)
                              : [...prev, p.category]
                          );
                        }}
                        className={`rounded-xl border-2 p-4 text-left transition ${
                          selected
                            ? "border-[#2CADB2] bg-[#f0fbfa]"
                            : "border-gray-200 bg-white hover:border-[#2CADB2]/50"
                        }`}
                      >
                        <p className="font-black text-[#24282B] text-sm" style={{ fontFamily: "Montserrat, sans-serif" }}>
                          {p.label}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm font-semibold text-gray-600 hover:text-[#2CADB2]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={selectedProducts.length === 0}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold bg-[#2CADB2] text-white hover:bg-[#2CADB2]/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {t("next")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Content Type Selection */}
            {step === 3 && (
              <div>
                <p className="text-sm font-semibold text-[#2CADB2] uppercase tracking-widest mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Step 3: {t("step3")}
                </p>
                <p className="text-gray-700 mb-6">{t("step3Desc")}</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {["Video", "Presentation", "Document", "Playbook", "Training"].map(type => {
                    const selected = selectedContentTypes.includes(type as ContentType);
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedContentTypes(prev =>
                            prev.includes(type as ContentType)
                              ? prev.filter(t => t !== type)
                              : [...prev, type as ContentType]
                          );
                        }}
                        className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                          selected
                            ? "border-[#2CADB2] bg-[#2CADB2] text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-[#2CADB2]/50"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm font-semibold text-gray-600 hover:text-[#2CADB2]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setShowResults(true)}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold bg-[#2CADB2] text-white hover:bg-[#2CADB2]/90 transition"
                  >
                    {t("viewResults")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Results view
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-[#24282B] mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {t("viewYourResults")}
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredAssets.length} {t("viewYourResultsDesc")}
                </p>
              </div>
              <button
                onClick={resetWizard}
                className="text-sm font-semibold text-gray-600 hover:text-[#2CADB2]"
              >
                Start Over
              </button>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">{t("noAssetsMatch")}</p>
                <button
                  onClick={resetWizard}
                  className="text-sm font-semibold text-[#2CADB2] hover:underline"
                >
                  Reset and try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.slice(0, 6).map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
```

---

## 7. NAVIGATION RESTRUCTURE

### 7.1 Create NavDropdown Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/NavDropdown.tsx`

Reusable dropdown component for header navigation:

```typescript
"use client";

import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

interface NavDropdownProps {
  label: string;
  children: ReactNode;
  /**  Optional className for the trigger button */
  triggerClassName?: string;
}

export function NavDropdown({ label, children, triggerClassName = "" }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`flex items-center gap-1 text-sm font-semibold text-[#24282B] hover:text-[#2CADB2] transition ${triggerClassName}`}
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {label}
        <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
      </button>

      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute left-0 mt-0 pt-2 z-50"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 7.2 Create MegaMenu Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/MegaMenu.tsx`

Product mega menu showing all products grouped by journey:

```typescript
"use client";

import Link from "next/link";
import { journeyProducts } from "@/lib/assets";

const journeys = [
  "Build a Brand",
  "Get Online",
  "Get Found",
  "Grow their Business"
];

export function MegaMenu() {
  const productsByJourney = journeys.map(journey => ({
    journey,
    products: journeyProducts.filter(p => p.journey === journey)
  }));

  return (
    <div className="grid grid-cols-4 gap-6 p-6 min-w-max">
      {productsByJourney.map(group => (
        <div key={group.journey}>
          <h3
            className="text-xs font-black uppercase tracking-widest text-[#2CADB2] mb-3"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {group.journey}
          </h3>
          <ul className="space-y-2">
            {group.products.map(product => (
              <li key={product.slug}>
                <Link
                  href={`/assets/product/${product.slug}`}
                  className="text-sm text-gray-700 hover:text-[#2CADB2] hover:font-semibold transition"
                >
                  {product.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### 7.3 Update Header Layout

**File to Modify:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/app/[locale]/layout.tsx`

Restructure the header navigation:

```typescript
import type { ReactNode } from "react";
import Image from "next/image";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { CartLayoutClient } from "@/components/CartLayoutClient";
import { CartNav } from "@/components/CartNav";
import { TickerBar } from "@/components/TickerBar";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NavDropdown } from "@/components/NavDropdown";
import { MegaMenu } from "@/components/MegaMenu";
import { Footer } from "@/components/Footer";
import { Search } from "lucide-react";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const tNav = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <CartLayoutClient>
        <div className="min-h-screen bg-[#f7f6f2] text-[#24282B] flex flex-col">
          <TickerBar />
          <header className="border-b border-black/5 bg-white sticky top-0 z-40">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#2CADB2] via-[#F8CF41] to-[#2CADB2]" />
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0" aria-label="Hostopia Connects home">
                <Image
                  src="/logo-hostopia-nav.png"
                  alt="Hostopia - A HostPapa Company"
                  width={160}
                  height={48}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>

              {/* Main Navigation */}
              <nav className="flex items-center gap-8 flex-1">
                <Link
                  href="/"
                  className="text-sm font-semibold text-[#24282B] hover:text-[#2CADB2] transition"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {tNav("home")}
                </Link>

                <Link
                  href="/library"
                  className="text-sm font-semibold text-[#24282B] hover:text-[#2CADB2] transition"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {tNav("library") || "Library"}
                </Link>

                <NavDropdown label={tNav("products") || "Products"}>
                  <MegaMenu />
                </NavDropdown>

                <NavDropdown label={tNav("resources") || "Resources"}>
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <Link
                      href="/library?contentType=Video"
                      className="text-sm text-gray-700 hover:text-[#2CADB2] transition"
                    >
                      Videos
                    </Link>
                    <Link
                      href="/library?contentType=Document"
                      className="text-sm text-gray-700 hover:text-[#2CADB2] transition"
                    >
                      Documents
                    </Link>
                    <Link
                      href="/library?contentType=Presentation"
                      className="text-sm text-gray-700 hover:text-[#2CADB2] transition"
                    >
                      Presentations
                    </Link>
                    <Link
                      href="/library?contentType=Playbook"
                      className="text-sm text-gray-700 hover:text-[#2CADB2] transition"
                    >
                      Playbooks
                    </Link>
                    <Link
                      href="/library?contentType=Training"
                      className="text-sm text-gray-700 hover:text-[#2CADB2] transition"
                    >
                      Training
                    </Link>
                    <Link
                      href="/library?contentType=Case Study"
                      className="text-sm text-gray-700 hover:text-[#2CADB2] transition"
                    >
                      Case Studies
                    </Link>
                  </div>
                </NavDropdown>
              </nav>

              {/* Right-side actions */}
              <div className="flex items-center gap-4">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700"
                  aria-label="Search"
                  onClick={() => {
                    // Open search overlay - handled by SearchBar component in page
                    // This is a simplified trigger; you may implement via context/state
                  }}
                >
                  <Search size={18} />
                </button>
                <CartNav />
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </div>
      </CartLayoutClient>
    </NextIntlClientProvider>
  );
}
```

### 7.4 Create Footer Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/Footer.tsx`

Comprehensive footer with links and information:

```typescript
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { journeyProducts } from "@/lib/assets";

export function Footer() {
  const t = useTranslations("footer");

  const journeys = [
    "Build a Brand",
    "Get Online",
    "Get Found",
    "Grow their Business"
  ];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* Product Journeys */}
          {journeys.map(journey => {
            const products = journeyProducts.filter(p => p.journey === journey);
            return (
              <div key={journey}>
                <h3
                  className="text-xs font-black uppercase tracking-widest text-[#2CADB2] mb-4"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {journey}
                </h3>
                <ul className="space-y-2">
                  {products.map(product => (
                    <li key={product.slug}>
                      <Link
                        href={`/assets/product/${product.slug}`}
                        className="text-sm text-gray-600 hover:text-[#2CADB2] transition"
                      >
                        {product.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 pt-8 flex items-center justify-between">
          <p className="text-xs text-gray-500" style={{ fontFamily: "Raleway, sans-serif" }}>
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="text-xs text-gray-600 hover:text-[#2CADB2]">
              {t("howItWorks")}
            </Link>
            <a
              href="https://hostpapa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-[#2CADB2]"
            >
              {t("hostpapa") || "HostPapa.com"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## 8. ASSET DETAIL PAGE ENHANCEMENTS

### 8.1 Update Asset Detail Page

**File to Modify:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/app/[locale]/assets/[slug]/page.tsx`

Add breadcrumbs, related assets, and download button:

```typescript
import { notFound } from "next/navigation";
import { getAssetBySlug, getAssetsByProductCategory } from "@/lib/assets";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedAssets } from "@/components/RelatedAssets";
import { AssetDetailContent } from "@/components/AssetDetailContent";
import { Download } from "lucide-react";
import Link from "next/link";

interface AssetDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { slug } = await params;
  const asset = getAssetBySlug(slug);

  if (!asset) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Library", href: "/library" },
              { label: asset.productCategory, href: `/library?product=${asset.productCategory}` },
              { label: asset.title }
            ]}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Asset thumbnail/preview */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-[#2CADB2]/5 to-[#F8CF41]/5 border border-gray-200 p-12 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-sm text-gray-600">{asset.title}</p>
          </div>
        </div>

        {/* Header with download */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-sm uppercase tracking-widest text-[#2CADB2] font-semibold mb-2">
              {asset.productCategory} • {asset.contentType}
            </p>
            <h1
              className="text-4xl font-black text-[#24282B] mb-4"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {asset.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>👁 {asset.viewCount} views</span>
              <span>📥 {asset.downloadCount} downloads</span>
            </div>
          </div>

          <a
            href={asset.fileUrl}
            download
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[#2CADB2] text-white font-semibold hover:bg-[#2CADB2]/90 transition whitespace-nowrap"
          >
            <Download size={16} />
            Download
          </a>
        </div>

        {/* Asset Content (What/Why/How) */}
        <AssetDetailContent asset={asset} />
      </div>

      {/* Related Assets */}
      <RelatedAssets productCategory={asset.productCategory} currentAssetId={asset.id} />
    </div>
  );
}
```

### 8.2 Create Breadcrumbs Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/Breadcrumbs.tsx`

Navigation breadcrumbs for asset detail:

```typescript
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight size={14} className="text-gray-400" />}
          {item.href ? (
            <Link href={item.href} className="text-[#2CADB2] hover:text-[#2CADB2]/80">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
```

### 8.3 Create RelatedAssets Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/RelatedAssets.tsx`

Shows assets from the same product category:

```typescript
"use client";

import { getAssetsByProductCategory, type ProductCategory } from "@/lib/assets";
import { AssetCard } from "./AssetCard";

interface RelatedAssetsProps {
  productCategory: ProductCategory;
  currentAssetId: string;
}

export function RelatedAssets({ productCategory, currentAssetId }: RelatedAssetsProps) {
  const relatedAssets = getAssetsByProductCategory(productCategory)
    .filter(a => a.id !== currentAssetId)
    .slice(0, 3);

  if (relatedAssets.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-gray-200 bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className="text-2xl font-black text-[#24282B] mb-8"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Related Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedAssets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 8.4 Create AssetDetailContent Component

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/components/AssetDetailContent.tsx`

Displays the What/Why/How content structure:

```typescript
import { Asset } from "@/lib/assets";

interface AssetDetailContentProps {
  asset: Asset;
}

export function AssetDetailContent({ asset }: AssetDetailContentProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* What */}
        <div>
          <h3
            className="text-sm font-black uppercase tracking-widest text-[#2CADB2] mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            What It Is
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {asset.summaryWhat}
          </p>
        </div>

        {/* Why */}
        <div>
          <h3
            className="text-sm font-black uppercase tracking-widest text-[#2CADB2] mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Why It Matters
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {asset.summaryWhy}
          </p>
        </div>

        {/* How */}
        <div>
          <h3
            className="text-sm font-black uppercase tracking-widest text-[#2CADB2] mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            How to Use
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {asset.summaryHow}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-4 gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Language</p>
          <p className="text-sm font-semibold text-[#24282B]">{asset.language}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Region</p>
          <p className="text-sm font-semibold text-[#24282B]">{asset.region}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Use Cases</p>
          <p className="text-sm font-semibold text-[#24282B]">{asset.useCases.join(", ")}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Last Updated</p>
          <p className="text-sm font-semibold text-[#24282B]">
            {new Date(asset.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 9. INTERNATIONALIZATION (i18n) UPDATES

### 9.1 Update English Messages

**File to Modify:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/messages/en.json`

Add new translation keys for all new UI elements:

```json
{
  "nav": {
    "home": "Home",
    "library": "Library",
    "products": "Products",
    "resources": "Resources",
    "myResources": "My Resources",
    "howItWorks": "How it works"
  },
  "search": {
    "placeholder": "Search assets, products, use cases...",
    "results": "Results",
    "viewAll": "View all results",
    "noResults": "No assets found",
    "title": "Search Results",
    "resultsFor": "Results for",
    "sortBy": "Sort by",
    "newest": "Newest",
    "popular": "Most Popular",
    "downloaded": "Most Downloaded",
    "assetsFound": "assets found",
    "tryAdjusting": "Try adjusting your filters or search query."
  },
  "filters": {
    "title": "Filters",
    "clearAll": "Clear all",
    "products": "Products",
    "contentType": "Content Type",
    "useCase": "Use Case"
  },
  "library": {
    "title": "Resource Library",
    "subtitle": "Browse all training, sales, and marketing materials.",
    "sortBy": "Sort by",
    "newest": "Newest",
    "popular": "Most Popular",
    "downloaded": "Most Downloaded",
    "assetsFound": "assets",
    "noAssets": "No assets match your filters.",
    "clearFilters": "Clear all filters"
  },
  "browse": {
    "title": "Let Us Help You Find What You're Looking For",
    "subtitle": "Use this guided experience to quickly surface the right resources.",
    "step1": "Customer Stage",
    "step1Desc": "Choose where your customer is in their journey",
    "step2": "Product",
    "step2Desc": "Select the product or solution",
    "step3": "Content Type",
    "step3Desc": "Identify the format you need",
    "viewResults": "View Your Results",
    "viewYourResults": "Your Matching Resources",
    "viewYourResultsDesc": "Review these materials, download them, or refine your search.",
    "next": "Next",
    "noAssetsMatch": "No assets match your current filters. Try selecting different options."
  },
  "footer": {
    "copyright": "© {year} Hostopia. All rights reserved.",
    "howItWorks": "How it Works",
    "hostpapa": "HostPapa.com"
  }
}
```

### 9.2 Update Spanish Messages

**File to Modify:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/messages/es-MX.json`

Add corresponding Spanish translations (example structure):

```json
{
  "nav": {
    "home": "Inicio",
    "library": "Biblioteca",
    "products": "Productos",
    "resources": "Recursos",
    "myResources": "Mis Recursos",
    "howItWorks": "Cómo funciona"
  },
  "search": {
    "placeholder": "Busca recursos, productos, casos de uso...",
    "results": "Resultados",
    "viewAll": "Ver todos los resultados",
    "noResults": "No se encontraron recursos",
    "title": "Resultados de búsqueda",
    "resultsFor": "Resultados para",
    "sortBy": "Ordenar por",
    "newest": "Más reciente",
    "popular": "Más popular",
    "downloaded": "Más descargado",
    "assetsFound": "recursos encontrados",
    "tryAdjusting": "Intenta ajustar tus filtros o tu consulta de búsqueda."
  }
}
```

---

## 10. KEYBOARD SHORTCUTS & SEARCH INTEGRATION

### 10.1 Add Global Search Overlay Hook

**File to Create:** `/sessions/magical-serene-dijkstra/mnt/hostopiaconnects-mac/hooks/useSearchOverlay.ts`

Context hook for global search overlay management:

```typescript
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SearchOverlayContextType {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextType | undefined>(undefined);

export function SearchOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for Cmd+K or Ctrl+K
  if (typeof window !== "undefined") {
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    });
  }

  return (
    <SearchOverlayContext.Provider
      value={{
        isOpen,
        openSearch: () => setIsOpen(true),
        closeSearch: () => setIsOpen(false)
      }}
    >
      {children}
    </SearchOverlayContext.Provider>
  );
}

export function useSearchOverlay() {
  const context = useContext(SearchOverlayContext);
  if (!context) {
    throw new Error("useSearchOverlay must be used within SearchOverlayProvider");
  }
  return context;
}
```

---

## 11. IMPLEMENTATION CHECKLIST

Follow this order for implementation:

1. **Design System Foundation**
   - [ ] Update `tailwind.config.ts` with product colors and shadows
   - [ ] Add new Tailwind spacing/sizing if needed

2. **Search Infrastructure**
   - [ ] Add search functions to `lib/assets.ts`
   - [ ] Create `components/SearchBar.tsx`
   - [ ] Create `app/[locale]/search/page.tsx`

3. **Reusable Components**
   - [ ] Create `components/AssetCard.tsx`
   - [ ] Create `components/FilterSidebar.tsx`
   - [ ] Create `components/Breadcrumbs.tsx`
   - [ ] Create `components/RelatedAssets.tsx`
   - [ ] Create `components/AssetDetailContent.tsx`

4. **Library Page**
   - [ ] Create `components/LibraryGrid.tsx`
   - [ ] Create `app/[locale]/library/page.tsx`

5. **Homepage Redesign**
   - [ ] Update `app/[locale]/page.tsx` (reduce hero height)
   - [ ] Create `components/HomeBrowseSection.tsx`

6. **Navigation**
   - [ ] Create `components/NavDropdown.tsx`
   - [ ] Create `components/MegaMenu.tsx`
   - [ ] Create `components/Footer.tsx`
   - [ ] Update `app/[locale]/layout.tsx`

7. **Asset Detail Page**
   - [ ] Update `app/[locale]/assets/[slug]/page.tsx`

8. **Internationalization**
   - [ ] Update `messages/en.json`
   - [ ] Update `messages/es-MX.json`

9. **Testing & Refinement**
   - [ ] Test all pages on mobile (320px, 768px, 1024px)
   - [ ] Test all navigation flows
   - [ ] Test search with various queries
   - [ ] Test i18n switching

---

## 12. STYLING NOTES

### Color Scheme Reference

- **Primary Teal:** `#2CADB2` — Used for buttons, links, highlights
- **CTA Yellow:** `#F8CF41` — Accent/special emphasis (use sparingly)
- **Dark Text:** `#24282B` — Primary text color
- **Beige Background:** `#f7f6f2` — Page background

### Typography

- **Headings (h1-h4):** `fontFamily: "Montserrat, sans-serif"` with `font-black` or `font-bold`
- **Body Text:** `fontFamily: "Raleway, sans-serif"` with `font-normal` or `font-semibold`
- **UI Elements:** Use Montserrat for buttons, labels; Raleway for descriptions

### Spacing Standards

- **Page Padding:** `px-6` for mobile, increases to max container width
- **Section Padding:** `py-12` for major sections, `py-8` for subsections
- **Gap Between Items:** `gap-6` for grids, `gap-4` for compact layouts

### Hover & Interactive States

- **Buttons:** `hover:bg-[#2CADB2]/90` for darker teal, `transition` for smooth effect
- **Links:** `hover:text-[#2CADB2]` with `transition`
- **Cards:** `hover:shadow-card-hover` with `shadow-card` base (defined in Tailwind)

---

## 13. PERFORMANCE & ACCESSIBILITY NOTES

- **Search debouncing:** Debounce search input by 300ms for better performance
- **Alt text:** All images should have descriptive `alt` attributes
- **Keyboard navigation:** All dropdowns and modals should support arrow keys and Escape
- **ARIA labels:** Use `aria-label` on buttons without text
- **Focus states:** All interactive elements should have visible focus indicators (`:focus-visible`)
- **Mobile-first:** Start with mobile layout, use `md:` and `lg:` breakpoints for larger screens

---

## 14. FINAL NOTES

This document provides a complete redesign specification. Each component has:
- Clear file locations
- Complete TypeScript interfaces
- Tailwind CSS class recommendations
- Integration points with existing code
- i18n support

Developers should implement features in the order listed to avoid circular dependencies. All components use existing patterns from the codebase and maintain consistency with the current tech stack (Next.js 14, TypeScript, Tailwind CSS, next-intl).

For questions about specific component behaviors, refer to the existing `BrowseWizard.tsx` and `HomeHighlights.tsx` as architectural references.
