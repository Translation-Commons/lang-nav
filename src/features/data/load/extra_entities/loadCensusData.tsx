import { CensusData } from '@entities/census/CensusTypes';
import { parseCensusLanguageRow } from '@entities/census/parseCensusLanguageRow';
import { parseCensusMetadata } from '@entities/census/parseCensusMetadata';
import { LanguageCode } from '@entities/language/LanguageTypes';

import { isApiEnabled } from '../api/apiConfig';
import { loadCensusFromApi } from '../api/loadCensusFromApi';

export async function getCensusFilepaths(directory: string): Promise<string[]> {
  // Load census filenames from the text file
  return await fetch(`${directory}/censusList.txt`)
    .then((res) => res.text())
    .then((text) => text.split('\n'))
    .then((lines) => lines.map((line) => line.trim()).filter((line) => line !== ''))
    .then((lines) => lines.map((line) => `${directory}/${line}.tsv`));
}

export async function loadCensusData(): Promise<(CensusImport | void)[]> {
  // With VITE_API_URL set, ONE request replaces the four censusList.txt
  // manifests and the 169 files they name - the largest reduction in the
  // migration. The API returns a single CensusImport rather than one per file,
  // which is invisible to the caller: SupplementalData already loops over the
  // array and addCensusData's effects accumulate across the calls.
  //
  // parseCensusImport below is deliberately NOT deleted along with the fetches.
  // ReportCensusInputTool parses user-pasted TSV with it, which is not a
  // network path and has to keep working whichever way the app is configured.
  if (isApiEnabled()) {
    const fromApi = await loadCensusFromApi();
    // loadCensusFromApi resolves to [] on any failure rather than rejecting -
    // see its own comment - so a genuine "the API returned zero censuses" and
    // "the API call failed" look the same here. Falling back to the 169 files
    // whenever the array is empty is the same call the other loaders make: it
    // costs nothing when the API is healthy (600+ censuses, never empty) and
    // recovers the data instead of leaving the app on CoreData's blocking
    // "Error loading data" alert when it is not.
    if (fromApi.length > 0) {
      return fromApi;
    }
    console.warn('Census API load failed; falling back to TSV files.');
  }

  // Load census filenames from the text file
  const FILEPATHS = await Promise.all([
    getCensusFilepaths('data/census/official'),
    getCensusFilepaths('data/census/data.un.org'),
    getCensusFilepaths('data/census/unofficial'),
    getCensusFilepaths('data/census/axl'),
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

  // Process the remaining lines as language data, adding language names and population estimates to the censuses
  const languageNames: Record<LanguageCode, string> = {};
  lines
    .splice(endOfMetadataLine)
    .forEach((line) => parseCensusLanguageRow(line, languageNames, censuses, tsvColumnsWithData));

  return {
    censuses,
    languageNames,
    warnings,
  };
}
