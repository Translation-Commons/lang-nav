import { toTitleCase } from '../generic/stringUtils';
import { CensusCollectorType, CensusData } from '../types/CensusTypes';
import { LocaleData } from '../types/DataTypes';
import { LanguageCode, LanguageModality } from '../types/LanguageTypes';
import { ObjectType } from '../types/PageParamTypes';

import { DataContextType } from './DataContext';

const DEBUG = false;

export async function getCensusFilepaths(directory: string): Promise<string[]> {
  // Load census filenames from the text file
  return await fetch(`${directory}/censusList.txt`)
    .then((res) => res.text())
    .then((text) =>
      text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line != '')
        .map((line) => `${directory}/${line}.tsv`),
    );
}

export async function loadCensusData(): Promise<(CensusImport | void)[]> {
  // Load census filenames from the text file
  const CENSUS_FILEPATHS = await getCensusFilepaths('data/census');
  const UN_CENSUS_FILEPATHS = await getCensusFilepaths('data/census/data.un.org');

  return await Promise.all(
    [...CENSUS_FILEPATHS, ...UN_CENSUS_FILEPATHS].map(
      async (filePath) =>
        await fetch(filePath)
          .then((res) => res.text())
          .then((fileInput) => parseCensusImport(fileInput, filePath))
          .catch((err) => console.error('Error loading TSV:', err)),
    ),
  );
}

type CensusImport = {
  // Metadata about the data collection
  censuses: CensusData[];

  // Imported to add additional language names to the language data
  languageNames: Record<LanguageCode, string>;
};

function parseCensusImport(fileInput: string, filePath: string): CensusImport {
  const lines = fileInput.split('\n');
  const filename = filePath.match(/\/([^/]+)\.tsv$/)?.[1] || 'census';

  // Create an array based on the number of census columns
  // (number of censusNames, which is columns after the first two)
  // This will be used to initialize metadatas and other arrays
  const tsvColumnsWithData = lines[0]
    .split('\t')
    .slice(2) // Skip the first 2 columns since they are the metadata field names & the default values
    .map((col, tsvColumnNumber) => {
      // Drop columns which have a "#" in the codeDisplay -- that means they are provided for context
      // but LangNav doesn't have a good way to show it.
      if (col[0] === '#') return null;
      return tsvColumnNumber + 2; // +2 to account for the skipped columns
    })
    .filter((col) => col !== null);

  // Optional Column to indicate a language should also be counted for a macrolanguage
  // For example the row `chew1246` Chichewa should be also counted for `nya`
  const macrolanguageColumnNumber = lines[0]
    .split('\t')
    .findIndex((col) => col.toLowerCase() === '#macrolanguage');
  if (tsvColumnsWithData.length <= 0) {
    throw new Error('No census data found in the file.');
  }
  const censuses: CensusData[] = tsvColumnsWithData.map((_tsvColumnNumber, index) => ({
    type: ObjectType.Census,
    ID: filename + '.' + (index + 1),
    codeDisplay: filename + '.' + (index + 1), // May be overridden later

    // This will be set later -- its just initialized here because they are strictly required
    nameDisplay: '',
    names: [],
    isoRegionCode: '',
    languageCount: 0,
    yearCollected: 0,
    eligiblePopulation: 0,
    languageEstimates: {},
    collectorType: CensusCollectorType.Government,
  }));

  // Iterate through the rest of the lines to collect metadata until we hit the break line
  let lineNumber = 0;
  for (lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber];

    // If the line starts with a '#', it's metadata about the census
    if (line.startsWith('#')) {
      const parts = line.split('\t').map((part) => part.trim());
      const key = parts[0].slice(1) as keyof CensusData;
      const defaultValue = parts[1] || ''; // Default value is the second column, or empty if not provided
      const values = tsvColumnsWithData.map((col) => parts[col]); // Get the values from importable columns (ones without # prefix)

      if (values.length !== censuses.length) {
        console.error(
          `Census field ${key} has ${values.length + 1} columns but expected ${censuses.length + 1}. Check the file format for ${filename}.`,
        );
      }
      values.forEach((maybeValue, index) => {
        const value = maybeValue != '' ? maybeValue : defaultValue; // Use the default value if the cell is empty
        if (value == '') {
          return; // Skip empty values
        }
        if (key === 'datePublished' || key === 'dateAccessed') {
          censuses[index][key] = new Date(value);
        } else if (
          key === 'eligiblePopulation' ||
          key === 'yearCollected' ||
          key === 'respondingPopulation'
        ) {
          censuses[index][key] = Number.parseInt(value.replace(/,/g, ''));
        } else if (key === 'sampleRate') {
          censuses[index][key] = Number.parseFloat(value);
        } else if (key === 'collectorType') {
          censuses[index][key] = value as CensusCollectorType;
        } else if (key === 'modality') {
          censuses[index][key] = value as LanguageModality;
        } else if (
          key === 'languageCount' ||
          key === 'languageEstimates' ||
          key === 'type' ||
          key === 'territory' ||
          key === 'names'
        ) {
          // these keys should not be passed in here
        } else {
          // Regular strings, but only save if something is filled in
          censuses[index][key] = value;
        }
      });
    } else {
      // If the line does not start with a '#', it is part of the main data section
      // so end this loop and start processing the main data section
      break;
    }
  }

  // Set other fields required for objects and report an error if an important one is missing
  censuses.forEach((census) => {
    // Collect names for the census
    census.names = [census.nameDisplay, census.tableName, census.columnName].filter(
      (n) => n != null,
    );
    if (census.isoRegionCode === '') {
      console.error('Census data is missing isoRegionCode:', census);
    }
    if (census.yearCollected === 0) {
      console.error('Census data is missing yearCollected:', census);
    }
    if (census.eligiblePopulation === 0) {
      console.error('Census data is missing eligiblePopulation:', census);
    }
    if (census.nameDisplay === '') {
      console.error('Census data is missing nameDisplay:', census);
    }
  });

  // Process the remaining lines as language data
  const languageNames: Record<LanguageCode, string> = {};
  for (const line of lines.splice(lineNumber)) {
    const parts = line.split('\t');
    if (parts.length < 3) {
      continue; // Skip lines that do not have enough data
    }

    const languageCode = parts[0].trim() as LanguageCode;
    if (
      ['Language Code', 'mul', 'mis', 'und', 'zxx', ''].includes(languageCode) ||
      languageCode.startsWith('#')
    ) {
      // Skip header and special language codes
      // 'Language Code' is the header, 'mul' is for multiple languages, 'mis' is for missing languages,
      // 'und' is for undefined languages, and 'zxx' is for no linguistic content
      // '#' is for languages that are technically listed but the data shouldn't be used due to a quality issue
      continue;
    }

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

      // Accumulate language names if it appears in multiple places.
      if (languageNames[languageCode] != null) {
        languageNames[languageCode] = languageNames[languageCode] + ' / ' + languageName; // If the language code already exists, append the name
      } else {
        languageNames[languageCode] = languageName; // Otherwise, just set the name
      }
    }

    // Add population estimates to censuses when its non-empty
    tsvColumnsWithData.forEach((tsvColumnNumber, i) => {
      const part = parts[tsvColumnNumber];
      if (part.trim() === '') {
        return; // Skip empty parts
      }
      let popEstimate = Number.parseInt(part.replace(/,/g, ''));
      if (isNaN(popEstimate)) {
        // If the population estimate is not a number, set it to 1.
        // We set it to 1, not 0, because we want to show that there is a population registered and usually
        // non-numbers are values like "too small to disclose the exact amount" but still non-zero.
        popEstimate = 1;
      }

      // Add the population estimate to the specific language code
      if (censuses[i].languageEstimates[languageCode] != null) {
        // If the language estimate already exists, add the estimate
        censuses[i].languageEstimates[languageCode] += popEstimate;
      } else {
        censuses[i].languageEstimates[languageCode] = popEstimate;
        censuses[i].languageCount += 1; // Increment the language count for the census
      }

      // If there is a macrolanguage column and it has a value, also add the population to that macrolanguage
      if (macrolanguageColumnNumber !== -1) {
        const macroLangCode = parts[macrolanguageColumnNumber].trim() as LanguageCode;
        if (macroLangCode !== '') {
          if (censuses[i].languageEstimates[macroLangCode] != null) {
            censuses[i].languageEstimates[macroLangCode] += popEstimate;
          } else {
            censuses[i].languageEstimates[macroLangCode] = popEstimate;
            censuses[i].languageCount += 1; // Increment the language count for the census
          }
        }
      }
    });
  }

  return {
    censuses,
    languageNames,
  };
}

export function addCensusData(dataContext: DataContextType, censusData: CensusImport): void {
  // Add alternative language names to the language data
  Object.entries(censusData.languageNames).forEach(([languageCode, languageName]) => {
    // Assuming languageCode is using the canonical ID (eg. eng not en or stan1293)
    const language = dataContext.getLanguage(languageCode);
    if (language != null) {
      // Split on / since some censuses have multiple names for the same language
      languageName
        .split('/')
        .map((name) => name.trim())
        .filter((name) => !language.names.includes(name))
        .forEach((name) => language.names.push(name));
    } else if (DEBUG) {
      // TODO: show warning in the "Notices" tool
      // TODO: support "languages" that are actually locale tags eg. bhum1234-u-sd-inod
      console.warn(
        `Language ${languageName} [${languageCode}] not found for census data: ${censusData.censuses[0].ID}`,
      );
    }
  });

  // Add the census records to the core data
  for (const census of censusData.censuses) {
    // Add the census to the core data if its not there yet
    if (dataContext.censuses[census.ID] == null) {
      dataContext.censuses[census.ID] = census;

      // Add the territory reference to it
      const territory = dataContext.getTerritory(census.isoRegionCode);
      if (territory != null && territory.type === ObjectType.Territory) {
        census.territory = territory;
        territory.censuses.push(census);
      }

      // Create references to census from the locale data
      addCensusRecordsToLocales(dataContext.getLocale, census);
    } else {
      // It's reloaded twice on dev mode
      // console.warn(`Census data for ${census.ID} already exists, skipping.`);
    }
  }
}

export function addCensusRecordsToLocales(
  getLocale: (id: string) => LocaleData | undefined,
  census: CensusData,
): void {
  Object.entries(census.languageEstimates).forEach(([languageCode, populationEstimate]) => {
    // Assuming languageCode is using the canonical ID (eg. eng not en or stan1293)
    const locale = getLocale(languageCode + '_' + census.isoRegionCode);
    if (locale?.type === ObjectType.Locale) {
      // Add the census to the locale
      locale.censusRecords.push({
        census,
        populationEstimate,
        populationPercent:
          (populationEstimate * 100.0) / (census.respondingPopulation || census.eligiblePopulation),
      });
    } else {
      // TODO: show warning in the "Reports" tool
    }
  });
}
