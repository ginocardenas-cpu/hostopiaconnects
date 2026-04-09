"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { X } from "lucide-react";
import { getSearchSuggestions, journeyProducts } from "@/lib/assets";
import { cn } from "@/lib/utils";

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
  Video: "fa-solid fa-video",
  Presentation: "fa-solid fa-chart-bar",
  Document: "fa-solid fa-file-pdf",
  "Case Study": "fa-solid fa-file-lines",
  Playbook: "fa-solid fa-book",
  Training: "fa-solid fa-graduation-cap",
  Tool: "fa-solid fa-wrench",
};

export interface SearchBarProps {
  /** Full-width trigger with placeholder (e.g. search page) */
  wideTrigger?: boolean;
}

export function SearchBar({ wideTrigger = false }: SearchBarProps) {
  const t = useTranslations("search");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const suggestions = getSearchSuggestions(query);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          const next = !prev;
          if (!prev) setTimeout(() => inputRef.current?.focus(), 0);
          return next;
        });
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  const handleResultClick = () => {
    setOpen(false);
    setQuery("");
  };

  const openSearch = () => setOpen(true);

  return (
    <>
      {/* Trigger */}
      {wideTrigger ? (
        <button
          type="button"
          onClick={openSearch}
          aria-label={t("openSearchAria")}
          className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 bg-white text-left text-gray-600 shadow-sm hover:border-[#2CADB2]/60 hover:text-[#2CADB2] transition-colors min-h-[48px]"
        >
          <i className="fa-solid fa-magnifying-glass text-gray-400 shrink-0" />
          <span className="text-sm text-gray-500 truncate flex-1 font-body">{t("placeholder")}</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-[10px] font-semibold text-gray-500 shrink-0">
            ⌘K
          </kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={openSearch}
          aria-label={t("openSearchAria")}
          className={cn(
            "inline-flex items-center justify-center shrink-0 rounded-lg border transition-colors",
            "h-11 w-11 min-h-[44px] min-w-[44px] md:h-10 md:w-auto md:min-h-[2.5rem] md:min-w-0",
            "border-gray-200 bg-white text-gray-600 hover:border-[#2CADB2]/60 hover:text-[#2CADB2]",
            "md:px-3 md:gap-2"
          )}
        >
          <i className="fa-solid fa-magnifying-glass text-sm sm:text-xs" />
          <span className="hidden md:inline text-xs font-heading font-semibold uppercase tracking-wider">
            {t("triggerLabel")}
          </span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm sm:backdrop-blur-sm"
          onClick={handleClickOutside}
          role="presentation"
        >
          <div
            className="fixed inset-0 z-[60] flex pointer-events-none items-end justify-center sm:items-start sm:justify-center sm:pt-16 md:pt-20 p-0 sm:p-4"
            onClick={handleClickOutside}
          >
            <div
              ref={modalRef}
              className="pointer-events-auto w-full bg-white shadow-2xl flex flex-col overflow-hidden max-h-[min(92dvh,720px)] rounded-t-2xl sm:rounded-xl sm:max-h-[min(85vh,640px)] sm:max-w-xl border-t sm:border border-gray-200"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={t("triggerLabel")}
            >
              {/* Search input bar */}
              <div className="flex items-center gap-2 sm:gap-3 border-b border-gray-200 p-3 sm:p-4">
                <i className="fa-solid fa-magnifying-glass text-gray-400 shrink-0 pl-0.5" />
                <input
                  ref={inputRef}
                  type="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder")}
                  className="flex-1 min-w-0 outline-none text-base sm:text-sm font-body py-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-600">
                    ESC
                  </kbd>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:h-9 sm:w-9"
                    aria-label={t("closeSearchAria")}
                  >
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Results area */}
              <div className="max-h-[min(65dvh,520px)] sm:max-h-[50vh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom,0)]">
                {query === "" ? (
                  <div className="p-4">
                    <h3 className="text-xs font-heading font-bold uppercase text-gray-500 mb-3">
                      {t("popularSearches")}
                    </h3>
                    <div className="space-y-1">
                      {POPULAR_SEARCHES.map((search) => (
                        <Link
                          key={search}
                          href={`/search?q=${encodeURIComponent(search)}`}
                          onClick={handleResultClick}
                        >
                          <div className="flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg hover:bg-[#f0fbfa] transition-colors cursor-pointer min-h-[44px] sm:min-h-0">
                            <i className="fa-solid fa-magnifying-glass text-xs text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-700">{search}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : suggestions.products.length === 0 &&
                  suggestions.assets.length === 0 &&
                  suggestions.contentTypes.length === 0 ? (
                  <div className="p-8 text-center">
                    <i className="fa-solid fa-circle-exclamation text-gray-300 text-2xl mb-2" />
                    <p className="text-sm text-gray-500">{t("noResults")}</p>
                  </div>
                ) : (
                  <>
                    {suggestions.products.length > 0 && (
                      <div className="border-b border-gray-200 p-4">
                        <h3 className="text-xs font-heading font-bold uppercase text-gray-500 mb-3">
                          {t("products")}
                        </h3>
                        <div className="space-y-1">
                          {suggestions.products.map((product) => {
                            const journeyProduct = journeyProducts.find((jp) => jp.label === product);
                            return (
                              <Link
                                key={product}
                                href={`/library?product=${journeyProduct?.slug || product}`}
                                onClick={handleResultClick}
                              >
                                <div className="flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg hover:bg-[#f0fbfa] transition-colors cursor-pointer min-h-[44px] sm:min-h-0">
                                  <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#d1f0ee] text-[#0f766e] shrink-0">
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

                    {suggestions.assets.length > 0 && (
                      <div className="border-b border-gray-200 p-4">
                        <h3 className="text-xs font-heading font-bold uppercase text-gray-500 mb-3">
                          {t("assets")}
                        </h3>
                        <div className="space-y-1">
                          {suggestions.assets.map((asset) => (
                            <Link key={asset.slug} href={`/assets/${asset.slug}`} onClick={handleResultClick}>
                              <div className="flex items-start gap-3 px-3 py-3 sm:py-2 rounded-lg hover:bg-[#f0fbfa] transition-colors cursor-pointer min-h-[44px] sm:min-h-0">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 flex-shrink-0 mt-0.5">
                                  <i
                                    className={`${contentTypeIcon[asset.contentType] || "fa-solid fa-file"} text-xs`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 font-heading">{asset.title}</p>
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

                    {suggestions.contentTypes.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-xs font-heading font-bold uppercase text-gray-500 mb-3">
                          {t("contentTypes")}
                        </h3>
                        <div className="space-y-1">
                          {suggestions.contentTypes.map((type) => (
                            <Link
                              key={type}
                              href={`/library?type=${encodeURIComponent(type)}`}
                              onClick={handleResultClick}
                            >
                              <div className="flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg hover:bg-[#f0fbfa] transition-colors cursor-pointer min-h-[44px] sm:min-h-0">
                                <i
                                  className={`${contentTypeIcon[type] || "fa-solid fa-file"} text-xs text-gray-500 shrink-0`}
                                />
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
