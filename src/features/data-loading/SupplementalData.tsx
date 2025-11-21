import { addCensusData, loadCensusData } from './CensusData';
import { DataContextType } from './context/useDataContext';
import { computeLocalePopulationFromCensuses } from './population/computeLocalePopulationFromCensuses';
import { computeLocaleWritingPopulation } from './population/computeLocaleWritingPopulation';
import {
  computeContainedTerritoryStats,
  loadCountryCoordinates,
  loadLandArea,
  loadTerritoryGDPLiteracy,
} from './TerritoryData';
import { getLanguageCountsFromCLDR, loadCLDRCoverage } from './UnicodeData';
import { loadAndApplyWikipediaData } from './WikipediaData';

/**
 * Get more data that is not necessary for the initial page load
 */
export async function loadSupplementalData(dataContext: DataContextType): Promise<void> {
  if (dataContext.locales.length == 0) {
    return; // won't load anything while data is empty
  }

  // Load multiple supplemental data sources in parallel, these changes will modify objects
  // but they should not modify the same fields.
  await Promise.all([
    loadCLDRCoverage(dataContext.getCLDRLanguage),
    loadTerritoryGDPLiteracy(dataContext.getTerritory),
    loadCountryCoordinates(dataContext.getTerritory),
    loadAndApplyWikipediaData(dataContext),
    loadLandArea(dataContext.getTerritory),
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
    },
  );

  // 001 is the UN code for the World
  computeContainedTerritoryStats(dataContext.getTerritory('001'));
  computeLocalePopulationFromCensuses(dataContext.locales);
  computeLocaleWritingPopulation(dataContext.locales);
}
