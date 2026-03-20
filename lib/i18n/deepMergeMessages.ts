/**
 * Deep-merge locale message objects. Nested objects are merged; leaf strings
 * from `overlay` replace `base`. Used so every locale can ship a partial file
 * and fall back to English for missing keys.
 */
export function deepMergeMessages(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(overlay)) {
    const b = base[key];
    const o = overlay[key];
    if (
      o !== null &&
      typeof o === "object" &&
      !Array.isArray(o) &&
      typeof b === "object" &&
      b !== null &&
      !Array.isArray(b)
    ) {
      result[key] = deepMergeMessages(
        b as Record<string, unknown>,
        o as Record<string, unknown>
      );
    } else if (o !== undefined) {
      result[key] = o;
    }
  }
  return result;
}
