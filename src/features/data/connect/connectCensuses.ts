import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';
import { LanguageData } from '@entities/language/LanguageTypes';
import { setLanguageNames } from '@entities/language/setLanguageNames';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { CensusImport } from '../load/extra_entities/loadCensusData';

const DEBUG = false;

export function addCensusData(
  getLanguage: (id: string) => LanguageData | undefined,
  getLocale: (id: string) => LocaleData | undefined,
  getTerritory: (id: string) => TerritoryData | undefined,
  censuses: Record<string, CensusData>,
  censusImport: CensusImport,
  organizations: OrganizationData[],
): void {
  // Report warnings to the console
  censusImport.warnings.forEach((warning) => {
    console.error(warning);
  });

  // Add new languages names to improve search results
  addNewLanguageNames(getLanguage, censusImport);

  // Add the census records to the core data
  censusImport.censuses.forEach((census) => {
    // Add the census to the core data if its not there yet
    if (censuses[census.ID] != null) return; // It's reloaded twice on dev mode, skip if it already exists
    censuses[census.ID] = census;

    // Add the territory reference to it
    const territory = getTerritory(census.isoRegionCode);
    if (territory != null && territory.type === ObjectType.Territory) {
      census.territory = territory;
      if (territory.censuses == null) territory.censuses = [];
      territory.censuses.push(census);
    }

    // Add organization
    addCensusToOrganizations(organizations, census);

    // Create references to census from the locale data
    addCensusRecordsToLocales(getLocale, census);
  });
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
          (populationEstimate * 100.0) /
          (census.populationWithPositiveResponses || census.population),
      });
    } else {
      // TODO: show warning in the "Reports" tool
    }
  });
}

function addCensusToOrganizations(organizations: OrganizationData[], census: CensusData): void {
  const codeDisplay = census.collectorNameShort ?? census.collectorName;
  const collectorOrg = organizations.find((org) => org.codeDisplay === codeDisplay);
  if (collectorOrg) {
    if (collectorOrg.censuses?.find((doc) => doc.ID === census.ID) == null) {
      // Avoid pushing the same census twice since it's reloaded twice in dev mode
      collectorOrg.censuses?.push(census);
      census.collector = collectorOrg;
    }
  } else if (codeDisplay) {
    organizations.push({
      type: ObjectType.Org,
      ID: `org.${codeDisplay}`,
      codeDisplay: codeDisplay!,
      nameDisplay: census.collectorName ?? codeDisplay!,
      url: census.presentedBy == null ? census.url.replace(/(\.[a-z]+\/).*/, '$1') : undefined,
      censuses: [census],
      names: [census.collectorNameShort, census.collectorName].filter((n) => n != null),
      headquarters: census.territory,
    });
  }

  // If the data was presented by a different organization than the collector, add that one too
  const presentedByOrg = organizations.find((org) => org.codeDisplay === census.presentedBy);
  if (!census.presentedBy) {
    // Do nothing
  } else if (presentedByOrg == null) {
    const codeDisplay = census.presentedBy;
    organizations.push({
      type: ObjectType.Org,
      ID: `org.${census.presentedBy}`,
      codeDisplay,
      nameDisplay: census.presentedBy,
      url: census.url.replace(/(\.[a-z]+\/).*/, '$1'),
      censuses: [census],
      names: [census.presentedBy],
    });
  } else {
    if (presentedByOrg.censuses?.find((doc) => doc.ID === census.ID) == null) {
      presentedByOrg.censuses?.push(census);
      census.presenter = presentedByOrg;
    }
  }
}
