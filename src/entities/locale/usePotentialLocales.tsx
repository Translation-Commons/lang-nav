import { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { isTerritoryGroup, TerritoryCode } from '@entities/territory/TerritoryTypes';

import {
  LocaleData,
  LocaleSource,
  PopulationSourceCategory,
  StandardLocaleCode,
} from './LocaleTypes';

type PartitionedLocales = {
  largest: LocaleData[];
  largestButDescendantExists: LocaleData[];
  significant: LocaleData[];
  significantButMaybeRedundant: LocaleData[];
};

function usePotentialLocales(
  isPercentEnough: (
    percInCountry: number | undefined,
    percOfLangWorldWide: number | undefined,
  ) => boolean,
): PartitionedLocales {
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
            (populationEstimate * 100) / (lang.populationEstimate ?? 1);
          if (!isPercentEnough(populationPercentInCountry, populationPercentOfLanguageWorldwide)) {
            return; // Skip if the population percentage is below the threshold
          }
          const populationAdjusted = Math.round(
            (populationPercentInCountry / 100.0) * (census.territory?.population || 1),
          );

          if (missing[localeID] == null) {
            missing[localeID] = {
              localeSource: LocaleSource.Census,
              type: ObjectType.Locale,
              ID: langID + '_' + census.isoRegionCode,
              codeDisplay: lang.codeDisplay + localeSeparator + census.isoRegionCode,
              languageCode: langID,
              language: lang,
              nameDisplay: lang.nameDisplay,
              names: lang.names,

              territory: census.territory,
              territoryCode: census.isoRegionCode,

              populationSource: PopulationSourceCategory.Official,
              populationAdjusted: populationAdjusted,
              populationSpeaking: populationEstimate,
              populationSpeakingPercent: populationPercentInCountry,
              populationCensus: census,
              censusRecords: [
                { census, populationEstimate, populationPercent: populationPercentInCountry },
              ],
            };
          } else {
            if ((missing[localeID].populationAdjusted ?? 0) < populationAdjusted) {
              // If we already have a locale but the population estimate is higher, update it
              missing[localeID].populationSpeaking = populationEstimate;
              missing[localeID].populationSpeakingPercent = populationPercentInCountry;
              missing[localeID].populationAdjusted = populationAdjusted;
              missing[localeID].populationCensus = census;
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

  return Object.values(allLocalesByLanguage).reduce<PartitionedLocales>(partitionPotentialLocales, {
    largest: [],
    largestButDescendantExists: [],
    significant: [],
    significantButMaybeRedundant: [],
  });
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
      (locale.populationAdjusted ?? 0) > (max.populationAdjusted ?? 0) ? locale : max,
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
      partitionedLocales.largest.push(largestLocale);
    } else {
      largestLocale.relatedLocales = { childLanguages: [descendantLocaleInTerritory] };
      partitionedLocales.largestButDescendantExists.push(largestLocale);
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
        partitionedLocales.significant.push(locale);
      } else {
        locale.relatedLocales = { childLanguages: [descendantLocaleInTerritory] };
        partitionedLocales.significantButMaybeRedundant.push(locale);
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
