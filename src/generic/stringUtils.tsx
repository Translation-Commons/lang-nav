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
  return str.replace(/\b\w/, (char) => char.toUpperCase());
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
 * Split the input string non-letter characters (\P{L}) and see if any word matches the inputted query.
 * Sometimes inputted queries may contain whitespace -- for that cause we check if the general
 * input also matches.
 */
export function anyWordStartsWith(str: string, lowercaseQuery: string) {
  const strLowercase = str.toLowerCase();
  return (
    strLowercase.split(/\P{L}/u).some((s) => s.startsWith(lowercaseQuery)) ||
    strLowercase.startsWith(lowercaseQuery)
  );
}
