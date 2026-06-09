"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { getAssetDisplayForLocale } from "@/lib/assets";
import { deckLangLabel } from "@/lib/html-deck-i18n";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { lineItems, removeItem, clear } = useCart();
  const hasItems = lineItems.length > 0;
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
              className="uppercase tracking-[0.18em] text-xs text-gray-500 mb-3 font-raleway"
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
              className="text-sm text-gray-600 font-raleway"
            >
              {t("reviewIntro")}
            </p>
            <p
              className="mt-3 text-sm font-semibold text-teal font-raleway"
            >
              {t("downloadsEmail")}
            </p>
          </div>

          {!hasItems ? (
            <div className="rounded-2xl border border-dashed border-teal/40 bg-teal-light p-6 text-sm text-gray-700">
              <p className="font-raleway">
                {t("empty")}. {t("emptyHint")}{" "}
                <span className="font-semibold">{t("addToMyResourcesBtn")}</span>{" "}
                {t("emptyHintSuffix")}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1 mt-4 text-xs text-teal hover:underline font-raleway"
              >
                {t("backToHome")}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {lineItems.map(({ asset, deckLang }) => {
                const display = getAssetDisplayForLocale(asset, locale);
                return (
                <div
                  key={asset.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-black/5 bg-white p-4"
                >
                  <div>
                    <p
                      className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1 font-raleway"
                    >
                      {display.contentType} · {display.productCategory}
                    </p>
                    <Link
                      href={`/assets/${asset.slug}`}
                      className="text-sm font-semibold hover:text-teal transition-colors font-montserrat"
                    >
                      {display.title}
                    </Link>
                    <p
                      className="text-xs text-gray-600 mt-1 font-raleway"
                    >
                      {display.summaryWhat}
                    </p>
                    {deckLang && (
                      <p
                        className="text-[11px] font-medium text-teal mt-2 font-raleway"
                      >
                        {t("requestedDocumentLanguage", {
                          language: deckLangLabel(deckLang),
                        })}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(asset.id)}
                    className="text-[11px] text-gray-500 hover:text-red-600 font-raleway"
                  >
                    {t("remove")}
                  </button>
                </div>
              );
              })}
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
              className="text-xs text-gray-600 mb-4 font-raleway"
            >
              {t("requestBundleIntro")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold mb-1 text-gray-700 font-raleway"
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
                  className="block text-xs font-semibold mb-1 text-gray-700 font-raleway"
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
                  className="block text-xs font-semibold mb-1 text-gray-700 font-raleway"
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
                  className="text-[11px] text-gray-600 font-raleway"
                >
                  {t("optInLabel")}
                </label>
              </div>

              <button
                type="submit"
                disabled={!hasItems}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-2 font-montserrat text-xs font-bold text-charcoal shadow-md transition hover:bg-gold-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("submitButton")}
              </button>

              {!hasItems && !submitted && (
                <p
                  className="text-[11px] text-gray-500 mt-1 font-raleway"
                >
                  {t("submitHint")}
                </p>
              )}

              {submitted && (
                <div className="mt-3 rounded-xl border border-teal/40 bg-teal-light px-3 py-2">
                  <p
                    className="text-[11px] font-semibold text-teal font-montserrat"
                  >
                    {t("successTitle")}
                  </p>
                  <p
                    className="mt-1 text-[11px] text-gray-700 font-raleway"
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
