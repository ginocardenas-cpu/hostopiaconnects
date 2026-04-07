"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Flame, Star, Download, ArrowRight, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getLatestAssets,
  getMostViewedAssets,
  getMostDownloadedAssets
} from "@/lib/assets";

type TabKey = "new" | "popular" | "downloaded";

export function HomeHighlights() {
  const t = useTranslations("highlights");
  const [active, setActive] = useState<TabKey>("new");

  const tabs: { key: TabKey; labelKey: "whatsNew" | "mostPopular" | "mostDownloaded"; icon: React.ComponentType<any> }[] = [
    { key: "new", labelKey: "whatsNew", icon: Star },
    { key: "popular", labelKey: "mostPopular", icon: Flame },
    { key: "downloaded", labelKey: "mostDownloaded", icon: Download }
  ];

  const latest = getLatestAssets(3);
  const popular = getMostViewedAssets(3);
  const downloaded = getMostDownloadedAssets(3);

  const list =
    active === "new" ? latest : active === "popular" ? popular : downloaded;

  const featuredSlides = latest.slice(0, 2);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    if (featuredSlides.length <= 1) return;
    const id = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredSlides.length);
    }, 8000);
    return () => clearInterval(id);
  }, [featuredSlides.length]);

  const featured = featuredSlides[featuredIndex];

  return (
    <section className="py-10 bg-[#f7f6f2]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] border border-black/5 overflow-hidden">
          <div className="grid md:grid-cols-[1.4fr_minmax(0,1fr)]">
            {/* Left: tabs + list */}
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/5">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {tabs.map(({ key, labelKey, icon: Icon }) => {
                  const selected = active === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActive(key)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                        selected
                          ? "bg-[#2CADB2] text-white border-[#2CADB2]"
                          : "bg-white text-gray-600 border-black/10 hover:border-[#2CADB2]/60 hover:text-[#2CADB2]"
                      }`}
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      <Icon size={14} />
                      <span>{t(labelKey)}</span>
                    </button>
                  );
                })}
              </div>

              <div
                className="mb-4 text-xs text-gray-500"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {active === "new" && t("newDesc")}
                {active === "popular" && t("popularDesc")}
                {active === "downloaded" && t("downloadedDesc")}
              </div>

              <div className="space-y-3">
                {list.map((asset, index) => (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.slug}`}
                    className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-[#f7f6f2] transition group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#2CADB2]/10 text-[#2CADB2] group-hover:bg-[#2CADB2] group-hover:text-white transition-colors"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          {asset.productCategory} · {asset.contentType}
                        </p>
                        <p
                          className="text-sm font-semibold text-gray-900 truncate"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {asset.title}
                        </p>
                        <p
                          className="text-[11px] text-gray-500 truncate"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          {active === "new" &&
                            `${t("updated")} ${new Date(
                              asset.lastUpdated
                            ).toLocaleDateString()}`}
                          {active === "popular" &&
                            `${asset.viewCount.toLocaleString()} ${t("views")}`}
                          {active === "downloaded" &&
                            `${asset.downloadCount.toLocaleString()} ${t("downloads")}`}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="mt-1 text-gray-300 group-hover:text-[#2CADB2] flex-shrink-0"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: featured asset carousel — site-aligned palette */}
            <div className="relative p-6 md:p-8 bg-gradient-to-br from-[#f0fbfa] via-[#f7f6f2] to-[#e8f7f7] border-l border-[#2CADB2]/20">
              <div className="relative flex flex-col h-full">
                <p
                  className="text-[11px] uppercase tracking-[0.18em] mb-2 text-[#2CADB2]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {t("featuredAsset")}
                </p>
                {featured && (
                  <>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="relative w-full md:w-40 h-40 rounded-2xl overflow-hidden bg-black/5 flex-shrink-0">
                        <Image
                          src="/product-guide-2026.png"
                          alt="Hostopia Product Guide 2026"
                          fill
                          sizes="160px"
                          className="object-contain"
                          priority
                        />
                      </div>
                      <div className="flex-1">
                        <h2
                          className="font-black mb-2 text-[#24282B]"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: "1.4rem"
                          }}
                        >
                          {featured.title}
                        </h2>
                        <p
                          className="text-sm text-[#555A5E] mb-3 line-clamp-3"
                          style={{ fontFamily: "Raleway, sans-serif", lineHeight: 1.625 }}
                        >
                          {featured.summaryWhat}
                        </p>
                      </div>
                    </div>

                    <div className="relative mb-4 p-4 rounded-xl bg-white/80 border border-[#2CADB2]/15 shadow-sm flex items-center gap-4">
                      <div className="rounded-xl bg-[#2CADB2]/10 p-3 flex-shrink-0">
                        <FileText size={28} className="text-[#2CADB2]" />
                      </div>
                      <div>
                        <p
                          className="text-[11px] uppercase tracking-[0.18em] text-[#2CADB2]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          {featured.contentType}
                        </p>
                        <p
                          className="text-sm font-semibold text-[#24282B]"
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {featured.productCategory}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {featuredSlides.map((slide, idx) => (
                          <button
                            key={slide.id ?? idx}
                            type="button"
                            onClick={() => setFeaturedIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              idx === featuredIndex ? "w-6 bg-[#2CADB2]" : "w-2 bg-gray-300"
                            }`}
                            aria-label={`Go to featured slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFeaturedIndex((prev) =>
                              (prev - 1 + featuredSlides.length) % featuredSlides.length
                            )
                          }
                          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/80 p-1.5 text-gray-600 hover:text-[#2CADB2] hover:border-[#2CADB2]/60 transition-colors"
                          aria-label="Previous featured asset"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFeaturedIndex((prev) => (prev + 1) % featuredSlides.length)
                          }
                          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/80 p-1.5 text-gray-600 hover:text-[#2CADB2] hover:border-[#2CADB2]/60 transition-colors"
                          aria-label="Next featured asset"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link
                        href={`/assets/${featured.slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#2CADB2] text-white px-5 py-2 text-xs font-bold shadow-md hover:bg-[#2CADB2]/90 hover:shadow-lg transition"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {t("viewAsset")}
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

