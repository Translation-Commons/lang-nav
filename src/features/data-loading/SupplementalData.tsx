import { addCensusData, loadCensusData } from './CensusData';
import { DataContextType } from './DataContext';
import {
  computeLocalePopulationFromCensuses,
  computeLocaleWritingPopulation,
} from './PopulationData';
import { computeContainedTerritoryStats, loadTerritoryGDPLiteracy } from './TerritoryData';
import { getLanguageCountsFromCLDR, loadCLDRCoverage } from './UnicodeData';
import { loadAndApplyWikipediaData } from './WikipediaData';

/**
 * Get more data that is not necessary for the initial page load
 */
export async function loadSupplementalData(dataContext: DataContextType): Promise<void> {
  if (dataContext.locales.length == 0) {
    return; // won't load anything while data is empty
  }

  // TODO - this should be done in parallel so we cannot pass in things we are mutating
  await Promise.all([
    loadCLDRCoverage(dataContext.getLanguage),
    loadTerritoryGDPLiteracy(dataContext.getTerritory),
    loadAndApplyWikipediaData(dataContext),
  ]);

  const censusImports = await loadCensusData();
  censusImports.forEach((censusImport) => {
    if (censusImport != null) {
      addCensusData(dataContext, censusImport);
    }
  });
  const cldrCensuses = getLanguageCountsFromCLDR(dataContext);
  addCensusData(dataContext, { censuses: cldrCensuses, languageNames: {} });

  // 001 is the UN code for the World
  computeContainedTerritoryStats(dataContext.getTerritory('001'));
  computeLocalePopulationFromCensuses(dataContext);
  computeLocaleWritingPopulation(dataContext.locales);
}
