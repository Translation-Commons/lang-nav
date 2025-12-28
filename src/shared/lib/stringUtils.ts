// Extracting words in parentheses from the input string
export function separateTitleAndSubtitle(str: string): [string, string | undefined] {
  const regex = /\(([^)]+)\)/;
  const match = str.match(regex);
  const title = match ? str.replace(regex, '').trim() : str;
  const subtitle = match != null && match.length > 1 ? match[1].trim() : undefined;
  return [title, subtitle];
}

export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function toSentenceCase(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/, (char) => char.toUpperCase())
    .replace(/([a-z])([A-Z])/g, (_match, p1, p2) => p1 + ' ' + p2.toLowerCase());
}

export function joinOxfordComma(strs: string[]): string {
  if (strs.length === 0) {
    return '';
  } else if (strs.length === 1) {
    return strs[0];
  } else if (strs.length === 2) {
    return strs[0] + ' and ' + strs[1];
  }
  return strs.slice(0, strs.length - 1).join(', ') + ', and ' + strs[strs.length - 1];
}

/**
 * Normalize a string by removing accent marks (diacritics) for accent-insensitive comparison.
 * Uses NFD normalization followed by removal of combining diacritical marks.
 */
export function normalizeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Base normalization for accent/case-insensitive comparisons
export function normalizeBase(value?: string): string {
  return value ? normalizeAccents(value).trim().toLowerCase() : '';
}

/**
 * Split the input string on non-alphanumeric characters and see if any word matches the inputted query.
 * Splits on characters that are neither letters (\p{L}) nor numbers (\p{N}), so alphanumeric codes
 * Sometimes inputted queries may contain whitespace -- for that cause we check if the general
 * input also matches.
 * Both the string and query are normalized to be accent-insensitive and case-insensitive.
 */
export function anyWordStartsWith(str: string, query: string) {
  const normalizedStr = normalizeAccents(str.toLowerCase());
  const normalizedQuery = normalizeAccents(query.toLowerCase());
  return (
    normalizedStr.split(/[^\p{L}\p{N}]/u).some((s) => s.startsWith(normalizedQuery)) ||
    normalizedStr.startsWith(normalizedQuery)
  );
}

/**
 * Converts an alphabetical string to a number so we can compute value on a continuous scale.
 *
 * Reduces the input string into base ASCII and converts non ascii-able characters to spaces.
 * So "Q'eqchí" becomes "q eqchi".
 *
 * Now we can convert this to a base 27 number, where 'a' = 1, 'b' = 2, ..., 'z' = 26, and ' ' = 0.
 * The first 5 characters are the integer part and the rest are the decimal part.
 * So a name like "abcdefgh" becomes: "12345.678" in base 27.
 *
 * So "q eqchi" becomes:
 *    17 * 27^5 +
 *     0 * 27^4 +
 *     5 * 27^3 +
 *    17 * 27^2 +
 *     3 * 27^1 +
 *     8 * 27^0 +
 *     9 * 27^-1
 *  = 9038604.308641976...
 */
export function convertAlphaToNumber(value: string): number {
  // Remove accent marks and diacritics, and convert to lowercase
  // TODO transliterate non-Latin characters
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, ' ');

  let num = 0;
  for (let i = 0; i < normalized.length; i++) {
    if (normalized.charCodeAt(i) === 32) continue; // skip spaces
    num += (normalized.charCodeAt(i) - 97 + 1) * Math.pow(27, 4 - i);
  }
  return num;
}
