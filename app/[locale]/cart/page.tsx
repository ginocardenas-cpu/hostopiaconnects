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
    <section className="mx-auto max-w-6xl px-6 py-16 font-body">
      <div className="flex flex-col md:flex-row md:items-start gap-10">
        <div className="flex-1">
          <div className="mb-6">
            <p className="section-label mb-3">
              {t("title")}
            </p>
            <h1 className="mb-2 font-heading text-[clamp(1.8rem,3vw,2.3rem)] font-black leading-tight text-charcoal">
              {t("reviewTitle")}
            </h1>
            <p className="text-sm text-gray-600">
              {t("reviewIntro")}
            </p>
            <p className="mt-3 text-sm font-semibold text-teal">
              {t("downloadsEmail")}
            </p>
          </div>

          {!hasItems ? (
            <div className="rounded-2xl border border-dashed border-teal/40 bg-teal-light p-6 text-sm text-gray-700">
              <p>
                {t("empty")}. {t("emptyHint")}{" "}
                <span className="font-semibold">{t("addToMyResourcesBtn")}</span>{" "}
                {t("emptyHintSuffix")}
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1 text-xs text-teal hover:underline"
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
                    <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-500">
                      {asset.contentType} · {asset.productCategory}
                    </p>
                    <Link
                      href={`/assets/${asset.slug}`}
                      className="font-heading text-sm font-semibold transition-colors hover:text-teal"
                    >
                      {asset.title}
                    </Link>
                    <p className="mt-1 text-xs text-gray-600">
                      {asset.summaryWhat}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(asset.id)}
                    className="text-[11px] text-gray-500 hover:text-red-600"
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
            <h2 className="mb-2 font-heading text-[1.1rem] font-black text-charcoal">
              {t("requestBundleTitle")}
            </h2>
            <p className="mb-4 text-xs text-gray-600">
              {t("requestBundleIntro")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1 block text-xs font-semibold text-gray-700"
                >
                  {t("fullName")}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  className="w-full rounded-md border border-black/10 bg-cream px-3 py-2 text-xs outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                />
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="mb-1 block text-xs font-semibold text-gray-700"
                >
                  {t("company")}
                </label>
                <input
                  id="company"
                  name="company"
                  required
                  className="w-full rounded-md border border-black/10 bg-cream px-3 py-2 text-xs outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-semibold text-gray-700"
                >
                  {t("emailAddress")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-black/10 bg-cream px-3 py-2 text-xs outline-none focus:border-teal focus:ring-1 focus:ring-teal"
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
                >
                  {t("optInLabel")}
                </label>
              </div>

              <button
                type="submit"
                disabled={!hasItems}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-2 text-xs font-bold text-charcoal shadow-md transition hover:bg-gold-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 font-heading"
              >
                {t("submitButton")}
              </button>

              {!hasItems && !submitted && (
                <p className="mt-1 text-[11px] text-gray-500">
                  {t("submitHint")}
                </p>
              )}

              {submitted && (
                <div className="mt-3 rounded-xl border border-teal/40 bg-teal-light px-3 py-2">
                  <p className="font-heading text-[11px] font-semibold text-teal">
                    {t("successTitle")}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-700">
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
