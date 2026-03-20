"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getSearchSuggestions, ContentType, journeyProducts } from "@/lib/assets";

// Popular search suggestions
const POPULAR_SEARCHES = [
  "Logo design",
  "Website builder",
  "SSL certificates",
  "Email marketing",
  "Directory listings",
];

// Content type to Font Awesome 6 Solid icon mapping
const contentTypeIcon: Record<string, string> = {
  "Video": "fa-solid fa-video",
  "Presentation": "fa-solid fa-chart-bar",
  "Document": "fa-solid fa-file-pdf",
  "Case Study": "fa-solid fa-file-lines",
  "Playbook": "fa-solid fa-book",
  "Training": "fa-solid fa-graduation-cap",
  "Tool": "fa-solid fa-wrench",
};

export function SearchBar() {
  const t = useTranslations("search");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const suggestions = getSearchSuggestions(query);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
        if (!open) {
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Close on click outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  const handleResultClick = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/20 bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80 transition-colors"
      >
        <i className="fa-solid fa-magnifying-glass text-xs" />
        <span className="text-xs hidden sm:inline font-heading">
          Search
        </span>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/40">
          \u2318K
        </kbd>
      </button>

      {/* Search overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleClickOutside}
        >
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={handleClickOutside}>
            <div
              ref={modalRef}
              className="w-full max-w-xl bg-white rounded-xl shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input bar */}
              <div className="flex items-center gap-3 border-b border-gray-200 p-4">
                <i className="fa-solid fa-magnifying-glass text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder") || "Search assets..."}
                  className="flex-1 outline-none text-sm font-body"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-600">
                  ESC
                </kbd>
              </div>

              {/* Results area */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query === "" ? (
                  // Popular searches
                  <div className="p-4">
                    <h3 className="text-xs font-heading font-bold uppercase text-gray-500 mb-3">
                      Popular Searches
                    </h3>
                    <div className="space-y-1">
                      {POPULAR_SEARCHES.map((search) => (
                        <Link
                          key={search}
                          href={`/search?q=${encodeURIComponent(search)}`}
                          onClick={handleResultClick}
                        >
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f0fbfa] transition-colors cursor-pointer">
                            <i className="fa-solid fa-magnifying-glass text-xs text-gray-400" />
                            <span className="text-sm text-gray-700">{search}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : suggestions.products.length === 0 &&
                  suggestions.assets.length === 0 &&
                  suggestions.contentTypes.length === 0 ? (
                  // No results
                  <div className="p-8 text-center">
                    <i className="fa-solid fa-circle-exclamation text-gray-300 text-2xl mb-2" />
                    <p className="text-sm text-gray-500">No results found</p>
                  </div>
                ) : (
                  <>
                    {/* Products section */}
                    {suggestions.products.length > 0 && (
                      <div className="border-b border-gray-200 p-4">
                        <h3 className="text-xs font-heading font-bold uppercase text-gray-500 mb-3">
                          Products
                        </h3>
                        <div className="space-y-1">
                          {suggestions.products.map((product) => {
                            const journeyProduct = journeyProducts.find(
                              (jp) => jp.label === product
                            );
                            return (
                              <Link
                                key={product}
                                href={`/library?product=${journeyProduct?.slug || product}`}
                                onClick={handleResultClick}
                              >
                                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f0fbfa] transition-colors cursor-pointer">
                                  <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#d1f0ee] text-[#0f766e]">
                                    <i className="fa-solid fa-cube text-xs" />
                                  </span>
                                  <span className="text-sm text-gray-900 font-heading font-semibold">{product}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Assets section */}
                    {suggestions.assets.length > 0 && (
                      <div className="border-b border-gray-200 p-4">
                        <h3 className="text-xs font-heading font-bold uppercase text-gray-500 mb-3">
                          Assets
                        </h3>
                        <div className="space-y-1">
                          {suggestions.assets.map((asset) => (
                            <Link
                              key={asset.slug}
                              href={`/assets/${asset.slug}`}
                              onClick={handleResultClick}
                            >
                              <div className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-[#f0fbfa] transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 flex-shrink-0 mt-0.5">
                                  <i className={`${contentTypeIcon[asset.contentType] || "fa-solid fa-file"} text-xs`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate font-heading">
                                    {asset.title}
                                  </p>
                                  <p className="text-xs text-gray-500 font-body">
                                    {asset.productCategory} &middot; {asset.contentType}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content Types section */}
                    {suggestions.contentTypes.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-xs font-heading font-bold uppercase text-gray-500 mb-3">
                          Content Types
                        </h3>
                        <div className="space-y-1">
                          {suggestions.contentTypes.map((type) => (
                            <Link
                              key={type}
                              href={`/library?type=${encodeURIComponent(type)}`}
                              onClick={handleResultClick}
                            >
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f0fbfa] transition-colors cursor-pointer">
                                <i className={`${contentTypeIcon[type] || "fa-solid fa-file"} text-xs text-gray-500`} />
                                <span className="text-sm text-gray-900 font-heading">{type}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
