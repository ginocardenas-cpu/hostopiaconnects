"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { journeys } from "@/lib/assets";

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

const contentTypes = [
  {
    label: "Videos",
    description:
      "Watch marketing videos, demos, and walkthroughs that help explain our products.",
  },
  {
    label: "Decks & Presentations",
    description:
      "Download ready-to-use slides covering product overviews.",
  },
  {
    label: "Documents & Playbooks",
    description:
      "Explore strategy guides, documentation, and playbooks designed to support sales and marketing efforts.",
  },
  {
    label: "Training Modules",
    description:
      "Structured learning content to help sales teams understand how to sell our products.",
  },
];

const useCases = [
  {
    label: "Sales",
    description:
      "Pitch decks, product materials, and tools designed to help your teams sell.",
  },
  {
    label: "Marketing",
    description:
      "Marketing assets, messaging frameworks, and promotional assets to drive demand.",
  },
  {
    label: "Training",
    description:
      "Materials that help onboard new team members and keep teams up to speed.",
  },
  {
    label: "Support",
    description:
      "Documentation and support materials to help your customers succeed with our solutions.",
  },
];

const cardStyle = {
  fontFamily: "Raleway, sans-serif",
  color: "#555A5E",
  lineHeight: 1.625,
} as const;

export function UniqueAccordion() {
  const [activeId, setActiveId] = useState<string | null>("journey");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

                      {/* Journey: Build a brand, Get online, Get found, Grow their business */}
                      {item.id === "journey" && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {journeys.map((journey) => (
                            <Link
                              key={journey.label}
                              href={`/assets/journey/${journey.slug}`}
                              className="group relative overflow-hidden text-left rounded-2xl border border-black/5 bg-white p-5 hover:-translate-y-1 hover:shadow-lg hover:border-[#2CADB2]/30 transition-all duration-200"
                            >
                              <div className="absolute -top-6 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#2CADB2]/10 via-[#F8CF41]/20 to-transparent" />
                              <div
                                className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase mb-2 text-gray-500"
                                style={{ fontFamily: "Raleway, sans-serif" }}
                              >
                                <span className="text-xs">◎</span>
                                <span>Journey</span>
                              </div>
                              <div
                                className="font-black mb-1"
                                style={{
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "1.1rem",
                                  color: "#24282B",
                                }}
                              >
                                {journey.label}
                              </div>
                              <p className="text-sm" style={cardStyle}>
                                Tap to see assets aligned to this step of the customer journey.
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Content type blocks */}
                      {item.id === "content-type" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {contentTypes.map(({ label, description }) => (
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
                          {useCases.map(({ label, description }) => (
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
