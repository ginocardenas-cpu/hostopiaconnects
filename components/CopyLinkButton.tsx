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
      className="inline-flex items-center justify-center rounded-full border border-charcoal/20 bg-white px-6 py-2 text-sm font-semibold text-charcoal transition hover:bg-cream font-heading"
    >
      Copy Link
    </button>
  );
}
