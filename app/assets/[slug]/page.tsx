import Link from "next/link";
import { getAssetBySlug } from "@/lib/assets";

interface AssetDetailPageProps {
  params: { slug: string };
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const asset = getAssetBySlug(params.slug);

  if (!asset) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          We couldn&apos;t find that asset.{" "}
          <Link href="/" className="text-[#2CADB2] underline">
            Go back to Hostopia Connects home.
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-[#f7f6f2] px-3 py-1 uppercase tracking-[0.18em] text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <span>◎</span>
            <span>{asset.journey}</span>
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-black/5 text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {asset.productCategory}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-black/5 text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {asset.contentType}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-black/5 text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {asset.language} · {asset.region}
          </span>
        </div>

        <h1
          className="font-black leading-tight mb-3"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)"
          }}
        >
          {asset.title}
        </h1>

        <p
          className="text-xs text-gray-500 mb-6"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Last updated {new Date(asset.lastUpdated).toLocaleDateString()} ·{" "}
          {asset.gated ? "Gated download" : "Direct download"}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-bold shadow-md transition hover:shadow-lg"
            style={{
              fontFamily: "Montserrat, sans-serif",
              backgroundColor: "#F8CF41",
              color: "#24282B"
            }}
          >
            Add to Download Cart
          </button>
          <button
            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold border border-[#24282B]/20 bg-white transition hover:bg-[#f7f6f2]"
            style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
        <div className="space-y-6">
          <section>
            <h2
              className="text-sm font-semibold uppercase tracking-[0.18em] mb-2 text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              What it is
            </h2>
            <p
              className="text-sm md:text-base text-gray-800"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {asset.summaryWhat}
            </p>
          </section>

          <section>
            <h2
              className="text-sm font-semibold uppercase tracking-[0.18em] mb-2 text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Why it&apos;s important
            </h2>
            <p
              className="text-sm md:text-base text-gray-800"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {asset.summaryWhy}
            </p>
          </section>

          <section>
            <h2
              className="text-sm font-semibold uppercase tracking-[0.18em] mb-2 text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              How to use it
            </h2>
            <p
              className="text-sm md:text-base text-gray-800"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {asset.summaryHow}
            </p>
          </section>
        </div>

        {/* Right rail: quick metadata */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-black/5 bg-[#f7f6f2] p-4">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.18em] mb-3 text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              At a glance
            </h3>
            <dl
              className="space-y-2 text-xs text-gray-700"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Primary use cases</dt>
                <dd className="text-right">{asset.useCases.join(" · ")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Language / region</dt>
                <dd className="text-right">
                  {asset.language} ·{" "}
                  {asset.region === "Global" ? "Global" : asset.region}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Download type</dt>
                <dd className="text-right">
                  {asset.gated ? "Lead-gated bundle" : "Direct file download"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-dashed border-[#2CADB2]/50 bg-[#f0fbfa] p-4 text-xs text-gray-700">
            <p style={{ fontFamily: "Raleway, sans-serif" }}>
              When the Download Cart is fully implemented, this page will also
              show a preview of the file and any related assets (e.g., training
              modules or case studies) to keep sales flows tight.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

