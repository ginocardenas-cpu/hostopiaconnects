"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Star, Download, ArrowRight, FileText } from "lucide-react";
import {
  getLatestAssets,
  getMostViewedAssets,
  getMostDownloadedAssets
} from "@/lib/assets";

type TabKey = "new" | "popular" | "downloaded";

const tabs: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: "new", label: "What's New", icon: Star },
  { key: "popular", label: "Most Popular", icon: Flame },
  { key: "downloaded", label: "Most Downloaded", icon: Download }
];

export function HomeHighlights() {
  const [active, setActive] = useState<TabKey>("new");

  const latest = getLatestAssets(4);
  const popular = getMostViewedAssets(4);
  const downloaded = getMostDownloadedAssets(4);

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
                {tabs.map(({ key, label, icon: Icon }) => {
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
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              <div
                className="mb-4 text-xs text-gray-500"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {active === "new" && "Newest assets across Connects."}
                {active === "popular" && "Most viewed assets in the last period."}
                {active === "downloaded" &&
                  "Assets downloaded most frequently."}
              </div>

              <div className="space-y-3">
                {list.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.slug}`}
                    className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-[#f7f6f2] transition"
                  >
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
                          `Updated ${new Date(
                            asset.lastUpdated
                          ).toLocaleDateString()}`}
                        {active === "popular" &&
                          `${asset.viewCount.toLocaleString()} views`}
                        {active === "downloaded" &&
                          `${asset.downloadCount.toLocaleString()} downloads`}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="mt-1 text-gray-300 group-hover:text-[#2CADB2]"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: featured asset with graphic */}
            <div className="relative p-6 md:p-8 bg-gradient-to-br from-[#111827] via-[#020617] to-[#1f2937] text-white">
              <div className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none" />
              <div className="relative">
                <p
                  className="text-[11px] uppercase tracking-[0.18em] mb-2 text-[#F8CF41]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Featured Asset
                </p>
                {featured && (
                  <>
                    <h2
                      className="font-black mb-3"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "1.4rem"
                      }}
                    >
                      {featured.title}
                    </h2>
                    <p
                      className="text-xs text-gray-200 mb-4 line-clamp-3"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      {featured.summaryWhat}
                    </p>
                    <div className="relative mb-4 h-32 rounded-xl bg-gradient-to-r from-[#2CADB2] via-[#38bdf8] to-[#6366f1] overflow-hidden flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-white/10 p-3">
                          <FileText size={26} className="text-white" />
                        </div>
                        <div className="text-left">
                          <p
                            className="text-xs uppercase tracking-[0.18em] text-white/70"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            {featured.contentType}
                          </p>
                          <p
                            className="text-sm font-semibold"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            {featured.productCategory}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/assets/${featured.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white text-[#111827] px-5 py-2 text-xs font-bold shadow-md hover:shadow-lg transition"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      View asset
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

