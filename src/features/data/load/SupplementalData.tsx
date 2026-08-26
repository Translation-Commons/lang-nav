import computeLanguageFamiliesModality from '../compute/computeLanguageFamiliesModality';
import { computeLocalesPopulationFromCensuses } from '../compute/computeLocalesPopulationFromCensuses';
import { computeContainedTerritoryStats } from '../compute/computeTerritoryStats';
import { addCensusData } from '../connect/connectCensuses';
import { DataContextType } from '../context/useDataContext';

import { isApiEnabled } from './api/apiConfig';
import { loadCensusData } from './extra_entities/loadCensusData';
import { loadCountryCoordinates } from './supplemental/loadCountryCoordinates';
import { loadECRML } from './supplemental/loadECRML';
import { loadGoogleTranslate } from './supplemental/loadGoogleTranslate';
import { loadIndigeneity } from './supplemental/loadIndigeneity';
import { loadIos } from './supplemental/loadIos';
import { loadLandArea } from './supplemental/loadLandArea';
import { loadLangTags } from './supplemental/loadLangTags';
import { loadLanguageNamesFrench } from './supplemental/loadLanguageNamesFrench';
import { loadMacos } from './supplemental/loadMacos';
import { loadTerritoryGDPLiteracy } from './supplemental/loadTerritoryGDPLiteracy';
import { loadTerritoryNames } from './supplemental/loadTerritoryNames';
import { loadUDHR } from './supplemental/loadUDHR';
import { loadVariantAnnotations } from './supplemental/loadVariantAnnotations';
import { loadWin11LanguagePacks } from './supplemental/loadWin11LanguagePacks';
import { getLanguageCountsFromCLDR, loadCLDRCoverage } from './supplemental/UnicodeData';
import { loadAndApplyWikipediaData } from './supplemental/WikipediaData';

/**
 * Get more data that is not necessary for the initial page load
 */
export async function loadSupplementalData(dataContext: DataContextType): Promise<void> {
  if (dataContext.locales.length == 0) {
    return; // won't load anything while data is empty
  }

  // These four fill territory fields that the ETL already merged into the
  // `territory` table, so loadTerritories() has them when it reads from the
  // API. Running them anyway would refetch four files to write values that are
  // already there. Skipping them is where Phase 1's "5 requests become 1" is
  // actually banked; the branch in loadTerritories only changes where the first
  // one comes from.
  const territorySupplements = isApiEnabled()
    ? []
    : [
        loadTerritoryGDPLiteracy(dataContext.getTerritory),
        loadCountryCoordinates(dataContext.getTerritory),
        loadLandArea(dataContext.getTerritory),
        loadTerritoryNames(dataContext.getTerritory),
      ];

  // Load multiple supplemental data sources in parallel, these changes will modify entities
  // but they should not modify the same fields.
  await Promise.all([
    ...territorySupplements,
    loadCLDRCoverage(dataContext.getCLDRLanguage),
    loadAndApplyWikipediaData(dataContext),
    loadLanguageNamesFrench(dataContext.getLanguage),
    loadIndigeneity(dataContext.getLanguage),
    loadECRML(dataContext.getLanguage),
    loadGoogleTranslate(dataContext.getLanguage),
    loadIos(dataContext.getLanguage),
    loadMacos(dataContext.getLanguage),
    loadUDHR(dataContext.getLanguage),
    loadVariantAnnotations(dataContext.getVariant, dataContext.getLanguage),
    loadWin11LanguagePacks(dataContext.getLanguage),
    loadLangTags(dataContext.getLanguage),
  ]);

  const censusImports = await loadCensusData();
  censusImports.forEach((censusImport) => {
    if (censusImport != null) {
      addCensusData(
        dataContext.getLanguage,
        dataContext.getLocale,
        dataContext.getTerritory,
        dataContext.censuses,
        censusImport,
        dataContext.organizations,
      );
    }
  });
  const cldrCensuses = getLanguageCountsFromCLDR(dataContext);
  addCensusData(
    dataContext.getLanguage,
    dataContext.getLocale,
    dataContext.getTerritory,
    dataContext.censuses,
    {
      censuses: cldrCensuses,
      languageNames: {},
      warnings: [],
    },
    dataContext.organizations,
  );

  // After loading all supplemental data, recompute derived stats
  // 001 is the UN code for the World
  computeContainedTerritoryStats(dataContext.getTerritory('001'));
  computeLocalesPopulationFromCensuses(dataContext.locales);
  // Some more population computations moved to updatePopulations
  computeLanguageFamiliesModality(dataContext.languagesInSelectedSource);
}
