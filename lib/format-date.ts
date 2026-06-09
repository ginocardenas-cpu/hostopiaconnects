/** Parse YYYY-MM-DD without timezone drift from UTC midnight parsing. */
function parseIsoDate(isoDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function toUtcDate(isoDate: string): Date | null {
  const parts = parseIsoDate(isoDate);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

/** Stable short date for lists, e.g. "5/20/2026" — identical on server and client. */
export function formatDisplayDate(isoDate: string, locale = "en-US"): string {
  const date = toUtcDate(isoDate);
  if (!date) return isoDate;
  return date.toLocaleDateString(locale, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Stable medium date, e.g. "May 20, 2026". */
export function formatDisplayDateLong(isoDate: string, locale = "en-US"): string {
  const date = toUtcDate(isoDate);
  if (!date) return isoDate;
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Compact card date, e.g. "May '26". */
export function formatDisplayDateCompact(isoDate: string, locale = "en-US"): string {
  const date = toUtcDate(isoDate);
  if (!date) return isoDate;
  return date.toLocaleDateString(locale, {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}
