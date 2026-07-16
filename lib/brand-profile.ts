/** Brand profile for in-platform customization before export. */

export type CtaLinkType =
  | "website"
  | "email"
  | "phone"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "x";

export interface BrandCtaLink {
  type: CtaLinkType;
  value: string;
  enabled: boolean;
}

export interface BrandColors {
  /** Main brand highlight (headings, icons, links) */
  primary: string;
  /** Dark companion / secondary brand tone */
  secondary: string;
  /** Primary accent (CTA banners, highlights) */
  accent: string;
  /** Secondary accent (supporting highlights) */
  accentSecondary: string;
  /** Slide / page canvas background */
  slide: string;
  /** Body and heading font color */
  text: string;
}

export interface BrandCtaSettings {
  enabled: boolean;
  links: BrandCtaLink[];
}

/** Editable deck copy mapped onto HTML data-i18n keys. */
export interface BrandContentFields {
  /** Replaces cover.sub (yellow presentation description) */
  presentationDescription: string;
  /** Replaces meta.audience.v */
  audience: string;
  /** Replaces cta.contact mailto target / visible email */
  contactEmail: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  /** Replaces "Product Template" in chrome (`brand` / `cta.brand`) */
  companyName: string;
  logoDataUrl?: string;
  colors: BrandColors;
  fontFamily: string;
  content: BrandContentFields;
  cta: BrandCtaSettings;
  updatedAt: string;
}

export const BRAND_PROFILE_STORAGE_KEY = "hostopia-connects-brand-profile";

export const HOSTOPIA_DEFAULT_COLORS: BrandColors = {
  primary: "#2CADB2",
  secondary: "#1D8F93",
  accent: "#F8CF41",
  accentSecondary: "#E0EBEA",
  slide: "#F5EFE3",
  text: "#1A1A1A",
};

export const DEFAULT_CTA_LINKS: BrandCtaLink[] = [
  { type: "website", value: "", enabled: false },
  { type: "email", value: "", enabled: false },
  { type: "phone", value: "", enabled: false },
  { type: "linkedin", value: "", enabled: false },
  { type: "facebook", value: "", enabled: false },
  { type: "instagram", value: "", enabled: false },
  { type: "x", value: "", enabled: false },
];

export const DEFAULT_BRAND_CONTENT: BrandContentFields = {
  presentationDescription: "",
  audience: "",
  contactEmail: "",
};

export function createDefaultBrandProfile(): BrandProfile {
  const now = new Date().toISOString();
  return {
    id: "default",
    name: "Hostopia default",
    companyName: "Hostopia Connects",
    colors: { ...HOSTOPIA_DEFAULT_COLORS },
    fontFamily: "Montserrat",
    content: { ...DEFAULT_BRAND_CONTENT },
    cta: { enabled: false, links: DEFAULT_CTA_LINKS.map((l) => ({ ...l })) },
    updatedAt: now,
  };
}

function migrateColors(raw: unknown): BrandColors {
  const base = HOSTOPIA_DEFAULT_COLORS;
  if (!raw || typeof raw !== "object") return { ...base };
  const c = raw as Record<string, string>;
  return {
    primary: c.primary ?? base.primary,
    secondary: c.secondary ?? c.primaryDeep ?? base.secondary,
    accent: c.accent ?? base.accent,
    accentSecondary: c.accentSecondary ?? base.accentSecondary,
    slide: c.slide ?? c.background ?? base.slide,
    text: c.text ?? base.text,
  };
}

function migrateContent(raw: unknown): BrandContentFields {
  const base = DEFAULT_BRAND_CONTENT;
  if (!raw || typeof raw !== "object") return { ...base };
  const c = raw as Partial<BrandContentFields>;
  return {
    presentationDescription: String(c.presentationDescription ?? "").trim(),
    audience: String(c.audience ?? "").trim(),
    contactEmail: String(c.contactEmail ?? "").trim(),
  };
}

function migrateCta(raw: unknown): BrandCtaSettings {
  const defaults = createDefaultBrandProfile().cta;
  if (!raw || typeof raw !== "object") return defaults;
  const c = raw as Partial<BrandCtaSettings>;
  const byType = new Map(
    (c.links ?? []).map((link) => [link.type, link] as const)
  );
  return {
    enabled: Boolean(c.enabled),
    links: DEFAULT_CTA_LINKS.map((template) => {
      const existing = byType.get(template.type);
      return existing
        ? { ...template, value: existing.value ?? "", enabled: existing.enabled }
        : { ...template };
    }),
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
    colors: migrateColors(input.colors ?? base.colors),
    content: migrateContent(input.content ?? base.content),
    cta: migrateCta(input.cta ?? base.cta),
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

export function isBrandProfileCustomized(profile: BrandProfile): boolean {
  const defaults = createDefaultBrandProfile();
  if (profile.logoDataUrl) return true;
  if (profile.companyName.trim() && profile.companyName !== defaults.companyName) {
    return true;
  }
  if (profile.fontFamily !== defaults.fontFamily) return true;
  if (profile.cta.enabled) return true;
  if (profile.cta.links.some((l) => l.enabled && l.value.trim())) return true;
  if (profile.content.presentationDescription.trim()) return true;
  if (profile.content.audience.trim()) return true;
  if (profile.content.contactEmail.trim()) return true;

  const c = profile.colors;
  const d = defaults.colors;
  return (
    c.primary !== d.primary ||
    c.secondary !== d.secondary ||
    c.accent !== d.accent ||
    c.accentSecondary !== d.accentSecondary ||
    c.slide !== d.slide ||
    c.text !== d.text
  );
}

/**
 * Profiles that should be applied on export — customized brands, or any
 * profile that replaces Product Template chrome (company name set).
 */
export function shouldApplyBrandOnExport(profile: BrandProfile | undefined): boolean {
  if (!profile) return false;
  if (isBrandProfileCustomized(profile)) return true;
  return Boolean(profile.companyName.trim());
}

export function parseBrandProfileJson(body: unknown): BrandProfile | null {
  if (!isBrandProfile(body)) return null;
  return normalizeBrandProfile(body);
}

/**
 * Shrink a brand profile for API export bodies (drop unused CTA fields, cap logo).
 * Logos larger than ~180KB are dropped so the request fits serverless limits;
 * colors/copy still apply.
 */
export function slimBrandProfileForExport(profile: BrandProfile): BrandProfile {
  const maxLogoChars = 240_000; // ~180KB binary
  const logo =
    profile.logoDataUrl && profile.logoDataUrl.length > maxLogoChars
      ? undefined
      : profile.logoDataUrl;

  return {
    ...profile,
    logoDataUrl: logo,
    cta: {
      enabled: profile.cta.enabled,
      links: profile.cta.links
        .filter((l) => l.enabled && l.value.trim())
        .map((l) => ({ ...l, value: l.value.trim() })),
    },
  };
}

export function updateCtaLink(
  profile: BrandProfile,
  type: CtaLinkType,
  patch: Partial<Pick<BrandCtaLink, "value" | "enabled">>
): BrandCtaSettings {
  return {
    ...profile.cta,
    links: profile.cta.links.map((link) =>
      link.type === type ? { ...link, ...patch } : link
    ),
  };
}

export function buildContactHtml(email: string): string {
  const clean = email.trim().replace(/^mailto:/i, "");
  if (!clean) return "";
  const safe = clean.replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `Contact us at <a href="mailto:${safe}">${safe}</a> to learn more and connect with one of our experts.`;
}
