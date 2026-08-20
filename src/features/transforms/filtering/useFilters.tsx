import { useMemo } from 'react';

import usePageParams from '@features/params/usePageParams';

import Field from '../fields/Field';
import getSubstringFilterOnQuery from '../search/getSubstringFilterOnQuery';

import { FilterFunctionType } from './filter';
import {
  buildFilterByLanguage,
  buildFilterByLanguageFamily,
  buildFilterByTerritory,
  buildFilterByWritingSystem,
} from './filterByConnections';
import {
  buildFilterByISOStatus,
  buildFilterByLanguageScope,
  buildFilterByLanguageSource,
  buildFilterByModality,
  buildFilterByTerritoryScope,
} from './filterByEnum';
import { buildFilterByPopulation } from './filterByRange';

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
    languageFamilyFilter,
    languageScopes,
    languageSource,
    modalityFilter,
    populationMax,
    populationMin,
    searchBy,
    searchString,
    territoryFilter,
    territoryScopes,
    writingSystemFilter,
  } = usePageParams();

  const filterByName = useMemo(
    () => getSubstringFilterOnQuery(searchString, searchBy),
    [searchString, searchBy],
  );
  const filterByLanguageScope = useMemo(
    () => buildFilterByLanguageScope(languageScopes),
    [languageScopes],
  );
  const filterByTerritoryScope = useMemo(
    () => buildFilterByTerritoryScope(territoryScopes),
    [territoryScopes],
  );
  const filterByModality = useMemo(() => buildFilterByModality(modalityFilter), [modalityFilter]);
  const filterByTerritory = useMemo(
    () => buildFilterByTerritory(territoryFilter),
    [territoryFilter],
  );
  const filterByLanguage = useMemo(() => buildFilterByLanguage(languageFilter), [languageFilter]);
  const filterByLanguageFamily = useMemo(
    () => buildFilterByLanguageFamily(languageFamilyFilter),
    [languageFamilyFilter],
  );
  const filterByWritingSystem = useMemo(
    () => buildFilterByWritingSystem(writingSystemFilter),
    [writingSystemFilter],
  );
  const filterByLanguageSource = useMemo(
    () => buildFilterByLanguageSource(languageSource),
    [languageSource],
  );

  // Vitality
  const filterByISOStatus = useMemo(() => buildFilterByISOStatus(isoStatus), [isoStatus]);

  // Population
  const filterByPopulation = useMemo(
    () => buildFilterByPopulation(populationMin, populationMax),
    [populationMin, populationMax],
  );

  const alwaysTrue = () => true;

  const filters: Record<Field, FilterFunctionType> = useMemo(
    () => ({
      [Field.Name]: filterByName,

      [Field.LanguageScope]: filterByLanguageScope,
      [Field.TerritoryScope]: filterByTerritoryScope,
      [Field.Modality]: filterByModality,

      // Vitality
      [Field.ISOStatus]: filterByISOStatus,
      [Field.VitalityEthnologueCoarse]: alwaysTrue,
      [Field.VitalityEthnologueFine]: alwaysTrue,

      // Connections
      [Field.Language]: filterByLanguage,
      [Field.LanguageFamily]: filterByLanguageFamily,
      [Field.WritingSystem]: filterByWritingSystem,
      [Field.Territory]: filterByTerritory,
      [Field.SourceForLanguage]: filterByLanguageSource,

      // Ranges
      [Field.Population]: filterByPopulation,

      // Filters not yet constructed
      [Field.Region]: alwaysTrue, // TODO
      [Field.Platform]: alwaysTrue, // TODO
      [Field.OutputScript]: alwaysTrue, // TODO
      [Field.Variant]: alwaysTrue, // TODO
      [Field.SourceForPopulation]: alwaysTrue, // TODO

      [Field.None]: alwaysTrue,
      [Field.Code]: alwaysTrue,
      [Field.Endonym]: alwaysTrue,
      [Field.Description]: alwaysTrue,
      [Field.Example]: alwaysTrue,
      [Field.UnicodeVersion]: alwaysTrue,
      [Field.CLDRCoverage]: alwaysTrue,
      [Field.DigitalSupport]: alwaysTrue,
      [Field.SourceType]: alwaysTrue,
      [Field.WritingSystemScope]: alwaysTrue,
      [Field.VariantType]: alwaysTrue,
      [Field.VitalityMetascore]: alwaysTrue,
      [Field.HistoricPresence]: alwaysTrue,
      [Field.LanguageFormedHere]: alwaysTrue,
      [Field.Indigeneity]: alwaysTrue,
      [Field.GovernmentStatus]: alwaysTrue,
      [Field.ECRMLProtection]: alwaysTrue,

      [Field.CountOfLanguages]: alwaysTrue,
      [Field.CountOfKeyboards]: alwaysTrue,
      [Field.CountOfWritingSystems]: alwaysTrue,
      [Field.CountOfChildTerritories]: alwaysTrue,
      [Field.CountOfCountries]: alwaysTrue,
      [Field.CountOfCensuses]: alwaysTrue,
      [Field.CountOfVariants]: alwaysTrue,

      [Field.PopulationDirectlySourced]: alwaysTrue,
      [Field.PopulationSpeaking]: alwaysTrue,
      [Field.PopulationWriting]: alwaysTrue,
      [Field.PopulationOfDescendants]: alwaysTrue,
      [Field.PercentOfTerritoryPopulation]: alwaysTrue,
      [Field.PercentOfOverallLanguageSpeakers]: alwaysTrue,
      [Field.PopulationPercentInBiggestDescendantLanguage]: alwaysTrue,

      [Field.Coordinates]: alwaysTrue,
      [Field.Latitude]: alwaysTrue,
      [Field.Longitude]: alwaysTrue,
      [Field.Area]: alwaysTrue,
      [Field.Date]: alwaysTrue,
      [Field.Depth]: alwaysTrue,
      [Field.Literacy]: alwaysTrue,
    }),
    [
      filterByName,
      filterByLanguageScope,
      filterByTerritoryScope,
      filterByModality,
      filterByTerritory,
      filterByLanguage,
      filterByLanguageFamily,
      filterByWritingSystem,
      filterByLanguageSource,
      filterByISOStatus,
      filterByPopulation,
    ],
  );

  return filters;
}

export default useFilters;
