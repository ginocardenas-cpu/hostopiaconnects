"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Flame, Star, Download, ArrowRight, FileText } from "lucide-react";
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

  const featured = latest[0];

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

            {/* Right: featured asset — site-aligned palette */}
            <div className="relative p-6 md:p-8 bg-gradient-to-br from-[#f0fbfa] via-[#f7f6f2] to-[#e8f7f7] border-l border-[#2CADB2]/20">
              <div className="relative">
                <p
                  className="text-[11px] uppercase tracking-[0.18em] mb-2 text-[#2CADB2]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {t("featuredAsset")}
                </p>
                {featured && (
                  <>
                    <h2
                      className="font-black mb-3 text-[#24282B]"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "1.4rem"
                      }}
                    >
                      {featured.title}
                    </h2>
                    <p
                      className="text-sm text-[#555A5E] mb-4 line-clamp-3"
                      style={{ fontFamily: "Raleway, sans-serif", lineHeight: 1.625 }}
                    >
                      {featured.summaryWhat}
                    </p>
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
                    <Link
                      href={`/assets/${featured.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#2CADB2] text-white px-5 py-2 text-xs font-bold shadow-md hover:bg-[#2CADB2]/90 hover:shadow-lg transition"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {t("viewAsset")}
                      <ArrowRight size={14} />
                    </Link>
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

