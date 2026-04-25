import { CensusData } from '@entities/census/CensusTypes';
import { parseCensusLanguageRow } from '@entities/census/parseCensusLanguageRow';
import { parseCensusMetadata } from '@entities/census/parseCensusMetadata';
import { LanguageCode } from '@entities/language/LanguageTypes';

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
