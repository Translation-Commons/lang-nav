import React, { useMemo } from 'react';

import { OptionsDisplay } from '../../controls/components/Selector';
import Selector from '../../controls/components/SelectorOld';
import TextInput from '../../controls/components/TextInput';
import { getScopeFilter } from '../../controls/filter';
import { usePageParams } from '../../controls/PageParamsContext';
import { useDataContext } from '../../data/DataContext';
import { numberToFixedUnlessSmall } from '../../generic/numberUtils';
import { CensusData } from '../../types/CensusTypes';
import {
  BCP47LocaleCode,
  isTerritoryGroup,
  LocaleData,
  PopulationSourceCategory,
  TerritoryCode,
} from '../../types/DataTypes';
import { LanguageCode, LanguageData } from '../../types/LanguageTypes';
import { LocaleSeparator, ObjectType, SortBy } from '../../types/PageParamTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import { InfoButtonColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import LocaleCensusCitation from './LocaleCensusCitation';

type PartitionedLocales = {
  largest: LocaleData[];
  largestButDescendentExists: LocaleData[];
  significant: LocaleData[];
  significantButMaybeRedundant: LocaleData[];
};

const PotentialLocales: React.FC = () => {
  const {
    locales,
    censuses,
    languagesBySource: { All: languages },
  } = useDataContext();
  const { localeSeparator } = usePageParams();
  const [percentThreshold, setPercentThreshold] = React.useState(0.05);
  const potentialLocales = getPotentialLocales(
    Object.values(censuses),
    locales,
    languages,
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
      <Selector
        selectorLabel="Percent Threshold:"
        selectorDescription={`Limit results by the minimum percent population in a territory that uses the language.`}
      >
        <TextInput
          inputStyle={{ width: '3em' }}
          getSuggestions={async () => [
            { searchString: '0.001', label: '0.001%' },
            { searchString: '0.005', label: '0.005%' },
            { searchString: '0.01', label: '0.01%' },
            { searchString: '0.05', label: '0.05%' },
            { searchString: '0.1', label: '0.1%' },
            { searchString: '0.5', label: '0.5%' },
            { searchString: '1', label: '1%' },
            { searchString: '5', label: '5%' },
            { searchString: '10', label: '10%' },
          ]}
          optionsDisplay={OptionsDisplay.ButtonGroup}
          onChange={(percent: string) => setPercentThreshold(Number(percent))}
          placeholder=""
          value={Number.isNaN(percentThreshold) ? '' : percentThreshold.toString()}
        />
      </Selector>

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
  return (
    <details className="collapsible-report">
      <summary>
        {title} ({locales.filter(filterByScope).length})
      </summary>
      {children}
      <PotentialLocalesTable locales={locales} />
    </details>
  );
};

const PotentialLocalesTable: React.FC<{
  locales: LocaleData[];
  showRelatedLocales?: boolean;
}> = ({ locales }) => {
  return (
    <ObjectTable<LocaleData>
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
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: '% in Territory',
          render: (object) =>
            object.populationSpeakingPercent &&
            numberToFixedUnlessSmall(object.populationSpeakingPercent),
          isNumeric: true,
        },
        {
          key: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
        },
        InfoButtonColumn,
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
      ]}
    />
  );
};

function getPotentialLocales(
  censuses: CensusData[],
  locales: Record<BCP47LocaleCode, LocaleData>,
  languages: Record<LanguageCode, LanguageData>,
  localeSeparator: LocaleSeparator,
  percentThreshold: number,
): PartitionedLocales {
  // Iterate through all censuses and find locales that are not listed
  const allMissingLocales = useMemo(
    () =>
      censuses.reduce<Record<BCP47LocaleCode, LocaleData>>((missing, census) => {
        Object.entries(census.languageEstimates ?? {})?.forEach(([langID, populationEstimate]) => {
          const localeID = langID + '_' + census.isoRegionCode;
          const lang = languages[langID];
          if (locales[localeID] || lang == null) {
            return; // Locale already exists or language is missing, skip
          }
          const populationPercent = (populationEstimate * 100) / census.eligiblePopulation;
          if (populationPercent < percentThreshold) {
            return; // Skip if the population percentage is below the threshold
          }

          if (missing[localeID] == null) {
            missing[localeID] = {
              localeSource: 'census',
              type: ObjectType.Locale,
              ID: langID + '_' + census.isoRegionCode,
              codeDisplay: lang.codeDisplay + localeSeparator + census.isoRegionCode,
              languageCode: langID,
              language: lang,
              nameDisplay: lang.nameDisplay,
              names: lang.names,

              territory: census.territory,
              territoryCode: census.isoRegionCode,

              populationSource: PopulationSourceCategory.Census,
              populationSpeaking: populationEstimate,
              populationSpeakingPercent: populationPercent,
              populationCensus: census,
              censusRecords: [{ census, populationEstimate, populationPercent }],
            };
          } else {
            if (missing[localeID].populationSpeaking < populationEstimate) {
              // If we already have a locale but the population estimate is higher, update it
              missing[localeID].populationSpeaking = populationEstimate;
              missing[localeID].populationSpeakingPercent = populationPercent;
              missing[localeID].populationCensus = census;
            }
            missing[localeID].censusRecords.push({
              census,
              populationEstimate,
              populationPercent,
            });
          }
        });
        return missing;
      }, {}),
    [censuses, languages, locales, localeSeparator, percentThreshold],
  );

  // Group all locales (actual & missing) by language
  const allLocalesByLanguage = useMemo(() => {
    return [...Object.values(locales), ...Object.values(allMissingLocales)].reduce<
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
    return locale.populationSpeaking > max.populationSpeaking ? locale : max;
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
