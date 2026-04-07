"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  journeys,
  journeyProducts,
  type ProductJourney,
  type ProductCategory,
  type ContentType,
  type UseCase,
  sampleAssets
} from "@/lib/assets";
import { X, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useBrowse } from "./BrowseProvider";

type Step = 1 | 2 | 3;

interface BrowseWizardProps {
  open: boolean;
  onClose: () => void;
}

export function BrowseWizard({ open, onClose }: BrowseWizardProps) {
  const { seenSlugs, setResultsFromAssets, markSeen, clearResults } = useBrowse();
  const [step, setStep] = useState<Step>(1);
  const [journeysSelected, setJourneysSelected] = useState<ProductJourney[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [showResults, setShowResults] = useState(false);

  const reset = () => {
    setStep(1);
    setJourneysSelected([]);
    setProductCategories([]);
    setContentTypes([]);
    setUseCases([]);
    setShowResults(false);
    clearResults();
  };

  const handleClose = () => {
    onClose();
  };

  const journeyProductsForSelection =
    journeysSelected.length > 0
      ? journeyProducts.filter((p) => journeysSelected.includes(p.journey))
      : [];

  const filteredAssets = useMemo(() => {
    return sampleAssets.filter((asset) => {
      if (journeysSelected.length > 0 && !journeysSelected.includes(asset.journey))
        return false;
      if (
        productCategories.length > 0 &&
        !productCategories.includes(asset.productCategory)
      )
        return false;
      if (
        contentTypes.length > 0 &&
        !contentTypes.includes(asset.contentType)
      )
        return false;
      if (
        useCases.length > 0 &&
        !useCases.some((u) => asset.useCases.includes(u))
      )
        return false;
      return true;
    });
  }, [journeysSelected, productCategories, contentTypes, useCases]);

  if (!open) return null;

  const toggleCategory = (category: ProductCategory) => {
    setProductCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setShowResults(false);
  };

  const toggleContentType = (type: ContentType) => {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setShowResults(false);
  };

  const toggleUseCase = (u: UseCase) => {
    setUseCases((prev) =>
      prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]
    );
    setShowResults(false);
  };

  const pathChips: string[] = [];
  if (journeysSelected.length > 0)
    pathChips.push(`Journey: ${journeysSelected.join(", ")}`);
  if (productCategories.length)
    pathChips.push(`Products: ${productCategories.join(", ")}`);
  if (contentTypes.length)
    pathChips.push(`Content: ${contentTypes.join(", ")}`);
  if (useCases.length) pathChips.push(`Use case: ${useCases.join(", ")}`);

  const modal = (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="mt-20 mb-10 w-full max-w-5xl rounded-3xl bg-white shadow-2xl border border-black/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Guided browse
            </p>
            <h2
              className="text-sm font-black"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Drill down by journey, product, and content.
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-black/5 text-gray-500"
            aria-label="Close browse wizard"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="px-6 py-3 border-b border-black/5 text-xs">
          <div className="flex items-center gap-4 mb-2">
            {[
              { id: 1, label: "Journey" },
              { id: 2, label: "Product" },
              { id: 3, label: "Content & Use Case" }
            ].map(({ id, label }) => {
              const active = step === id;
              const completed = step > id;
              return (
                <div key={id} className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!completed && !active}
                    onClick={() => {
                      setStep(id as Step);
                      setShowResults(false);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                      active
                        ? "bg-[#2CADB2] text-white"
                        : completed
                        ? "bg-[#2CADB2]/10 text-[#2CADB2]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {completed ? <CheckCircle2 size={14} /> : id}
                  </button>
                  <span
                    className={`text-[11px] ${
                      active ? "text-gray-900" : "text-gray-500"
                    }`}
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
            <div className="ml-auto text-[11px] text-gray-400">
              <button
                type="button"
                onClick={reset}
                className="hover:text-[#2CADB2]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Reset filters
              </button>
            </div>
          </div>

          {/* Path chips */}
          {pathChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {pathChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-[#f7f6f2] border border-black/5 px-3 py-1 text-[11px] text-gray-700"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Steps body */}
        <div className="px-6 py-5 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <p
                className="text-xs text-gray-600"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Step 1: Select one or more journeys that match where your customer
                is today.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {journeys.map((j) => {
                  const selected = journeysSelected.includes(j.label);
                  return (
                    <button
                      key={j.slug}
                      type="button"
                      onClick={() => {
                        setJourneysSelected((prev) =>
                          prev.includes(j.label)
                            ? prev.filter((x) => x !== j.label)
                            : [...prev, j.label]
                        );
                        setProductCategories([]);
                        setContentTypes([]);
                        setUseCases([]);
                        setShowResults(false);
                      }}
                      className={`text-left rounded-2xl border px-4 py-3 transition ${
                        selected
                          ? "border-[#2CADB2] bg-[#f0fbfa]"
                          : "border-black/10 bg-white hover:border-[#2CADB2]/60"
                      }`}
                    >
                      <p
                        className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Journey
                      </p>
                      <p
                        className="text-sm font-black"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {j.label}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={journeysSelected.length === 0}
                  className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[11px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed bg-[#2CADB2] text-white"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Next: Choose products
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p
                className="text-xs text-gray-600"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Step 2: Select one or more products you want enablement content
                for.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {journeyProductsForSelection.map((p) => {
                  const selected = productCategories.includes(p.category);
                  return (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => toggleCategory(p.category)}
                      className={`text-left rounded-2xl border px-4 py-3 transition ${
                        selected
                          ? "border-[#2CADB2] bg-[#f0fbfa]"
                          : "border-black/10 bg-white hover:border-[#2CADB2]/60"
                      }`}
                    >
                      <p
                        className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Product
                      </p>
                      <p
                        className="text-sm font-black mb-1"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {p.label}
                      </p>
                      <p
                        className="text-[11px] text-gray-500 line-clamp-2"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between items-center pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-[#2CADB2]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  ← Back to journeys
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!productCategories.length}
                  className="inline-flex items-center gap-1 rounded-full bg-[#2CADB2] text-white px-4 py-1.5 text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Next: Content &amp; use case
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p
                className="text-xs text-gray-600"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Step 3: Refine by content type and use case. You can select
                multiple options in each row.
              </p>
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Content type
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Presentation",
                    "Document",
                    "Playbook",
                    "Video",
                    "Training"
                  ].map((type) => {
                    const selected = contentTypes.includes(type as ContentType);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleContentType(type as ContentType)}
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                          selected
                            ? "bg-[#2CADB2] text-white border-[#2CADB2]"
                            : "bg-white text-gray-700 border-black/10 hover:border-[#2CADB2]/60 hover:text-[#2CADB2]"
                        }`}
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Use case
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Sales", "Marketing", "Training & Onboarding", "Support"].map(
                    (u) => {
                      const selected = useCases.includes(u as UseCase);
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => toggleUseCase(u as UseCase)}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                            selected
                              ? "bg-[#2CADB2] text-white border-[#2CADB2]"
                              : "bg-white text-gray-700 border-black/10 hover:border-[#2CADB2]/60 hover:text-[#2CADB2]"
                          }`}
                          style={{ fontFamily: "Montserrat, sans-serif" }}
                        >
                          {u}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-gray-500 hover:text-[#2CADB2]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  ← Back to products
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResultsFromAssets(filteredAssets);
                    setShowResults(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-[#2CADB2] text-white px-4 py-1.5 text-[11px] font-semibold"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Show matching assets
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results at the bottom */}
        {showResults && (
          <div className="px-6 py-5 border-t border-black/5 bg-[#f7f6f2]">
            <p
              className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-3"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Matching assets ({filteredAssets.length})
            </p>
            {filteredAssets.length === 0 ? (
              <p
                className="text-xs text-gray-600"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                No assets match these filters yet. Try removing one or more
                options above.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredAssets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.slug}`}
                    onClick={() => {
                      markSeen(asset.slug);
                      onClose();
                    }}
                    className={`block rounded-xl border px-3 py-2 hover:border-[#2CADB2]/60 hover:shadow-sm transition ${
                      seenSlugs.includes(asset.slug)
                        ? "bg-gray-100 border-dashed opacity-75"
                        : "bg-white border-black/5"
                    }`}
                  >
                    <p
                      className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      {asset.productCategory} · {asset.contentType}
                    </p>
                    <p
                      className="text-xs font-semibold text-gray-900 line-clamp-2"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      {asset.title}
                    </p>
                    <p
                      className="text-[11px] text-gray-500 line-clamp-2 mt-1"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      {asset.summaryWhat}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

