"use client";

import { useEffect } from "react";
import { useBrowse } from "./BrowseProvider";

interface AssetMarkSeenProps {
  slug: string;
}

/** When user views an asset detail page, mark it seen in the browse context so "X to view" and list shading stay in sync. */
export function AssetMarkSeen({ slug }: AssetMarkSeenProps) {
  const { resultSlugs, markSeen } = useBrowse();

  useEffect(() => {
    if (resultSlugs.includes(slug)) {
      markSeen(slug);
    }
  }, [slug, resultSlugs, markSeen]);

  return null;
}
