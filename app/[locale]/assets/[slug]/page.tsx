import { Link } from "@/i18n/routing";
import { FileText } from "lucide-react";
import { getAssetBySlug } from "@/lib/assets";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AssetFeedback } from "@/components/AssetFeedback";
import { AssetMarkSeen } from "@/components/AssetMarkSeen";
import { CopyLinkButton } from "@/components/CopyLinkButton";

interface AssetDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { slug } = await params;
  const asset = getAssetBySlug(slug);

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
      <AssetMarkSeen slug={slug} />
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

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <AddToCartButton assetId={asset.id} />
          <a
            href={asset.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold border border-[#24282B]/20 bg-white transition hover:bg-[#f7f6f2] hover:border-[#2CADB2]"
            style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
          >
            <FileText size={16} />
            Preview
          </a>
          <CopyLinkButton />
        </div>
        <div className="mb-8">
          <AssetFeedback assetId={asset.id} />
        </div>
      </div>

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
              className="text-sm md:text-base text-gray-800 whitespace-pre-line"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {asset.summaryHow}
            </p>
          </section>
        </div>

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
              Use <strong>Preview</strong> to open the file in a new tab before
              adding to My Resources. Your thumbs up/down helps us improve
              materials.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
