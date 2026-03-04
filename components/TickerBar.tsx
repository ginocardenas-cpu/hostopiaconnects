"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";

const TICKER_STORAGE_KEY = "hostopia-connects-ticker-dismissed";

const defaultMessage = {
  label: "Hostopia Spotlight",
  text: "We're thrilled to announce the 2026 Hostopia Product Guide is now available in Connects.",
  date: "Mar. 3, 2026",
  href: "/#featured"
};

export function TickerBar() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem(TICKER_STORAGE_KEY);
    setDismissed(stored === "1");
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(TICKER_STORAGE_KEY, "1");
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  const { label, text, date, href } = defaultMessage;

  return (
    <div
      className="flex items-center justify-center gap-4 px-6 py-2 text-sm border-b border-[#2CADB2]/20"
      style={{
        fontFamily: "Raleway, sans-serif",
        backgroundColor: "#f0fbfa",
        color: "#24282B"
      }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[#2CADB2]" aria-hidden>
          <Sparkles size={18} />
        </span>
        <span className="font-semibold text-[#2CADB2]">{label}</span>
      </div>
      <a
        href={href}
        className="min-w-0 flex-1 truncate text-center hover:underline focus:underline"
      >
        {text}
      </a>
      <span className="shrink-0 text-gray-500 text-xs">{date}</span>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded hover:bg-black/5 text-gray-500 hover:text-gray-700"
        aria-label="Dismiss announcement"
      >
        <X size={16} />
      </button>
    </div>
  );
}
