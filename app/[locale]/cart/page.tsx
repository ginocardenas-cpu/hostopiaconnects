"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const t = useTranslations("cart");
  const { assets, removeItem, clear } = useCart();
  const hasItems = assets.length > 0;
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    clear();
    setSubmitted(true);
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
              {t("reviewTitle")}
            </h1>
            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t("reviewIntro")}
            </p>
            <p
              className="mt-3 text-sm font-semibold text-[#2CADB2]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t("downloadsEmail")}
            </p>
          </div>

          {!hasItems ? (
            <div className="rounded-2xl border border-dashed border-[#2CADB2]/40 bg-[#f0fbfa] p-6 text-sm text-gray-700">
              <p style={{ fontFamily: "Raleway, sans-serif" }}>
                {t("empty")}. {t("emptyHint")}{" "}
                <span className="font-semibold">{t("addToMyResourcesBtn")}</span>{" "}
                {t("emptyHintSuffix")}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 mt-4 text-xs text-[#2CADB2] hover:underline"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {t("backToHome")}
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
                    {t("remove")}
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
              {t("requestBundleTitle")}
            </h2>
            <p
              className="text-xs text-gray-600 mb-4"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {t("requestBundleIntro")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold mb-1 text-gray-700"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {t("fullName")}
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
                  {t("company")}
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
                  {t("emailAddress")}
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
                  {t("optInLabel")}
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
                {t("submitButton")}
              </button>

              {!hasItems && !submitted && (
                <p
                  className="text-[11px] text-gray-500 mt-1"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {t("submitHint")}
                </p>
              )}

              {submitted && (
                <div className="mt-3 rounded-xl border border-[#2CADB2]/40 bg-[#f0fbfa] px-3 py-2">
                  <p
                    className="text-[11px] font-semibold text-[#2CADB2]"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    {t("successTitle")}
                  </p>
                  <p
                    className="mt-1 text-[11px] text-gray-700"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {t("successBody")}
                  </p>
                </div>
              )}
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
}
