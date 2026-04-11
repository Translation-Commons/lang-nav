import { CensusData } from '@entities/census/CensusTypes';
import { parseCensusMetadata } from '@entities/census/parseCensusMetadata';
import { LanguageCode } from '@entities/language/LanguageTypes';

import { toTitleCase } from '@shared/lib/stringUtils';

export async function getCensusFilepaths(directory: string): Promise<string[]> {
  // Load census filenames from the text file
  return await fetch(`${directory}/censusList.txt`)
    .then((res) => res.text())
    .then((text) => text.split('\n'))
    .then((lines) => lines.map((line) => line.trim()).filter((line) => line !== ''))
    .then((lines) => lines.map((line) => `${directory}/${line}.tsv`));
}

export async function loadCensusData(): Promise<(CensusImport | void)[]> {
  // Load census filenames from the text file
  const FILEPATHS = await Promise.all([
    getCensusFilepaths('data/census/official'),
    getCensusFilepaths('data/census/data.un.org'),
    getCensusFilepaths('data/census/unofficial'),
  ]).then((arrays) => arrays.flat());

  return await Promise.all(
    FILEPATHS.map(
      async (filePath) =>
        await fetch(filePath)
          .then((res) => res.text())
          .then((fileInput) => parseCensusImport(fileInput, filePath))
          .catch((err) => console.error('Error loading TSV:', err)),
    ),
  );
}

export type CensusImport = {
  // Metadata about the data collection
  censuses: CensusData[];

  // Imported to add additional language names to the language data
  languageNames: Record<LanguageCode, string>;

  // Warnings about potential issues with the data
  warnings: string[];
};

export function parseCensusImport(fileInput: string, filePath: string): CensusImport {
  const lines = fileInput.split('\n');
  const { censuses, warnings, tsvColumnsWithData, endOfMetadataLine } = parseCensusMetadata(
    lines,
    filePath,
  );

  // Process the remaining lines as language data
  const languageNames: Record<LanguageCode, string> = {};
  for (const line of lines.splice(endOfMetadataLine)) {
    const parts = line.split('\t');
    if (parts.length < 3) continue; // Skip lines that do not have enough data

    // Most rows specific a single language code (eg. `eng`), but some specify multiple codes separated by a slash (eg. `hbs/srp`)
    const languageCodes = parts[0]
      // split if it is not contained in parentheses
      .split(/\/(?![^(]*\))/)
      .map((code) => code.trim())
      .filter((code) => !isIgnoredLanguageCode(code));
    if (languageCodes.length === 0) continue;

    // The language name is in the second column
    let languageName = parts[1].trim();
    if (languageName !== '' && !languageName.startsWith('#')) {
      // Leave out language names that start with a # -- that's a single it may not be a good name to add
      // If it starts with a number, that may just be a row number, so clip that out
      const match = languageName.match(/^\d+(.*)/);
      if (match != null) {
        languageName = match[1].trim();
      }
      // If the whole name is all caps, convert it to title case, eg. "ENGLISH" -> "English"
      if (languageName === languageName.toUpperCase()) {
        languageName = toTitleCase(languageName);
      }

      // Accumulate language names if it appears in multiple places
      // If there are multiple language codes, use the last one since that's usually the most specific
      const languageCode = languageCodes[languageCodes.length - 1] as LanguageCode;
      if (languageNames[languageCode] != null) {
        languageNames[languageCode] = languageNames[languageCode] + ' / ' + languageName; // If the language code already exists, append the name
      } else {
        languageNames[languageCode] = languageName; // Otherwise, just set the name
      }
    }

    // Add population estimates to censuses when its non-empty
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
        if (code === '') return;
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

  return {
    censuses,
    languageNames,
    warnings,
  };
}

// Skip header and special language codes
// 'Language Code' is the header, 'mul' is for multiple languages, 'mis' is for missing languages,
// 'und' is for undefined languages, and 'zxx' is for no linguistic content
// '#' is for languages that are technically listed but the data shouldn't be used due to a quality issue
function isIgnoredLanguageCode(code: string): boolean {
  return code.startsWith('#') || ['Language Code', 'mul', 'mis', 'und', 'zxx', ''].includes(code);
}
