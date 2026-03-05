"use client";

import { Sparkles } from "lucide-react";

const defaultMessage = {
  label: "What's New!",
  text: "We're thrilled to announce the 2026 Hostopia Product Guide is now available in Connects.",
  date: "Mar. 3, 2026",
  href: "/#featured"
};

export function TickerBar() {
  const { label, text, date, href } = defaultMessage;

  return (
    <div
      className="flex items-center justify-center gap-4 px-6 py-2 text-sm border-b border-white/10"
      style={{
        fontFamily: "Raleway, sans-serif",
        backgroundColor: "#24282B"
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
        className="min-w-0 flex-1 truncate text-center text-white hover:underline focus:underline"
      >
        {text}
      </a>
      <span className="shrink-0 text-white text-xs opacity-90">{date}</span>
    </div>
  );
}
