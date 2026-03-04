"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { type Asset, getAssetBySlug } from "@/lib/assets";

interface BrowseContextValue {
  resultSlugs: string[];
  results: Asset[];
  seenSlugs: string[];
  unseenCount: number;
  setResultsFromAssets: (assets: Asset[]) => void;
  markSeen: (slug: string) => void;
  clearResults: () => void;
}

const BrowseContext = createContext<BrowseContextValue | undefined>(undefined);

export function BrowseProvider({ children }: { children: ReactNode }) {
  const [resultSlugs, setResultSlugs] = useState<string[]>([]);
  const [seenSlugs, setSeenSlugs] = useState<string[]>([]);

  const results = useMemo(
    () =>
      resultSlugs
        .map((slug) => getAssetBySlug(slug))
        .filter((a): a is Asset => Boolean(a)),
    [resultSlugs]
  );

  const unseenCount = useMemo(
    () => resultSlugs.filter((slug) => !seenSlugs.includes(slug)).length,
    [resultSlugs, seenSlugs]
  );

  const setResultsFromAssets = (assets: Asset[]) => {
    setResultSlugs(assets.map((a) => a.slug));
    setSeenSlugs([]);
  };

  const markSeen = (slug: string) => {
    setSeenSlugs((prev) =>
      prev.includes(slug) ? prev : [...prev, slug]
    );
  };

  const clearResults = () => {
    setResultSlugs([]);
    setSeenSlugs([]);
  };

  const value: BrowseContextValue = useMemo(
    () => ({
      resultSlugs,
      results,
      seenSlugs,
      unseenCount,
      setResultsFromAssets,
      markSeen,
      clearResults
    }),
    [resultSlugs, results, seenSlugs, unseenCount]
  );

  return (
    <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>
  );
}

export function useBrowse() {
  const ctx = useContext(BrowseContext);
  if (!ctx) {
    throw new Error("useBrowse must be used within a BrowseProvider");
  }
  return ctx;
}
