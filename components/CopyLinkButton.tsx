"use client";

import { useCallback } from "react";

type CopyLinkButtonProps = {
  /**
   * Path beginning with `/` (e.g. `/en/assets/my-slug`). Copied as
   * `origin + copyPath` so it works from any page (e.g. library overlay).
   */
  copyPath?: string;
  label?: string;
};

export function CopyLinkButton({ copyPath, label = "Copy Link" }: CopyLinkButtonProps) {
  const handleClick = useCallback(() => {
    if (typeof window === "undefined") return;
    const text = copyPath
      ? `${window.location.origin}${copyPath.startsWith("/") ? copyPath : `/${copyPath}`}`
      : window.location.href;
    void navigator.clipboard.writeText(text);
  }, [copyPath]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold border border-charcoal/20 bg-white transition hover:bg-cream font-montserrat text-charcoal"
    >
      {label}
    </button>
  );
}
