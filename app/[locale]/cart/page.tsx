"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const t = useTranslations("cart");
  const { assets, removeItem, clear } = useCart();
  const hasItems = assets.length > 0;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    clear();
    alert(
      "Request received. In the full implementation, this would send a single email with secure links to all selected assets."
    );
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-start gap-10">
        <div className="flex-1">
          <div className="mb-6">
            <p
              className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t("title")}
            </p>
            <h1
              className="font-black leading-tight mb-2"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.3rem)"
              }}
            >
              Review your selected assets.
            </h1>
            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              This is your one place to bundle decks, documents, and videos. When
              you submit the form on the right, you&apos;ll receive a single
              email with secure, time-limited links for everything in My Resources.
            </p>
          </div>

          {!hasItems ? (
            <div className="rounded-2xl border border-dashed border-[#2CADB2]/40 bg-[#f0fbfa] p-6 text-sm text-gray-700">
              <p style={{ fontFamily: "Raleway, sans-serif" }}>
                {t("empty")}. Browse journeys and products first,
                then use the <span className="font-semibold">Add to My Resources</span>{" "}
                button on any asset detail page to see items here.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 mt-4 text-xs text-[#2CADB2] hover:underline"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                ← Back to Hostopia Connects home
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-black/5 bg-white p-4"
                >
                  <div>
                    <p
                      className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      {asset.contentType} · {asset.productCategory}
                    </p>
                    <Link
                      href={`/assets/${asset.slug}`}
                      className="text-sm font-semibold hover:text-[#2CADB2] transition-colors"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {asset.title}
                    </Link>
                    <p
                      className="text-xs text-gray-600 mt-1"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      {asset.summaryWhat}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(asset.id)}
                    className="text-[11px] text-gray-500 hover:text-red-600"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="w-full md:w-[360px]">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2
              className="font-black mb-2"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "1.1rem"
              }}
            >
              Request your download bundle
            </h2>
            <p
              className="text-xs text-gray-600 mb-4"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              We only ask for what we need to send your bundle and understand
              which companies are engaging with Hostopia Connects.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold mb-1 text-gray-700"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  className="w-full rounded-md border border-black/10 bg-[#f7f6f2] px-3 py-2 text-xs outline-none focus:border-[#2CADB2] focus:ring-1 focus:ring-[#2CADB2]"
                />
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="block text-xs font-semibold mb-1 text-gray-700"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Company *
                </label>
                <input
                  id="company"
                  name="company"
                  required
                  className="w-full rounded-md border border-black/10 bg-[#f7f6f2] px-3 py-2 text-xs outline-none focus:border-[#2CADB2] focus:ring-1 focus:ring-[#2CADB2]"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold mb-1 text-gray-700"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-black/10 bg-[#f7f6f2] px-3 py-2 text-xs outline-none focus:border-[#2CADB2] focus:ring-1 focus:ring-[#2CADB2]"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="optIn"
                  name="optIn"
                  type="checkbox"
                  className="mt-[2px]"
                />
                <label
                  htmlFor="optIn"
                  className="text-[11px] text-gray-600"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Subscribe to our marketing updates and product news.
                </label>
              </div>

              <button
                type="submit"
                disabled={!hasItems}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-2 text-xs font-bold shadow-md transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  backgroundColor: "#F8CF41",
                  color: "#24282B"
                }}
              >
                Request Your Download Bundle
              </button>

              {!hasItems && (
                <p
                  className="text-[11px] text-gray-500 mt-1"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Add at least one asset to My Resources before requesting a bundle.
                </p>
              )}
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
}
