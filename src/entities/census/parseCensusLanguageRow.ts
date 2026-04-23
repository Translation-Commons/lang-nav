import { CensusData } from '@entities/census/CensusTypes';
import { LanguageCode } from '@entities/language/LanguageTypes';

import { toTitleCase } from '@shared/lib/stringUtils';

export function parseCensusLanguageRow(
  line: string,
  languageNames: Record<LanguageCode, string>,
  censuses: CensusData[],
  tsvColumnsWithData: number[],
) {
  const parts = line.split('\t');
  if (parts.length < 3) return; // Skip lines that do not have enough data

  // Most rows specific a single language code (eg. `eng`), but some specify multiple codes separated by a slash (eg. `hbs/srp`)
  const languageCodes = parts[0]
    // split if it is not contained in parentheses
    .split(/\/(?![^(]*\))/)
    .map((code) => code.trim())
    .filter((code) => code !== '');
  if (languageCodes.length === 0) return;

  // The language name is in the second column. We'll want to parse it to add it to the list of alternative language names
  const languageName = parseCensusLanguageName(parts[1].trim());

  // If there are multiple language codes, use the last one since that's usually the most specific
  const finalLanguageCode = languageCodes[languageCodes.length - 1] as LanguageCode;
  if (languageName && !isIgnoredLanguageCode(finalLanguageCode)) {
    if (languageNames[finalLanguageCode] != null) {
      languageNames[finalLanguageCode] = languageNames[finalLanguageCode] + ' / ' + languageName; // If the language code already exists, append the name
    } else {
      languageNames[finalLanguageCode] = languageName; // Otherwise, just set the name
    }
  }

  // Add population estimates to censuses
  tsvColumnsWithData.forEach((tsvColumnNumber, i) => {
    const part = parts[tsvColumnNumber];
    if (part.trim() === '') return; // Skip empty parts

    let popEstimate = Number.parseFloat(part.replace(/[,%]/g, ''));
    if (popEstimate > 0 && censuses[i].quantity === 'percent') {
      // If the quantity is percent, convert the percentage to an estimate based on the eligible population
      popEstimate = Math.round((popEstimate / 100) * censuses[i].population);
    }
    if (isNaN(popEstimate)) {
      // If the population estimate is not a number, set it to 1.
      // We set it to 1, not 0, because we want to show that there is a population registered and usually
      // non-numbers are values like "too small to disclose the exact amount" but still non-zero.
      popEstimate = 1;
    }
    if (popEstimate <= 0) {
      popEstimate = 1; // Treat non-positive estimates as 1 for the same reason
    }

    // Add the population estimate to the indicated language codes
    languageCodes.forEach((code) => {
      if (isIgnoredLanguageCode(code)) return;
      if (censuses[i].languageEstimates[code] != null) {
        // If the language estimate already exists, add the estimate
        censuses[i].languageEstimates[code] += popEstimate;
      } else {
        censuses[i].languageEstimates[code] = popEstimate;
        censuses[i].languageCount += 1; // Increment the language count for the census
      }
    });
  });
}

export function parseCensusLanguageName(languageName: string): string | undefined {
  if (languageName === '' || languageName.startsWith('#')) return undefined;

  // Leave out language names that start with a # -- that's a sign it may not be a good name to add
  // If it starts with a number, that may just be a row number, so clip that out
  const match = languageName.match(/^\d+(.*)/);
  if (match != null) {
    languageName = match[1].trim();
  }
  // If the whole name is all caps, convert it to title case, eg. "ENGLISH" -> "English"
  if (languageName === languageName.toUpperCase()) {
    languageName = toTitleCase(languageName);
  }
  return languageName;
}

// Skip header and special language codes
// 'Language Code' is the header, 'mul' is for multiple languages, 'mis' is for missing languages,
// 'und' is for undefined languages, and 'zxx' is for no linguistic content
// '#' is for languages that are technically listed but the data shouldn't be used due to a quality issue
export function isIgnoredLanguageCode(code: string): boolean {
  return (
    code.startsWith('#') ||
    ['language code', 'mul', 'mis', 'und', 'zxx', ''].includes(code.toLowerCase())
  );
}
