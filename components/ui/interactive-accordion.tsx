"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  journeys,
  journeyProducts,
  filterAssets,
  type ProductJourney,
  type ProductCategory,
  type ContentType,
  type UseCase,
} from "@/lib/assets";
import { useBrowse } from "@/components/BrowseProvider";

interface AccordionItem {
  id: string;
  number: string;
  title: string;
  content: string;
}

const items: AccordionItem[] = [
  {
    id: "journey",
    number: "01",
    title: "Browse by journey",
    content:
      "Start from where your customer is in their lifecycle and see assets organized by product journey.",
  },
  {
    id: "content-type",
    number: "02",
    title: "Browse by content type",
    content:
      "Jump straight to videos, decks, documents, and training materials so you can grab the exact asset format you need.",
  },
  {
    id: "use-case",
    number: "03",
    title: "Browse by use case",
    content:
      "Explore assets grouped around real workflows – sales, marketing, training, and support – to match how your teams work.",
  },
];

const contentTypesWithType: { label: string; description: string; type: ContentType }[] = [
  { label: "Videos", description: "Watch marketing videos, demos, and walkthroughs that help explain our products.", type: "Video" },
  { label: "Decks & Presentations", description: "Download ready-to-use slides covering product overviews.", type: "Presentation" },
  { label: "Documents & Playbooks", description: "Explore strategy guides, documentation, and playbooks designed to support sales and marketing efforts.", type: "Document" },
  { label: "Training Modules", description: "Structured learning content to help sales teams understand how to sell our products.", type: "Training" },
];

const useCasesWithType: { label: string; description: string; type: UseCase }[] = [
  { label: "Sales", description: "Pitch decks, product materials, and tools designed to help your teams sell.", type: "Sales" },
  { label: "Marketing", description: "Marketing assets, messaging frameworks, and promotional assets to drive demand.", type: "Marketing" },
  { label: "Training", description: "Materials that help onboard new team members and keep teams up to speed.", type: "Training & Onboarding" },
  { label: "Support", description: "Documentation and support materials to help your customers succeed with our solutions.", type: "Support" },
];

const cardStyle = {
  fontFamily: "Raleway, sans-serif",
  color: "#555A5E",
  lineHeight: 1.625,
} as const;

export function UniqueAccordion() {
  const [activeId, setActiveId] = useState<string | null>("journey");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { setResultsFromAssets, seenSlugs, markSeen } = useBrowse();
  // Multi-step wizard state (when "Browse by journey" is expanded)
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedJourneys, setSelectedJourneys] = useState<ProductJourney[]>([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState<ProductCategory[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<UseCase[]>([]);

  const toggleJourney = (j: ProductJourney) => {
    setSelectedJourneys((prev) => (prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j]));
  };
  const toggleProduct = (c: ProductCategory) => {
    setSelectedProductCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };
  const toggleContentType = (t: ContentType) => {
    setSelectedContentTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };
  const toggleUseCase = (u: UseCase) => {
    setSelectedUseCases((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));
  };

  const productsForJourneys = journeyProducts.filter((p) => selectedJourneys.includes(p.journey));
  const uniqueProductCategories = Array.from(new Set(productsForJourneys.map((p) => p.category)));
  const filteredAssets = filterAssets({
    journeys: selectedJourneys.length ? selectedJourneys : undefined,
    productCategories: selectedProductCategories.length ? selectedProductCategories : undefined,
    contentTypes: selectedContentTypes.length ? selectedContentTypes : undefined,
    useCases: selectedUseCases.length ? selectedUseCases : undefined,
  });

  return (
    <div className="w-full max-w-4xl">
      <div className="space-y-0">
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          const isHovered = hoveredId === item.id;
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className={!isLast ? "pb-2" : undefined}>
              <motion.button
                onClick={() => setActiveId(isActive ? null : item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="w-full group relative"
                initial={false}
                type="button"
              >
                <div className="flex items-center gap-6 py-4 px-1">
                  <div className="relative flex items-center justify-center w-10 h-10">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-foreground"
                      initial={false}
                      animate={{
                        scale: isActive ? 1 : isHovered ? 0.85 : 0,
                        opacity: isActive ? 1 : isHovered ? 0.1 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    />
                    <motion.span
                      className="relative z-10 text-sm font-medium tracking-wide"
                      animate={{
                        color: isActive
                          ? "var(--primary-foreground)"
                          : "var(--muted-foreground)",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.number}
                    </motion.span>
                  </div>

                  <motion.h3
                    className="text-lg md:text-xl font-semibold tracking-tight"
                    animate={{
                      x: isActive || isHovered ? 4 : 0,
                      color: isActive
                        ? "var(--foreground)"
                        : isHovered
                          ? "var(--foreground)"
                          : "var(--muted-foreground)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  >
                    {item.title}
                  </motion.h3>

                  <div className="ml-auto flex items-center gap-3">
                    <motion.div
                      className="flex items-center justify-center w-8 h-8"
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <motion.svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-foreground"
                        animate={{
                          opacity: isActive || isHovered ? 1 : 0.4,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.path
                          d="M8 1V15M1 8H15"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          initial={false}
                        />
                      </motion.svg>
                    </motion.div>
                  </div>
                </div>

                <motion.div className="absolute bottom-0 left-0 right-0 h-px bg-border origin-left" initial={false} />
                <motion.div
                  className="absolute bottom-0 left-0 h-px bg-foreground origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{
                    scaleX: isActive ? 1 : isHovered ? 0.3 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              </motion.button>

              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transition: {
                        height: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2, delay: 0.1 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.1 },
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="pl-16 pr-6 py-4 space-y-6">
                      <p className="text-sm text-muted-foreground leading-relaxed" style={cardStyle}>
                        {item.content}
                      </p>

                      {/* Journey: multi-step wizard */}
                      {item.id === "journey" && (
                        <div className="space-y-6">
                          {wizardStep > 1 && (
                            <p className="text-xs font-medium text-[#2CADB2]" style={{ fontFamily: "Raleway, sans-serif" }}>
                              Your path: {selectedJourneys.join(" → ")}
                              {wizardStep >= 3 && selectedProductCategories.length > 0 && " → " + selectedProductCategories.slice(0, 3).join(", ") + (selectedProductCategories.length > 3 ? "…" : "")}
                              {wizardStep >= 4 && (selectedContentTypes.length > 0 || selectedUseCases.length > 0) && " → Type & use case"}
                            </p>
                          )}

                          {wizardStep === 1 && (
                            <>
                              <p className="text-sm text-muted-foreground" style={cardStyle}>Select one or more journeys. Then click Next to choose products.</p>
                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {journeys.map((journey) => {
                                  const selected = selectedJourneys.includes(journey.label);
                                  return (
                                    <button
                                      key={journey.label}
                                      type="button"
                                      onClick={() => toggleJourney(journey.label)}
                                      className={`group relative overflow-hidden text-left rounded-2xl border p-5 transition-all duration-200 ${
                                        selected ? "border-[#2CADB2] bg-[#2CADB2]/10 shadow-md" : "border-black/5 bg-white hover:border-[#2CADB2]/30 hover:shadow-lg"
                                      }`}
                                    >
                                      <div className="absolute -top-6 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#2CADB2]/10 via-[#F8CF41]/20 to-transparent" />
                                      <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase mb-2 text-gray-500" style={{ fontFamily: "Raleway, sans-serif" }}>
                                        <span className="text-xs">◎</span> Journey
                                      </div>
                                      <div className="font-black mb-1" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "1.1rem", color: "#24282B" }}>
                                        {journey.label}
                                      </div>
                                      <p className="text-sm" style={cardStyle}>Tap to select. Then click Next.</p>
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setWizardStep(2)}
                                  disabled={selectedJourneys.length === 0}
                                  className="rounded-full px-6 py-2 text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#2CADB2", color: "white" }}
                                >
                                  Next
                                </button>
                              </div>
                            </>
                          )}

                          {wizardStep === 2 && (
                            <>
                              <p className="text-sm text-muted-foreground" style={cardStyle}>Select products for the journeys you chose. Then click Next.</p>
                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {productsForJourneys.map((p) => {
                                  const selected = selectedProductCategories.includes(p.category);
                                  return (
                                    <button
                                      key={`${p.journey}-${p.slug}`}
                                      type="button"
                                      onClick={() => toggleProduct(p.category)}
                                      className={`rounded-xl border px-4 py-3 text-left transition-all ${
                                        selected ? "border-[#2CADB2] bg-[#2CADB2]/10" : "border-black/5 bg-white hover:border-[#2CADB2]"
                                      }`}
                                    >
                                      <span className="block text-sm font-semibold mb-0.5" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>{p.label}</span>
                                      <span className="block text-xs" style={cardStyle}>{p.description}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between">
                                <button type="button" onClick={() => setWizardStep(1)} className="text-sm font-semibold text-[#2CADB2] hover:underline" style={{ fontFamily: "Montserrat, sans-serif" }}>← Back</button>
                                <button
                                  type="button"
                                  onClick={() => setWizardStep(3)}
                                  className="rounded-full px-6 py-2 text-sm font-bold shadow-md"
                                  style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#2CADB2", color: "white" }}
                                >
                                  Next
                                </button>
                              </div>
                            </>
                          )}

                          {wizardStep === 3 && (
                            <>
                              <p className="text-sm text-muted-foreground" style={cardStyle}>Optionally narrow by content type and use case. Then click Next to see assets.</p>
                              <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                  <h4 className="text-sm font-bold mb-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>Content type</h4>
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {contentTypesWithType.map(({ label, description, type }) => {
                                      const selected = selectedContentTypes.includes(type);
                                      return (
                                        <button
                                          key={type}
                                          type="button"
                                          onClick={() => toggleContentType(type)}
                                          className={`rounded-xl border px-3 py-2 text-left text-sm transition-all ${selected ? "border-[#2CADB2] bg-[#2CADB2]/10" : "border-black/5 bg-white hover:border-[#2CADB2]"}`}
                                        >
                                          <span className="font-semibold block" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>{label}</span>
                                          <span className="text-xs" style={cardStyle}>{description}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold mb-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>Use case</h4>
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {useCasesWithType.map(({ label, description, type }) => {
                                      const selected = selectedUseCases.includes(type);
                                      return (
                                        <button
                                          key={type}
                                          type="button"
                                          onClick={() => toggleUseCase(type)}
                                          className={`rounded-xl border px-3 py-2 text-left text-sm transition-all ${selected ? "border-[#2CADB2] bg-[#2CADB2]/10" : "border-black/5 bg-white hover:border-[#2CADB2]"}`}
                                        >
                                          <span className="font-semibold block" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>{label}</span>
                                          <span className="text-xs" style={cardStyle}>{description}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <button type="button" onClick={() => setWizardStep(2)} className="text-sm font-semibold text-[#2CADB2] hover:underline" style={{ fontFamily: "Montserrat, sans-serif" }}>← Back</button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResultsFromAssets(filteredAssets);
                                    setWizardStep(4);
                                  }}
                                  className="rounded-full px-6 py-2 text-sm font-bold shadow-md"
                                  style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#2CADB2", color: "white" }}
                                >
                                  Next — see assets
                                </button>
                              </div>
                            </>
                          )}

                          {wizardStep === 4 && (
                            <>
                              <p className="text-sm text-muted-foreground" style={cardStyle}>
                                {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""} match your selection.
                              </p>
                              <div className="space-y-3 max-h-[360px] overflow-y-auto">
                                {filteredAssets.length === 0 ? (
                                  <p className="text-sm py-4" style={cardStyle}>No assets match. Try fewer or different filters.</p>
                                ) : (
                                  filteredAssets.map((asset) => {
                                    const viewed = seenSlugs.includes(asset.slug);
                                    return (
                                      <Link
                                        key={asset.id}
                                        href={`/assets/${asset.slug}`}
                                        onClick={() => markSeen(asset.slug)}
                                        className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-all ${
                                          viewed
                                            ? "border-black/5 bg-gray-100/80 opacity-75 hover:opacity-90"
                                            : "border-black/5 bg-white hover:border-[#2CADB2] hover:shadow-md"
                                        }`}
                                      >
                                        <div>
                                          <span className="block text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>{asset.title}</span>
                                          <span className="text-xs" style={cardStyle}>{asset.contentType} · {asset.productCategory}</span>
                                        </div>
                                        {viewed ? (
                                          <span className="text-xs text-gray-500 font-medium">Viewed</span>
                                        ) : (
                                          <span className="text-xs text-[#2CADB2] font-medium">View →</span>
                                        )}
                                      </Link>
                                    );
                                  })
                                )}
                              </div>
                              <div className="flex justify-between pt-2">
                                <button type="button" onClick={() => setWizardStep(3)} className="text-sm font-semibold text-[#2CADB2] hover:underline" style={{ fontFamily: "Montserrat, sans-serif" }}>← Back</button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Content type blocks */}
                      {item.id === "content-type" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {contentTypesWithType.map(({ label, description }) => (
                            <button
                              key={label}
                              type="button"
                              className="rounded-xl border border-black/5 bg-white px-4 py-3 text-left hover:border-[#2CADB2] hover:shadow-md transition-all duration-150"
                            >
                              <span
                                className="block text-sm font-semibold mb-1"
                                style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
                              >
                                {label}
                              </span>
                              <span className="block text-sm" style={cardStyle}>
                                {description}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Use case blocks */}
                      {item.id === "use-case" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {useCasesWithType.map(({ label, description }) => (
                            <button
                              key={label}
                              type="button"
                              className="rounded-xl border border-black/5 bg-white px-4 py-3 text-left hover:border-[#2CADB2] hover:shadow-md transition-all duration-150"
                            >
                              <span
                                className="block text-sm font-semibold mb-1"
                                style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
                              >
                                {label}
                              </span>
                              <span className="block text-sm" style={cardStyle}>
                                {description}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
