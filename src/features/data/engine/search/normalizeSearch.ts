import { normalizeAccents } from '@shared/lib/stringUtils';

// Must stay identical to the split in anyWordStartsWith (src/shared/lib/stringUtils.ts)
const WORD_SEPARATOR = /[^\p{L}\p{N}]/u;

/** Same normalization anyWordStartsWith applies to both the string and the query. */
export function normalizeForSearch(str: string): string {
  return normalizeAccents(str.toLowerCase());
}

export function splitWords(normalized: string): string[] {
  return normalized.split(WORD_SEPARATOR);
}

/**
 * anyWordStartsWith(str, query) is true when a word of str starts with the query, or when the
 * whole str starts with it. Words never contain separators, so:
 *   - a query with a separator can only match the whole string
 *   - a query without one matches the whole string only if it also matches the first word
 * which lets both cases be answered with a prefix lookup over sorted keys.
 */
export function queryNeedsWholeString(normalizedQuery: string): boolean {
  return WORD_SEPARATOR.test(normalizedQuery);
}
