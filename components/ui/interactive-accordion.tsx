"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Globe,
  Search,
  TrendingUp,
  Video,
  Presentation,
  FileText,
  BookOpen,
  Briefcase,
  Megaphone,
  GraduationCap,
  HelpCircle,
  Package,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  journeys,
  journeyProducts,
  filterAssets,
  type ProductJourney,
  type ProductCategory,
  type ContentType,
  type UseCase,
  type Asset,
} from "@/lib/assets";
import { useBrowse } from "@/components/BrowseProvider";
import { AssetDetailPanel } from "@/components/AssetDetailPanel";

interface AccordionItem {
  id: string;
  number: string;
  title: string;
  content: string;
}

const items: AccordionItem[] = [
  {
    id: "journey",
    number: "",
    title: "Begin",
    content:
      "Start from where your customer is in their lifecycle and see assets organized by product journey.",
  },
];

type IconComponent = React.ComponentType<{ className?: string; size?: number | string }>;

const journeyIcons: Record<ProductJourney, IconComponent> = {
  "Build a Brand": Palette,
  "Get Online": Globe,
  "Get Found": Search,
  "Grow their Business": TrendingUp,
};

const contentTypesWithType: { label: string; description: string; type: ContentType; Icon: IconComponent }[] = [
  { label: "Videos", description: "Watch marketing videos, demos, and walkthroughs that help explain our products.", type: "Video", Icon: Video },
  { label: "Decks & Presentations", description: "Download ready-to-use slides covering product overviews.", type: "Presentation", Icon: Presentation },
  { label: "Documents & Playbooks", description: "Explore strategy guides, documentation, and playbooks designed to support sales and marketing efforts.", type: "Document", Icon: FileText },
  { label: "Training Modules", description: "Structured learning content to help sales teams understand how to sell our products.", type: "Training", Icon: BookOpen },
];

const useCasesWithType: { label: string; description: string; type: UseCase; Icon: IconComponent }[] = [
  { label: "Sales", description: "Pitch decks, product materials, and tools designed to help your teams sell.", type: "Sales", Icon: Briefcase },
  { label: "Marketing", description: "Marketing assets, messaging frameworks, and promotional assets to drive demand.", type: "Marketing", Icon: Megaphone },
  { label: "Training", description: "Materials that help onboard new team members and keep teams up to speed.", type: "Training & Onboarding", Icon: GraduationCap },
  { label: "Support", description: "Documentation and support materials to help your customers succeed with our solutions.", type: "Support", Icon: HelpCircle },
];

const cardStyle = {
  fontFamily: "Raleway, sans-serif",
  color: "#555A5E",
  lineHeight: 1.625,
} as const;

function SelectionTile({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  index = 0,
}: {
  icon: IconComponent;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  index?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden text-left rounded-2xl border p-5 transition-all duration-200 flex items-start gap-4 ${
        selected ? "border-[#2CADB2] bg-[#2CADB2]/10 shadow-md" : "border-black/5 bg-white hover:border-[#2CADB2]/30 hover:shadow-lg"
      }`}
    >
      <div className="absolute -top-6 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#2CADB2]/10 via-[#F8CF41]/20 to-transparent" />
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#2CADB2]/10 flex items-center justify-center text-[#2CADB2] group-hover:bg-[#2CADB2]/20 transition-colors">
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-black mb-0.5" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "1.05rem", color: "#24282B" }}>
          {title}
        </div>
        <p className="text-sm" style={cardStyle}>{description}</p>
      </div>
    </motion.button>
  );
}

export function UniqueAccordion() {
  const [activeId, setActiveId] = useState<string | null>("journey");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { setResultsFromAssets, seenSlugs, markSeen } = useBrowse();
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedJourneys, setSelectedJourneys] = useState<ProductJourney[]>([]);
  const [selectedProductCategories, setSelectedProductCategories] = useState<ProductCategory[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<UseCase[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

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
                  {item.number ? (
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
                  ) : null}

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

                      {/* Journey: multi-step wizard with vertical selection + unified tiles */}
                      {item.id === "journey" && (
                        <div className="flex flex-col lg:flex-row gap-8">
                          {/* Vertical selection history - only when accordion is open */}
                          <div className="lg:w-52 flex-shrink-0">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2CADB2] mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
                              Your selection
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="text-gray-500 block mb-1">Journey</span>
                                {selectedJourneys.length === 0 ? (
                                  <span className="text-gray-400 italic">None yet</span>
                                ) : (
                                  <ul className="space-y-0.5">
                                    {selectedJourneys.map((j) => (
                                      <li key={j} className="flex items-center gap-1.5">
                                        <ChevronRight className="w-3.5 h-3.5 text-[#2CADB2] flex-shrink-0" />
                                        <span style={cardStyle}>{j}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              {(wizardStep >= 2 || selectedProductCategories.length > 0) && (
                                <div>
                                  <span className="text-gray-500 block mb-1">Products</span>
                                  {selectedProductCategories.length === 0 ? (
                                    <span className="text-gray-400 italic">None yet</span>
                                  ) : (
                                    <ul className="space-y-0.5">
                                      {productsForJourneys
                                        .filter((p) => selectedProductCategories.includes(p.category))
                                        .reduce<{ label: string }[]>((acc, p) => (acc.some((x) => x.label === p.label) ? acc : [...acc, { label: p.label }]), [])
                                        .map(({ label }) => (
                                          <li key={label} className="flex items-center gap-1.5">
                                            <ChevronRight className="w-3.5 h-3.5 text-[#2CADB2] flex-shrink-0" />
                                            <span style={cardStyle}>{label}</span>
                                          </li>
                                        ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                              {(wizardStep >= 3 || selectedContentTypes.length > 0 || selectedUseCases.length > 0) && (
                                <>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Content type</span>
                                    {selectedContentTypes.length === 0 ? (
                                      <span className="text-gray-400 italic">Any</span>
                                    ) : (
                                      <ul className="space-y-0.5">
                                        {contentTypesWithType.filter((c) => selectedContentTypes.includes(c.type)).map((c) => (
                                          <li key={c.type} className="flex items-center gap-1.5">
                                            <ChevronRight className="w-3.5 h-3.5 text-[#2CADB2] flex-shrink-0" />
                                            <span style={cardStyle}>{c.label}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block mb-1">Use case</span>
                                    {selectedUseCases.length === 0 ? (
                                      <span className="text-gray-400 italic">Any</span>
                                    ) : (
                                      <ul className="space-y-0.5">
                                        {useCasesWithType.filter((u) => selectedUseCases.includes(u.type)).map((u) => (
                                          <li key={u.type} className="flex items-center gap-1.5">
                                            <ChevronRight className="w-3.5 h-3.5 text-[#2CADB2] flex-shrink-0" />
                                            <span style={cardStyle}>{u.label}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-6">
                            {wizardStep === 1 && (
                              <>
                                <p className="text-sm text-muted-foreground" style={cardStyle}>Select one or more journeys. Then click Next to choose products.</p>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  {journeys.map((journey, i) => {
                                    const Icon = journeyIcons[journey.label];
                                    return (
                                      <SelectionTile
                                        key={journey.label}
                                        icon={Icon}
                                        title={journey.label}
                                        description="Tap to select. Then click Next."
                                        selected={selectedJourneys.includes(journey.label)}
                                        onClick={() => toggleJourney(journey.label)}
                                        index={i}
                                      />
                                    );
                                  })}
                                </div>
                                <div className="flex justify-end">
                                  <motion.button
                                    type="button"
                                    onClick={() => setWizardStep(2)}
                                    disabled={selectedJourneys.length === 0}
                                    className="rounded-full px-6 py-2 text-sm font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#2CADB2", color: "white" }}
                                    whileHover={selectedJourneys.length > 0 ? { scale: 1.03 } : {}}
                                    whileTap={selectedJourneys.length > 0 ? { scale: 0.98 } : {}}
                                  >
                                    Next <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                  </motion.button>
                                </div>
                              </>
                            )}

                            {wizardStep === 2 && (
                              <>
                                <p className="text-sm text-muted-foreground" style={cardStyle}>Select products for the journeys you chose. Then click Next.</p>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                  {productsForJourneys.map((p, i) => {
                                    const selected = selectedProductCategories.includes(p.category);
                                    return (
                                      <SelectionTile
                                        key={`${p.journey}-${p.slug}`}
                                        icon={Package}
                                        title={p.label}
                                        description={p.description}
                                        selected={selected}
                                        onClick={() => toggleProduct(p.category)}
                                        index={i}
                                      />
                                    );
                                  })}
                                </div>
                                <div className="flex justify-between">
                                  <button type="button" onClick={() => setWizardStep(1)} className="text-sm font-semibold text-[#2CADB2] hover:underline" style={{ fontFamily: "Montserrat, sans-serif" }}>← Back</button>
                                  <motion.button
                                    type="button"
                                    onClick={() => setWizardStep(3)}
                                    className="rounded-full px-6 py-2 text-sm font-bold shadow-md flex items-center gap-2"
                                    style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#2CADB2", color: "white" }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    Next <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                  </motion.button>
                                </div>
                              </>
                            )}

                            {wizardStep === 3 && (
                              <>
                                <p className="text-sm text-muted-foreground" style={cardStyle}>Optionally narrow by content type and use case. Then click Next to see assets.</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <h4 className="text-sm font-bold mb-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>Content type</h4>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      {contentTypesWithType.map(({ label, description, type, Icon }, i) => (
                                        <SelectionTile
                                          key={type}
                                          icon={Icon}
                                          title={label}
                                          description={description}
                                          selected={selectedContentTypes.includes(type)}
                                          onClick={() => toggleContentType(type)}
                                          index={i}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold mb-2" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>Use case</h4>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      {useCasesWithType.map(({ label, description, type, Icon }, i) => (
                                        <SelectionTile
                                          key={type}
                                          icon={Icon}
                                          title={label}
                                          description={description}
                                          selected={selectedUseCases.includes(type)}
                                          onClick={() => toggleUseCase(type)}
                                          index={i + 4}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <button type="button" onClick={() => setWizardStep(2)} className="text-sm font-semibold text-[#2CADB2] hover:underline" style={{ fontFamily: "Montserrat, sans-serif" }}>← Back</button>
                                  <motion.button
                                    type="button"
                                    onClick={() => {
                                      setResultsFromAssets(filteredAssets);
                                      setWizardStep(4);
                                      setSelectedAsset(null);
                                    }}
                                    className="rounded-full px-6 py-2 text-sm font-bold shadow-md flex items-center gap-2"
                                    style={{ fontFamily: "Montserrat, sans-serif", backgroundColor: "#2CADB2", color: "white" }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    Next — see assets <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                  </motion.button>
                                </div>
                              </>
                            )}

                            {wizardStep === 4 && (
                              <>
                                <p className="text-sm text-muted-foreground" style={cardStyle}>
                                  {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""} match. Click one to view details below.
                                </p>
                                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                                  {filteredAssets.length === 0 ? (
                                    <p className="text-sm py-4" style={cardStyle}>No assets match. Try fewer or different filters.</p>
                                  ) : (
                                    filteredAssets.map((asset) => {
                                      const viewed = seenSlugs.includes(asset.slug);
                                      const isSelected = selectedAsset?.id === asset.id;
                                      return (
                                        <motion.button
                                          key={asset.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedAsset(asset);
                                            markSeen(asset.slug);
                                          }}
                                          className={`w-full flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-all ${
                                            isSelected
                                              ? "border-[#2CADB2] bg-[#2CADB2]/10 shadow-md"
                                              : viewed
                                                ? "border-black/5 bg-gray-100/80 opacity-75 hover:opacity-90"
                                                : "border-black/5 bg-white hover:border-[#2CADB2] hover:shadow-md"
                                          }`}
                                          whileHover={{ x: 2 }}
                                          whileTap={{ scale: 0.99 }}
                                        >
                                          <div>
                                            <span className="block text-sm font-semibold" style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}>{asset.title}</span>
                                            <span className="text-xs" style={cardStyle}>{asset.contentType} · {asset.productCategory}</span>
                                          </div>
                                          {viewed ? (
                                            <span className="text-xs text-gray-500 font-medium">Viewed</span>
                                          ) : (
                                            <span className="text-xs text-[#2CADB2] font-medium">View</span>
                                          )}
                                        </motion.button>
                                      );
                                    })
                                  )}
                                </div>
                                <div className="flex justify-between pt-2">
                                  <button type="button" onClick={() => setWizardStep(3)} className="text-sm font-semibold text-[#2CADB2] hover:underline" style={{ fontFamily: "Montserrat, sans-serif" }}>← Back</button>
                                </div>

                                <AnimatePresence mode="wait">
                                  {selectedAsset ? (
                                    <motion.div
                                      key={selectedAsset.id}
                                      initial={{ opacity: 0, y: 12 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                      className="mt-6"
                                    >
                                      <AssetDetailPanel asset={selectedAsset} />
                                    </motion.div>
                                  ) : (
                                    <motion.p
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="text-sm text-gray-400 py-6 text-center"
                                      style={{ fontFamily: "Raleway, sans-serif" }}
                                    >
                                      Click an asset above to view its details here.
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </>
                            )}
                          </div>
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
