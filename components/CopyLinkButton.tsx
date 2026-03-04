"use client";

import { useCallback } from "react";

export function CopyLinkButton() {
  const handleClick = useCallback(() => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold border border-[#24282B]/20 bg-white transition hover:bg-[#f7f6f2]"
      style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
    >
      Copy Link
    </button>
  );
}
