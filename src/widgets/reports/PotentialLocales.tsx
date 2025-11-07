import { CopyIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { getScopeFilter } from '@features/filtering/filter';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { LocaleSeparator, ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { getSortFunction } from '@features/sorting/sort';
import { SortBy } from '@features/sorting/SortTypes';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableValueType from '@features/table/TableValueType';

import { CensusData } from '@entities/census/CensusTypes';
import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { usePotentialLocaleThreshold } from '@entities/locale/PotentialLocaleThreshold';
import {
  BCP47LocaleCode,
  isTerritoryGroup,
  LocaleData,
  LocaleSource,
  PopulationSourceCategory,
  TerritoryCode,
} from '@entities/types/DataTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';

type PartitionedLocales = {
  largest: LocaleData[];
  largestButDescendentExists: LocaleData[];
  significant: LocaleData[];
  significantButMaybeRedundant: LocaleData[];
};

const PotentialLocales: React.FC = () => {
  const { censuses, getLanguage, getLocale, locales } = useDataContext();
  const { localeSeparator } = usePageParams();
  const { percentThreshold, percentThresholdSelector } = usePotentialLocaleThreshold();
  const potentialLocales = getPotentialLocales(
    Object.values(censuses),
    getLanguage,
    getLocale,
    locales,
    localeSeparator,
    percentThreshold,
  );

  return (
    <div>
      <h1>Potential Locales</h1>
      <p>
        This page lists locales from Census data that are not in the list of defined locales. There
        are too many possible combinations of language + territory + variation information, so the
        number of actualized locales is smaller than the possible ones. However ones that appear
        here may be worth considering.
      </p>

      {percentThresholdSelector}

      <SubReport title="Largest Populations" locales={potentialLocales.largest}>
        Of all of the census records collected so far, these locales have more people speaking it
        than the other instantiated locales. This likely means the world population is indigenous to
        this country. However, since we do not have full census coverage it is very possible that
        the language is native to a different country without an inputted census record.
        Additionally, some of these locales are macrolanguages or constituents thereof, so we may
        actually have the language but represented by a different aspect.
      </SubReport>
      <SubReport
        title="Largest ** with caveats"
        locales={potentialLocales.largestButDescendentExists}
      >
        The locales represent the largest population of a language in a territory, but a language or
        dialect of that locale is already present for that locale, so it may not be necessary or it
        may be a language family not consistently listed in other censuses.
        <div style={{ height: '0.5em' }} />
        For example, the Canadian [CA] census includes Indo-European [ine] as an entry. Since few
        censuses include Indo-European, it looks as if ine_CA is native to Canada. That is a data
        coverage issue -- not a real origin for the language group. Indo-European contains other
        languages that are listed in other parts of the same census like Italian eng_CA.
      </SubReport>
      <SubReport title="Significant Population" locales={potentialLocales.significant}>
        This is the list of locales native to other countries, but with a significant population in
        other countries.
      </SubReport>
      <SubReport
        title="Significant ** with caveats"
        locales={potentialLocales.significantButMaybeRedundant}
      >
        Locales in this table reflect languages that already have other locales in territories but a
        consistent of the same language not necessarily the same locale. For example, they may have
        an entry with a writing system specified.
      </SubReport>
    </div>
  );
};

const SubReport: React.FC<{
  children: React.ReactNode;
  locales: LocaleData[];
  title: string;
}> = ({ title, children, locales }) => {
  const filterByScope = getScopeFilter();
  const sortFunction = getSortFunction();
  const { limit, page } = usePageParams();
  const exportLocales = locales
    .filter(filterByScope)
    .sort(sortFunction)
    .slice(limit * (page - 1), Math.min(limit * page, locales.length))
    .map(getLocaleExportString)
    .join('');

  return (
    <CollapsibleReport title={`${title} (${locales.filter(filterByScope).length})`}>
      {children}{' '}
      <button
        style={{ padding: '0.25em' }}
        onClick={() => {
          navigator.clipboard.writeText(exportLocales);
        }}
      >
        Copy visible locales to Clipboard
      </button>
      <PotentialLocalesTable locales={locales} />
    </CollapsibleReport>
  );
};

const PotentialLocalesTable: React.FC<{
  locales: LocaleData[];
  showRelatedLocales?: boolean;
}> = ({ locales }) => {
  return (
    <InteractiveObjectTable<LocaleData>
      objects={locales}
      columns={[
        {
          key: 'Potential Locale',
          render: (object) => <HoverableObjectName object={object} labelSource="code" />,
          sortParam: SortBy.Code,
        },
        {
          key: 'Language',
          render: (object) =>
            object.language ? (
              <HoverableObjectName object={object.language} />
            ) : (
              object.languageCode
            ),
          sortParam: SortBy.Name,
        },
        {
          key: 'Population',
          render: (object) => object.populationSpeaking,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Population,
        },
        {
          key: '% in Territory',
          render: (object) =>
            object.populationSpeakingPercent &&
            numberToFixedUnlessSmall(object.populationSpeakingPercent),
          valueType: TableValueType.Numeric,
          sortParam: SortBy.PercentOfTerritoryPopulation,
        },
        {
          key: '% of Global Language Speakers',
          render: (object) =>
            object.populationSpeaking &&
            numberToFixedUnlessSmall(
              (object.populationSpeaking * 100) / (object.language?.populationEstimate ?? 1),
            ),
          valueType: TableValueType.Numeric,
          sortParam: SortBy.PercentOfOverallLanguageSpeakers,
        },
        {
          key: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
        },
        {
          key: 'Related Locale',
          render: (object) => {
            const descendentLocale = object.containedLocales ? object.containedLocales[0] : null;
            return (
              descendentLocale && (
                <HoverableObjectName object={descendentLocale} labelSource="code" />
              )
            );
          },
        },
        {
          key: 'Copy',
          render: (object) => (
            <button
              style={{ padding: '0.25em' }}
              onClick={() => navigator.clipboard.writeText(getLocaleExportString(object))}
            >
              <CopyIcon size="1em" display="block" />
            </button>
          ),
        },
      ]}
    />
  );
};

function getLocaleExportString(locale: LocaleData): string {
  return `${locale.ID}\t${locale.nameDisplay} (${locale.territory?.nameDisplay})\t\t${locale.officialStatus ?? ''}\t${locale.populationSpeaking}\t\n`;
}

function getPotentialLocales(
  censuses: CensusData[],
  getLanguage: (code: string) => LanguageData | undefined,
  getLocale: (code: string) => LocaleData | undefined,
  locales: LocaleData[],
  localeSeparator: LocaleSeparator,
  percentThreshold: number,
): PartitionedLocales {
  // Iterate through all censuses and find locales that are not listed
  const allMissingLocales = useMemo(
    () =>
      censuses.reduce<Record<BCP47LocaleCode, LocaleData>>((missing, census) => {
        Object.entries(census.languageEstimates ?? {})?.forEach(([langID, populationEstimate]) => {
          const localeID = langID + '_' + census.isoRegionCode;
          const lang = getLanguage(langID);
          if (getLocale(localeID) || lang == null) {
            return; // Locale already exists or language is missing, skip
          }
          const populationPercent = (populationEstimate * 100) / census.eligiblePopulation;
          if (populationPercent < percentThreshold) {
            return; // Skip if the population percentage is below the threshold
          }

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
              populationAdjusted: populationEstimate,
              populationSpeaking: populationEstimate,
              populationSpeakingPercent: populationPercent,
              populationCensus: census,
              censusRecords: [{ census, populationEstimate, populationPercent }],
            };
          } else {
            if ((missing[localeID].populationSpeaking ?? 0) < populationEstimate) {
              // If we already have a locale but the population estimate is higher, update it
              missing[localeID].populationSpeaking = populationEstimate;
              missing[localeID].populationSpeakingPercent = populationPercent;
              missing[localeID].populationCensus = census;
            }
            if (missing[localeID].censusRecords == null) missing[localeID].censusRecords = [];
            missing[localeID].censusRecords.push({
              census,
              populationEstimate,
              populationPercent,
            });
          }
        });
        return missing;
      }, {}),
    [censuses, localeSeparator, percentThreshold, getLanguage, getLocale],
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
    largestButDescendentExists: [],
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
  const localesSorted = localesOfTheSameLanguage.sort((a, b) => {
    return (b.populationSpeaking ?? 0) - (a.populationSpeaking ?? 0);
  });
  const largestLocale = localesSorted.reduce((max, locale) => {
    return (locale.populationSpeaking ?? 0) > (max.populationSpeaking ?? 0) ? locale : max;
  }, localesSorted[0]);
  // If the largest locale is from the census data (not in the regular input list) then suggest it as a locale here
  if (largestLocale.localeSource === 'census') {
    // Some censuses include language families -- that's nice complementary data but its usually not a priority
    const descendentLocaleInTerritory = largestLocale.language
      ? findExtantLocaleInTerritoryDescendingFromLanguage(
          // start with the language of the locale to find alt codes eg. nan -> nan_Hant
          // Then it will search child languages and dialects
          [largestLocale.language],
          largestLocale.territoryCode,
        )
      : null;
    if (!descendentLocaleInTerritory) {
      largestLocale.containedLocales = [localesSorted[1]];
      partitionedLocales.largest.push(largestLocale);
    } else {
      largestLocale.containedLocales = [descendentLocaleInTerritory];
      partitionedLocales.largestButDescendentExists.push(largestLocale);
    }
  }

  // Go through the other locales that are not the largest but come from census sources and add them to the other category.
  localesOfTheSameLanguage
    .filter((locale) => locale !== largestLocale && locale.localeSource === 'census')
    .forEach((locale) => {
      const descendentLocaleInTerritory = locale.language
        ? findExtantLocaleInTerritoryDescendingFromLanguage(
            // start with the language of the locale to find alt codes eg. nan -> nan_Hant
            // Then it will search child languages and dialects
            [locale.language],
            locale.territoryCode,
          )
        : null;
      if (!descendentLocaleInTerritory) {
        locale.containedLocales = [localesSorted[0]];
        partitionedLocales.significant.push(locale);
      } else {
        locale.containedLocales = [descendentLocaleInTerritory];
        partitionedLocales.significantButMaybeRedundant.push(locale);
      }
    });

  return partitionedLocales;
}

function findExtantLocaleInTerritoryDescendingFromLanguage(
  languages?: LanguageData[],
  territoryCode?: TerritoryCode,
): LocaleData | null {
  const directDescendent = findLocaleWithSameTerritory(languages, territoryCode);
  const recursiveDescendents =
    languages?.map((lang) =>
      findExtantLocaleInTerritoryDescendingFromLanguage(lang.childLanguages, territoryCode),
    ) ?? [];
  return (
    // Sort to pick the most populous locale
    [directDescendent, ...recursiveDescendents].filter(Boolean).sort((a, b) => {
      return (b?.populationSpeaking ?? 0) - (a?.populationSpeaking ?? 0);
    })[0] ?? null
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

export default PotentialLocales;
