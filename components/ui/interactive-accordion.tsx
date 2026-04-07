"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
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
  CircleSlash,
  RotateCcw,
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
      className={`group relative overflow-hidden text-left rounded-2xl border transition-all duration-200 flex flex-col min-h-[140px] p-6 ${
        selected ? "border-teal bg-teal/10 shadow-md" : "border-black/5 bg-white hover:border-teal/30 hover:shadow-lg"
      }`}
    >
      <div className="absolute -top-6 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-teal/10 via-gold/20 to-transparent" />
      <div className="mb-4 flex-shrink-0 w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center text-teal group-hover:bg-teal/20 transition-colors">
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="mb-2 font-heading text-[1.05rem] font-black text-charcoal">
          {title}
        </div>
        <p className="break-words font-body text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
    </motion.button>
  );
}

interface UniqueAccordionProps {
  onStartOver?: () => void;
}

export function UniqueAccordion({ onStartOver }: UniqueAccordionProps) {
  const t = useTranslations("browse");
  const { setResultsFromAssets, seenSlugs, markSeen, clearResults } = useBrowse();
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
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

  const handleStartOver = () => {
    setSelectedJourneys([]);
    setSelectedProductCategories([]);
    setSelectedContentTypes([]);
    setSelectedUseCases([]);
    setSelectedAsset(null);
    setWizardStep(1);
    clearResults();
    onStartOver?.();
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Your selection – clickable steps; Start over at bottom */}
        <div className="lg:w-56 flex-shrink-0 space-y-4">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-teal">
            {t("yourSelection")}
          </h4>
          <div className="space-y-3 text-sm">
                              <button
                                type="button"
                                onClick={() => setWizardStep(1)}
                                className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-teal/10 transition-colors border border-transparent hover:border-teal/20"
                              >
                                <span className="font-heading font-semibold text-charcoal">{t("step1Title")}</span>
                                {selectedJourneys.length === 0 ? (
                                  <span className="block text-xs text-gray-400 mt-0.5">{t("none")}</span>
                                ) : (
                                  <ul className="space-y-0.5 mt-1">
                                    {selectedJourneys.map((j) => (
                                      <li key={j} className="flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-teal flex-shrink-0" />
                                        <span className="font-body text-gray-500 leading-relaxed">{j}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setWizardStep(2)}
                                className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-teal/10 transition-colors border border-transparent hover:border-teal/20"
                              >
                                <span className="font-heading font-semibold text-charcoal">{t("step2Title")}</span>
                                {selectedProductCategories.length === 0 ? (
                                  <span className="block text-xs text-gray-400 mt-0.5">{t("none")}</span>
                                ) : (
                                  <ul className="space-y-0.5 mt-1">
                                    {productsForJourneys
                                      .filter((p) => selectedProductCategories.includes(p.category))
                                      .reduce<{ label: string }[]>((acc, p) => (acc.some((x) => x.label === p.label) ? acc : [...acc, { label: p.label }]), [])
                                      .map(({ label }) => (
                                        <li key={label} className="flex items-center gap-1.5">
                                          <ChevronRight className="w-3 h-3 text-teal flex-shrink-0" />
                                          <span className="font-body text-gray-500 leading-relaxed">{label}</span>
                                        </li>
                                      ))}
                                  </ul>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setWizardStep(3)}
                                className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-teal/10 transition-colors border border-transparent hover:border-teal/20"
                              >
                                <span className="font-heading font-semibold text-charcoal">{t("step3Title")}</span>
                                {selectedContentTypes.length === 0 ? (
                                  <span className="block text-xs text-gray-400 mt-0.5">{t("none")}</span>
                                ) : (
                                  <ul className="space-y-0.5 mt-1">
                                    {contentTypesWithType.filter((c) => selectedContentTypes.includes(c.type)).map((c) => (
                                      <li key={c.type} className="flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-teal flex-shrink-0" />
                                        <span className="font-body text-gray-500 leading-relaxed">{c.label}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setWizardStep(4)}
                                className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-teal/10 transition-colors border border-transparent hover:border-teal/20"
                              >
                                <span className="font-heading font-semibold text-charcoal">{t("step4Title")}</span>
                                {selectedUseCases.length === 0 ? (
                                  <span className="block text-xs text-gray-400 mt-0.5">{t("none")}</span>
                                ) : (
                                  <ul className="space-y-0.5 mt-1">
                                    {useCasesWithType.filter((u) => selectedUseCases.includes(u.type)).map((u) => (
                                      <li key={u.type} className="flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-teal flex-shrink-0" />
                                        <span className="font-body text-gray-500 leading-relaxed">{u.label}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handleStartOver}
                              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-teal/30 bg-transparent px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-teal/10 hover:text-teal font-heading"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              {t("startOver")}
                            </button>
                          </div>

                          <div className="flex-1 min-w-0 space-y-6">
                            {wizardStep === 1 && (
                              <>
                                <div className="mb-4 text-center">
                                  <h3 className="font-heading text-lg font-black text-charcoal">{t("step1Title")}</h3>
                                  <p className="mx-auto mt-2 max-w-xl font-body text-sm leading-relaxed text-gray-500">{t("step1Copy")}</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  {journeys.map((journey, i) => {
                                    const Icon = journeyIcons[journey.label];
                                    return (
                                      <SelectionTile
                                        key={journey.label}
                                        icon={Icon}
                                        title={journey.label}
                                        description={t("tapToSelect")}
                                        selected={selectedJourneys.includes(journey.label)}
                                        onClick={() => toggleJourney(journey.label)}
                                        index={i}
                                      />
                                    );
                                  })}
                                  <SelectionTile
                                    icon={CircleSlash}
                                    title={t("none")}
                                    description={t("noneDescStage")}
                                    selected={false}
                                    onClick={() => setSelectedJourneys([])}
                                    index={journeys.length}
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <motion.button
                                    type="button"
                                    onClick={() => setWizardStep(2)}
                                    className="flex items-center gap-2 rounded-full bg-teal px-6 py-2 text-sm font-bold text-white shadow-md font-heading"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {t("next")} <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                  </motion.button>
                                </div>
                              </>
                            )}

                            {wizardStep === 2 && (
                              <>
                                <div className="mb-4 text-center">
                                  <h3 className="font-heading text-lg font-black text-charcoal">{t("step2Title")}</h3>
                                  <p className="mx-auto mt-2 max-w-xl font-body text-sm leading-relaxed text-gray-500">{t("step2Copy")}</p>
                                </div>
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
                                  <SelectionTile
                                    icon={CircleSlash}
                                    title={t("none")}
                                    description={t("noneDescProduct")}
                                    selected={false}
                                    onClick={() => setSelectedProductCategories([])}
                                    index={productsForJourneys.length}
                                  />
                                </div>
                                <div className="flex justify-between">
                                  <button type="button" onClick={() => setWizardStep(1)} className="font-heading text-sm font-semibold text-teal hover:underline">← {t("back")}</button>
                                  <motion.button
                                    type="button"
                                    onClick={() => setWizardStep(3)}
                                    className="flex items-center gap-2 rounded-full bg-teal px-6 py-2 text-sm font-bold text-white shadow-md font-heading"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {t("next")} <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                  </motion.button>
                                </div>
                              </>
                            )}

                            {wizardStep === 3 && (
                              <>
                                <div className="mb-4 text-center">
                                  <h3 className="font-heading text-lg font-black text-charcoal">{t("step3Title")}</h3>
                                  <p className="mx-auto mt-2 max-w-xl font-body text-sm leading-relaxed text-gray-500">{t("step3Copy")}</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                  <SelectionTile
                                    icon={CircleSlash}
                                    title={t("none")}
                                    description={t("noneDescContent")}
                                    selected={false}
                                    onClick={() => setSelectedContentTypes([])}
                                    index={contentTypesWithType.length}
                                  />
                                </div>
                                <div className="flex justify-between">
                                  <button type="button" onClick={() => setWizardStep(2)} className="font-heading text-sm font-semibold text-teal hover:underline">← {t("back")}</button>
                                  <motion.button
                                    type="button"
                                    onClick={() => setWizardStep(4)}
                                    className="flex items-center gap-2 rounded-full bg-teal px-6 py-2 text-sm font-bold text-white shadow-md font-heading"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {t("next")} <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                  </motion.button>
                                </div>
                              </>
                            )}

                            {wizardStep === 4 && (
                              <>
                                <div className="mb-4 text-center">
                                  <h3 className="font-heading text-lg font-black text-charcoal">{t("step4Title")}</h3>
                                  <p className="mx-auto mt-2 max-w-xl font-body text-sm leading-relaxed text-gray-500">{t("step4Copy")}</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  {useCasesWithType.map(({ label, description, type, Icon }, i) => (
                                    <SelectionTile
                                      key={type}
                                      icon={Icon}
                                      title={label}
                                      description={description}
                                      selected={selectedUseCases.includes(type)}
                                      onClick={() => toggleUseCase(type)}
                                      index={i}
                                    />
                                  ))}
                                  <SelectionTile
                                    icon={CircleSlash}
                                    title={t("none")}
                                    description={t("noneDescWorkflow")}
                                    selected={false}
                                    onClick={() => setSelectedUseCases([])}
                                    index={useCasesWithType.length}
                                  />
                                </div>
                                <div className="flex justify-between">
                                  <button type="button" onClick={() => setWizardStep(3)} className="font-heading text-sm font-semibold text-teal hover:underline">← {t("back")}</button>
                                  <motion.button
                                    type="button"
                                    onClick={() => {
                                      setResultsFromAssets(filteredAssets);
                                      setWizardStep(5);
                                      setSelectedAsset(null);
                                    }}
                                    className="flex items-center gap-2 rounded-full bg-teal px-6 py-2 text-sm font-bold text-white shadow-md font-heading"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {t("nextSeeAssets")} <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                                  </motion.button>
                                </div>
                              </>
                            )}

                            {wizardStep === 5 && (
                              <>
                                <div className="mb-4">
                                  <h3 className="font-heading text-lg font-black text-charcoal">{t("viewYourResults")}</h3>
                                  <p className="mt-1 font-body text-sm leading-relaxed text-gray-500">{t("viewYourResultsDesc")}</p>
                                </div>
                                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                                  {filteredAssets.length === 0 ? (
                                    <p className="py-4 font-body text-sm leading-relaxed text-gray-500">{t("noAssetsMatch")}</p>
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
                                              ? "border-teal bg-teal/10 shadow-md"
                                              : viewed
                                                ? "border-black/5 bg-gray-100/80 opacity-75 hover:opacity-90"
                                                : "border-black/5 bg-white hover:border-teal hover:shadow-md"
                                          }`}
                                          whileHover={{ x: 2 }}
                                          whileTap={{ scale: 0.99 }}
                                        >
                                          <div>
                                            <span className="block font-heading text-sm font-semibold text-charcoal">{asset.title}</span>
                                            <span className="font-body text-xs leading-relaxed text-gray-500">
                                              {asset.contentType} · {asset.productCategory}
                                            </span>
                                          </div>
                                          {viewed ? (
                                            <span className="text-xs text-gray-500 font-medium">{t("viewed")}</span>
                                          ) : (
                                            <span className="text-xs text-teal font-medium">{t("view")}</span>
                                          )}
                                        </motion.button>
                                      );
                                    })
                                  )}
                                </div>
                                <div className="flex justify-between pt-2">
                                <button type="button" onClick={() => setWizardStep(4)} className="font-heading text-sm font-semibold text-teal hover:underline">← {t("back")}</button>
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
                                      className="py-6 text-center font-body text-sm text-gray-400"
                                    >
                                      {t("clickAssetToView")}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </>
                            )}
                          </div>
                        </div>
    </div>
  );
}
