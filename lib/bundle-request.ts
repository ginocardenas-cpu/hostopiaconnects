import type { DeckLang } from "@/lib/html-deck-i18n";

export interface BundleRequestItem {
  assetId: string;
  deckLang?: DeckLang;
}

export interface BundleRequestLead {
  fullName: string;
  company: string;
  email: string;
  optIn: boolean;
}

export interface BundleRequestPayload {
  lead: BundleRequestLead;
  items: BundleRequestItem[];
  locale?: string;
}

export interface BundleDownloadItem {
  assetId: string;
  slug: string;
  title: string;
  fileUrl: string;
  fileName: string;
  deckLang?: DeckLang;
}

export interface BundleRequestResponse {
  requestId: string;
  downloads: BundleDownloadItem[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseBundleRequestPayload(
  body: unknown
): BundleRequestPayload | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const leadRaw = record.lead;
  const itemsRaw = record.items;

  if (!leadRaw || typeof leadRaw !== "object" || !Array.isArray(itemsRaw)) {
    return null;
  }

  const leadObj = leadRaw as Record<string, unknown>;
  const fullName = String(leadObj.fullName ?? "").trim();
  const company = String(leadObj.company ?? "").trim();
  const email = String(leadObj.email ?? "").trim().toLowerCase();
  const optIn = Boolean(leadObj.optIn);

  if (!fullName || !company || !email || !EMAIL_RE.test(email)) {
    return null;
  }

  const items: BundleRequestItem[] = [];
  for (const row of itemsRaw) {
    if (!row || typeof row !== "object") continue;
    const assetId = String((row as BundleRequestItem).assetId ?? "").trim();
    if (!assetId) continue;
    const deckLang = (row as BundleRequestItem).deckLang;
    items.push({
      assetId,
      ...(deckLang ? { deckLang } : {}),
    });
  }

  if (items.length === 0) return null;

  const locale =
    typeof record.locale === "string" ? record.locale.trim() : undefined;

  return {
    lead: { fullName, company, email, optIn },
    items,
    locale,
  };
}
