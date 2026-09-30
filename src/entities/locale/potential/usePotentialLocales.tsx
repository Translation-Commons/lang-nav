import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import usePageParams from '@features/params/usePageParams';
import useAllFilters from '@features/transforms/filtering/useAllFilters';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { isTerritoryGroup, TerritoryCode } from '@entities/territory/TerritoryTypes';
import { EntityType } from '@entities/types/EntityTypes';

import {
  LocaleData,
  LocaleSource,
  PopulationSourceCategory,
  StandardLocaleCode,
} from '../LocaleTypes';

import PotentialLocalesTab from './PotentialLocalesTab';

type PartitionedLocales = Record<PotentialLocalesTab, LocaleData[]>;

function usePotentialLocales(
  isPercentEnough: (
    percInCountry: number | undefined,
    percOfLangWorldWide: number | undefined,
  ) => boolean,
): PartitionedLocales {
  const filter = useAllFilters();

  // const filterByPopulation = useFilter
  const { censuses, getLanguage, getLocale, locales } = useDataContext();
  const { localeSeparator } = usePageParams();

  // Iterate through all censuses and find locales that are not listed
  const allMissingLocales = useMemo(
    () =>
      Object.values(censuses).reduce<Record<StandardLocaleCode, LocaleData>>((missing, census) => {
        Object.entries(census.languageEstimates ?? {})?.forEach(([langID, populationEstimate]) => {
          const localeID = langID + '_' + census.isoRegionCode;
          const lang = getLanguage(langID);
          if (getLocale(localeID) || lang == null) {
            return; // Locale already exists or language is missing, skip
          }
          const populationPercentInCountry = (populationEstimate * 100) / census.population;
          const populationPercentOfLanguageWorldwide =
            (populationEstimate * 100) / (lang.pop.overall ?? 1);
          if (!isPercentEnough(populationPercentInCountry, populationPercentOfLanguageWorldwide)) {
            return; // Skip if the population percentage is below the threshold
          }
          const populationAdjusted = Math.round(
            (populationPercentInCountry / 100.0) * (census.territory?.pop.overall || 1),
          );

          if (missing[localeID] == null) {
            missing[localeID] = {
              localeSource: LocaleSource.Census,
              type: EntityType.Locale,
              ID: langID + '_' + census.isoRegionCode,
              codeDisplay: lang.codeDisplay + localeSeparator + census.isoRegionCode,
              languageCode: langID,
              language: lang,
              nameDisplay: lang.nameDisplay,
              names: lang.names,

              territory: census.territory,
              territoryCode: census.isoRegionCode,

              pop: {
                speaking: {
                  adjusted: populationAdjusted,
                  unadjusted: populationEstimate,
                  percent: populationPercentInCountry,
                  percentAdjusted: populationPercentInCountry,
                  source: PopulationSourceCategory.Official,
                  census,
                },
                writing: {},
              },
              censusRecords: [
                { census, populationEstimate, populationPercent: populationPercentInCountry },
              ],
            };
          } else {
            if ((missing[localeID].pop.speaking.adjusted ?? 0) < populationAdjusted) {
              // If we already have a locale but the population estimate is higher, update it
              missing[localeID].pop.speaking.unadjusted = populationEstimate;
              missing[localeID].pop.speaking.percent = populationPercentInCountry;
              missing[localeID].pop.speaking.percentAdjusted = populationPercentInCountry;
              missing[localeID].pop.speaking.adjusted = populationAdjusted;
              missing[localeID].pop.speaking.source = PopulationSourceCategory.Official;
              missing[localeID].pop.speaking.census = census;
            }
            if (missing[localeID].censusRecords == null) missing[localeID].censusRecords = [];
            missing[localeID].censusRecords.push({
              census,
              populationEstimate,
              populationPercent: populationPercentInCountry,
            });
          }
        });
        return missing;
      }, {}),
    [censuses, localeSeparator, isPercentEnough, getLanguage, getLocale],
  );

  // Group all locales (actual & missing) by language
  const allLocalesByLanguage = useMemo(() => {
    return [...locales, ...Object.values(allMissingLocales)].reduce<
      Record<LanguageCode, LocaleData[]>
    >((byLanguage, locale) => {
      const territoryScope = locale.territory?.scope;
      if (isTerritoryGroup(territoryScope)) {
        return byLanguage; // Skip regional locales, censuses are not at the regional level
      }

      const langCode = locale.languageCode;
      if (!byLanguage[langCode]) {
        byLanguage[langCode] = [];
      }
      byLanguage[langCode].push(locale);
      return byLanguage;
    }, {});
  }, [allMissingLocales]);

  const localesMissingOriginalPopData = useMemo(
    () =>
      locales.filter(
        (locale) => (locale.pop.rough ?? 0) <= 10 && (locale.pop.speaking.unadjusted ?? 0) > 10,
      ),
    [locales],
  );

  const partitionedLocales = useMemo(() => {
    // Get the first 4 groups
    const allPartitionedLocales = Object.values(allLocalesByLanguage).reduce<PartitionedLocales>(
      partitionPotentialLocales,
      {
        [PotentialLocalesTab.Largest]: [],
        [PotentialLocalesTab.LargestLowCertainty]: [],
        [PotentialLocalesTab.Significant]: [],
        [PotentialLocalesTab.SignificantLowCertainty]: [],
        [PotentialLocalesTab.MissingOriginalPopData]: [],
      },
    );

    // Add in the extra table
    allPartitionedLocales[PotentialLocalesTab.MissingOriginalPopData] =
      localesMissingOriginalPopData;

    // Apply connections filters
    Object.entries(allPartitionedLocales).forEach(([tab, locales]) => {
      allPartitionedLocales[tab as PotentialLocalesTab] = locales.filter(filter);
    });

    return allPartitionedLocales;
  }, [allLocalesByLanguage, localesMissingOriginalPopData, filter]);

  return {
    ...partitionedLocales,
  };
}

function partitionPotentialLocales(
  partitionedLocales: PartitionedLocales,
  localesOfTheSameLanguage: LocaleData[],
): PartitionedLocales {
  // Iterate through the languages, finding the locale with the largest population.
  // These are probably but not necessarily indigenous.
  const localesSorted = localesOfTheSameLanguage.sort(sortByPopulation);
  const largestLocale = localesSorted.reduce(
    (max, locale) =>
      (locale.pop.speaking.adjusted ?? 0) > (max.pop.speaking.adjusted ?? 0) ? locale : max,
    localesSorted[0],
  );
  // If the largest locale is from the census data (not in the regular input list) then suggest it as a locale here
  if (largestLocale.localeSource === 'census') {
    // Some censuses include language families -- that's nice complementary data but its usually not a priority
    const descendantLocaleInTerritory = largestLocale.language
      ? findExtantLocaleInTerritoryDescendingFromLanguage(
          // start with the language of the locale to find alt codes eg. nan -> nan_Hant
          // Then it will search child languages and dialects
          [largestLocale.language],
          largestLocale.territoryCode,
        )
      : null;
    if (!descendantLocaleInTerritory) {
      largestLocale.relatedLocales = { childLanguages: [localesSorted[1]] };
      partitionedLocales[PotentialLocalesTab.Largest].push(largestLocale);
    } else {
      largestLocale.relatedLocales = { childLanguages: [descendantLocaleInTerritory] };
      partitionedLocales[PotentialLocalesTab.LargestLowCertainty].push(largestLocale);
    }
  }

  // Go through the other locales that are not the largest but come from census sources and add them to the other category.
  localesOfTheSameLanguage
    .filter((locale) => locale !== largestLocale && locale.localeSource === 'census')
    .forEach((locale) => {
      const descendantLocaleInTerritory = locale.language
        ? findExtantLocaleInTerritoryDescendingFromLanguage(
            // start with the language of the locale to find alt codes eg. nan -> nan_Hant
            // Then it will search child languages and dialects
            [locale.language],
            locale.territoryCode,
          )
        : null;
      if (!descendantLocaleInTerritory) {
        locale.relatedLocales = { childLanguages: [localesSorted[0]] };
        partitionedLocales[PotentialLocalesTab.Significant].push(locale);
      } else {
        locale.relatedLocales = { childLanguages: [descendantLocaleInTerritory] };
        partitionedLocales[PotentialLocalesTab.SignificantLowCertainty].push(locale);
      }
    });

  return partitionedLocales;
}

function findExtantLocaleInTerritoryDescendingFromLanguage(
  languages?: LanguageData[],
  territoryCode?: TerritoryCode,
): LocaleData | null {
  const directDescendant = findLocaleWithSameTerritory(languages, territoryCode);
  const recursiveDescendants =
    languages?.map((lang) =>
      findExtantLocaleInTerritoryDescendingFromLanguage(lang.childLanguages, territoryCode),
    ) ?? [];
  return (
    // Sort to pick the most populous locale
    [directDescendant, ...recursiveDescendants]
      .filter((a) => a != null)
      .sort(sortByPopulation)[0] ?? null
  );
}

function findLocaleWithSameTerritory(
  languages?: LanguageData[],
  territoryCode?: TerritoryCode,
): LocaleData | null {
  return (
    languages
      ?.map((lang) => lang.locales.filter((loc) => loc.territoryCode === territoryCode)[0] ?? null)
      .filter(Boolean)[0] ?? null
  );
}

export default usePotentialLocales;
