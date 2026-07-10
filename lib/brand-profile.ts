/** Brand profile for in-platform customization before export. */

export interface BrandColors {
  primary: string;
  primaryDeep: string;
  accent: string;
  background: string;
  text: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  companyName: string;
  logoDataUrl?: string;
  colors: BrandColors;
  fontFamily: string;
  updatedAt: string;
}

export const BRAND_PROFILE_STORAGE_KEY = "hostopia-connects-brand-profile";

export const HOSTOPIA_DEFAULT_COLORS: BrandColors = {
  primary: "#2CADB2",
  primaryDeep: "#1D8F93",
  accent: "#F8CF41",
  background: "#F5EFE3",
  text: "#1A1A1A",
};

export function createDefaultBrandProfile(): BrandProfile {
  const now = new Date().toISOString();
  return {
    id: "default",
    name: "Hostopia default",
    companyName: "Hostopia Connects",
    colors: { ...HOSTOPIA_DEFAULT_COLORS },
    fontFamily: "Montserrat",
    updatedAt: now,
  };
}

export function isBrandProfile(value: unknown): value is BrandProfile {
  if (!value || typeof value !== "object") return false;
  const p = value as BrandProfile;
  return (
    typeof p.id === "string" &&
    typeof p.companyName === "string" &&
    typeof p.colors?.primary === "string" &&
    typeof p.fontFamily === "string"
  );
}

export function normalizeBrandProfile(input: Partial<BrandProfile>): BrandProfile {
  const base = createDefaultBrandProfile();
  return {
    ...base,
    ...input,
    colors: {
      ...base.colors,
      ...(input.colors ?? {}),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function loadBrandProfileFromStorage(): BrandProfile {
  if (typeof window === "undefined") return createDefaultBrandProfile();
  try {
    const raw = localStorage.getItem(BRAND_PROFILE_STORAGE_KEY);
    if (!raw) return createDefaultBrandProfile();
    const parsed = JSON.parse(raw) as unknown;
    if (!isBrandProfile(parsed)) return createDefaultBrandProfile();
    return normalizeBrandProfile(parsed);
  } catch {
    return createDefaultBrandProfile();
  }
}

export function saveBrandProfileToStorage(profile: BrandProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      BRAND_PROFILE_STORAGE_KEY,
      JSON.stringify(normalizeBrandProfile(profile))
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearBrandProfileStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(BRAND_PROFILE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** True when profile differs from Hostopia defaults (customization active). */
export function isBrandProfileCustomized(profile: BrandProfile): boolean {
  const defaults = createDefaultBrandProfile();
  if (profile.logoDataUrl) return true;
  if (profile.companyName !== defaults.companyName) return true;
  if (profile.fontFamily !== defaults.fontFamily) return true;
  return (
    profile.colors.primary !== defaults.colors.primary ||
    profile.colors.primaryDeep !== defaults.colors.primaryDeep ||
    profile.colors.accent !== defaults.colors.accent ||
    profile.colors.background !== defaults.colors.background
  );
}

export function parseBrandProfileJson(body: unknown): BrandProfile | null {
  if (!isBrandProfile(body)) return null;
  return normalizeBrandProfile(body);
}
