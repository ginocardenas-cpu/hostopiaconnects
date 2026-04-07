"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { Asset } from "@/lib/assets";
import { AddToCartButton } from "./AddToCartButton";

interface AssetDetailPanelProps {
  asset: Asset;
}

export function AssetDetailPanel({ asset }: AssetDetailPanelProps) {
  return (
    <div
      className="rounded-2xl border border-[#2CADB2]/20 bg-white p-6 shadow-sm"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
        <span
          className="inline-flex items-center gap-1 rounded-full bg-[#f7f6f2] px-3 py-1 uppercase tracking-[0.18em] text-gray-600"
        >
          {asset.journey}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-black/5 text-gray-600">
          {asset.productCategory}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-black/5 text-gray-600">
          {asset.contentType}
        </span>
      </div>

      <h2
        className="font-black leading-tight mb-2"
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
          color: "#24282B",
        }}
      >
        {asset.title}
      </h2>

      <p className="text-xs text-gray-500 mb-4">
        Last updated {new Date(asset.lastUpdated).toLocaleDateString()} ·{" "}
        {asset.gated ? "Gated download" : "Direct download"}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <AddToCartButton assetId={asset.id} />
        <a
          href={asset.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold border border-[#24282B]/20 bg-white transition hover:bg-[#f7f6f2] hover:border-[#2CADB2]"
          style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
        >
          <FileText size={16} />
          Preview
        </a>
        <Link
          href={`/assets/${asset.slug}`}
          className="text-sm font-semibold text-[#2CADB2] hover:underline"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Open full page →
        </Link>
      </div>

      <div className="space-y-4 text-sm text-gray-800 border-t border-black/5 pt-4">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">What it is</h3>
          <p className="leading-relaxed">{asset.summaryWhat}</p>
        </section>
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Why it&apos;s important</h3>
          <p className="leading-relaxed">{asset.summaryWhy}</p>
        </section>
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">How to use it</h3>
          <p className="leading-relaxed whitespace-pre-line">{asset.summaryHow}</p>
        </section>
      </div>
    </div>
  );
}
