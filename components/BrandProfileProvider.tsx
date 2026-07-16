"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createDefaultBrandProfile,
  loadBrandProfileFromStorage,
  normalizeBrandProfile,
  saveBrandProfileToStorage,
  type BrandProfile,
} from "@/lib/brand-profile";

interface BrandProfileContextValue {
  profile: BrandProfile;
  hydrated: boolean;
  updateProfile: (patch: Partial<BrandProfile>) => void;
  resetProfile: () => void;
  /** Persist current profile, or an explicit snapshot (avoids stale state after draft apply). */
  saveProfile: (override?: BrandProfile) => void;
}

const BrandProfileContext = createContext<BrandProfileContextValue | undefined>(
  undefined
);

export function BrandProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BrandProfile>(createDefaultBrandProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadBrandProfileFromStorage());
    setHydrated(true);
  }, []);

  const updateProfile = useCallback((patch: Partial<BrandProfile>) => {
    setProfile((prev) => normalizeBrandProfile({ ...prev, ...patch }));
  }, []);

  const resetProfile = useCallback(() => {
    const defaults = createDefaultBrandProfile();
    setProfile(defaults);
    saveBrandProfileToStorage(defaults);
  }, []);

  const saveProfile = useCallback((override?: BrandProfile) => {
    setProfile((prev) => {
      const next = normalizeBrandProfile(override ?? prev);
      saveBrandProfileToStorage(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      profile,
      hydrated,
      updateProfile,
      resetProfile,
      saveProfile,
    }),
    [profile, hydrated, updateProfile, resetProfile, saveProfile]
  );

  return (
    <BrandProfileContext.Provider value={value}>
      {children}
    </BrandProfileContext.Provider>
  );
}

export function useBrandProfile() {
  const ctx = useContext(BrandProfileContext);
  if (!ctx) {
    throw new Error("useBrandProfile must be used within BrandProfileProvider");
  }
  return ctx;
}
