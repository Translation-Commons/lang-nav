import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';
import { LanguageData } from '@entities/language/LanguageTypes';
import { setLanguageNames } from '@entities/language/setLanguageNames';
import { LocaleData, TerritoryData } from '@entities/types/DataTypes';

import { CensusImport } from '../load/extra_entities/loadCensusData';

const DEBUG = false;

export function addCensusData(
  getLanguage: (id: string) => LanguageData | undefined,
  getLocale: (id: string) => LocaleData | undefined,
  getTerritory: (id: string) => TerritoryData | undefined,
  censuses: Record<string, CensusData>,
  censusImport: CensusImport,
): void {
  addNewLanguageNames(getLanguage, censusImport);

  // Add the census records to the core data
  for (const census of censusImport.censuses) {
    // Add the census to the core data if its not there yet
    if (censuses[census.ID] == null) {
      censuses[census.ID] = census;

      // Add the territory reference to it
      const territory = getTerritory(census.isoRegionCode);
      if (territory != null && territory.type === ObjectType.Territory) {
        census.territory = territory;
        if (territory.censuses == null) territory.censuses = [];
        territory.censuses.push(census);
      }

      // Create references to census from the locale data
      addCensusRecordsToLocales(getLocale, census);
    } else {
      // It's reloaded twice on dev mode
      // console.warn(`Census data for ${census.ID} already exists, skipping.`);
    }
  }
}

function addNewLanguageNames(
  getLanguage: (id: string) => LanguageData | undefined,
  censusImport: CensusImport,
): void {
  // Add alternative language names to the language data
  Object.entries(censusImport.languageNames).forEach(([languageCode, languageName]) => {
    // Assuming languageCode is using the canonical ID (eg. eng not en or stan1293)
    const language = getLanguage(languageCode);
    if (language != null) {
      // Split on / since some censuses have multiple names for the same language
      const newNames = languageName
        .split('/')
        .map((name) => name.trim())
        .filter((name) => !language.names.includes(name));
      setLanguageNames(language, newNames);
    } else if (DEBUG) {
      // TODO: show warning in the "Notices" tool
      // TODO: support "languages" that are actually locale tags eg. bhum1234-u-sd-inod
      console.warn(
        `Language ${languageName} [${languageCode}] not found for census data: ${censusImport.censuses[0].ID}`,
      );
    }
  });
}

function addCensusRecordsToLocales(
  getLocale: (id: string) => LocaleData | undefined,
  census: CensusData,
): void {
  Object.entries(census.languageEstimates).forEach(([languageCode, populationEstimate]) => {
    // Assuming languageCode is using the canonical ID (eg. eng not en or stan1293)
    const locale = getLocale(languageCode + '_' + census.isoRegionCode);
    if (locale?.type === ObjectType.Locale) {
      // Add the census to the locale
      if (locale.censusRecords == null) locale.censusRecords = [];
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
