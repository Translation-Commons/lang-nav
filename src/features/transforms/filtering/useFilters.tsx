import usePageParams from '@features/params/usePageParams';

import Field from '../fields/Field';
import getSubstringFilterOnQuery from '../search/getSubstringFilterOnQuery';

import { FilterFunctionType } from './filter';
import {
  buildFilterByLanguage,
  buildFilterByTerritory,
  buildFilterByWritingSystem,
} from './filterByConnections';
import {
  buildFilterByISOStatus,
  buildFilterByLanguageScope,
  buildFilterByModality,
  buildFilterByTerritoryScope,
  buildFilterByVitalityEthnologueCoarse,
  buildFilterByVitalityEthnologueFine,
} from './filterByEnum';

/**
 * Common hook to get filter functions based on page params.
 *
 * Note this does not explicitly memoize the functions but react should be
 * automatically handle that. Explicit memoization caused callstack issues.
 */
function useFilters(): Record<Field, FilterFunctionType> {
  const {
    isoStatus,
    languageFilter,
    languageScopes,
    modalityFilter,
    searchBy,
    searchString,
    territoryFilter,
    territoryScopes,
    vitalityEthCoarse,
    vitalityEthFine,
    writingSystemFilter,
  } = usePageParams();

  const filterByName = getSubstringFilterOnQuery(searchString, searchBy);
  const filterByLanguageScope = buildFilterByLanguageScope(languageScopes);
  const filterByTerritoryScope = buildFilterByTerritoryScope(territoryScopes);
  const filterByModality = buildFilterByModality(modalityFilter);
  const filterByTerritory = buildFilterByTerritory(territoryFilter);
  const filterByLanguage = buildFilterByLanguage(languageFilter);
  const filterByWritingSystem = buildFilterByWritingSystem(writingSystemFilter);

  // Vitality
  const filterByISOStatus = buildFilterByISOStatus(isoStatus);
  const filterByVitalityEthnologueFine = buildFilterByVitalityEthnologueFine(vitalityEthFine);
  const filterByVitalityEthnologueCoarse = buildFilterByVitalityEthnologueCoarse(vitalityEthCoarse);

  const alwaysTrue = () => true;

  return {
    [Field.Name]: filterByName,

    [Field.LanguageScope]: filterByLanguageScope,
    [Field.TerritoryScope]: filterByTerritoryScope,
    [Field.Modality]: filterByModality,

    // Vitality
    [Field.ISOStatus]: filterByISOStatus,
    [Field.VitalityEthnologueCoarse]: filterByVitalityEthnologueCoarse,
    [Field.VitalityEthnologueFine]: filterByVitalityEthnologueFine,

    // Connections
    [Field.Language]: filterByLanguage,
    [Field.WritingSystem]: filterByWritingSystem,
    [Field.Territory]: filterByTerritory,

    // Filters not constructed
    [Field.None]: alwaysTrue,
    [Field.Code]: alwaysTrue,
    [Field.Endonym]: alwaysTrue,
    [Field.Population]: alwaysTrue,
    [Field.Latitude]: alwaysTrue,
    [Field.Longitude]: alwaysTrue,
    [Field.Area]: alwaysTrue,
    [Field.Date]: alwaysTrue,
    [Field.Depth]: alwaysTrue,
    [Field.Literacy]: alwaysTrue,
    [Field.VitalityMetascore]: alwaysTrue,
    [Field.CountOfLanguages]: alwaysTrue,
    [Field.CountOfWritingSystems]: alwaysTrue,
    [Field.CountOfChildTerritories]: alwaysTrue,
    [Field.CountOfCountries]: alwaysTrue,
    [Field.CountOfCensuses]: alwaysTrue,
    [Field.PopulationDirectlySourced]: alwaysTrue,
    [Field.PopulationOfDescendants]: alwaysTrue,
    [Field.PercentOfTerritoryPopulation]: alwaysTrue,
    [Field.PercentOfOverallLanguageSpeakers]: alwaysTrue,
    [Field.PopulationPercentInBiggestDescendantLanguage]: alwaysTrue,
    [Field.HistoricPresence]: alwaysTrue,
    [Field.LanguageFormedHere]: alwaysTrue,
  };
}

export default useFilters;
