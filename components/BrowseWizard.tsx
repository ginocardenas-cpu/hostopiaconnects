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
      <div className="mt-20 mb-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white font-body shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Guided browse
            </p>
            <h2 className="font-heading text-sm font-black">
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
                        ? "bg-teal text-white"
                        : completed
                        ? "bg-teal/10 text-teal"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {completed ? <CheckCircle2 size={14} /> : id}
                  </button>
                  <span
                    className={`text-[11px] ${
                      active ? "text-gray-900" : "text-gray-500"
                    }`}
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
                className="hover:text-teal"
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
                  className="rounded-full bg-cream border border-black/5 px-3 py-1 text-[11px] text-gray-700"
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
                          ? "border-teal bg-teal-light"
                          : "border-black/10 bg-white hover:border-teal/60"
                      }`}
                    >
                      <p
                        className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1"
                      >
                        Journey
                      </p>
                      <p className="font-heading text-sm font-black">
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
                  className="inline-flex items-center gap-1 rounded-full bg-teal px-4 py-1.5 text-[11px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 font-heading"
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
                          ? "border-teal bg-teal-light"
                          : "border-black/10 bg-white hover:border-teal/60"
                      }`}
                    >
                      <p
                        className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1"
                      >
                        Product
                      </p>
                      <p className="font-heading text-sm font-black mb-1">
                        {p.label}
                      </p>
                      <p
                        className="text-[11px] text-gray-500 line-clamp-2"
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
                  className="text-gray-500 hover:text-teal"
                >
                  ← Back to journeys
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!productCategories.length}
                  className="inline-flex items-center gap-1 rounded-full bg-teal px-4 py-1.5 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 font-heading"
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
              >
                Step 3: Refine by content type and use case. You can select
                multiple options in each row.
              </p>
              <div>
                <p
                  className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2"
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
                        className={`rounded-full border px-3 py-1 font-heading text-[11px] font-semibold transition ${
                          selected
                            ? "border-teal bg-teal text-white"
                            : "border-black/10 bg-white text-gray-700 hover:border-teal/60 hover:text-teal"
                        }`}
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
                          className={`rounded-full border px-3 py-1 font-heading text-[11px] font-semibold transition ${
                            selected
                              ? "border-teal bg-teal text-white"
                              : "border-black/10 bg-white text-gray-700 hover:border-teal/60 hover:text-teal"
                          }`}
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
                  className="text-gray-500 hover:text-teal"
                >
                  ← Back to products
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResultsFromAssets(filteredAssets);
                    setShowResults(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-teal px-4 py-1.5 text-[11px] font-semibold text-white font-heading"
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
          <div className="px-6 py-5 border-t border-black/5 bg-cream">
            <p
              className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-3"
            >
              Matching assets ({filteredAssets.length})
            </p>
            {filteredAssets.length === 0 ? (
              <p
                className="text-xs text-gray-600"
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
                    className={`block rounded-xl border px-3 py-2 hover:border-teal/60 hover:shadow-sm transition ${
                      seenSlugs.includes(asset.slug)
                        ? "bg-gray-100 border-dashed opacity-75"
                        : "bg-white border-black/5"
                    }`}
                  >
                    <p
                      className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1"
                    >
                      {asset.productCategory} · {asset.contentType}
                    </p>
                    <p className="line-clamp-2 font-heading text-xs font-semibold text-gray-900">
                      {asset.title}
                    </p>
                    <p
                      className="text-[11px] text-gray-500 line-clamp-2 mt-1"
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

