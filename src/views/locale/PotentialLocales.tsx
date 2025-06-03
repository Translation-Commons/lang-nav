import React, { useMemo } from 'react';

import Selector from '../../controls/components/Selector';
import TextInput from '../../controls/components/TextInput';
import { usePageParams } from '../../controls/PageParamsContext';
import { useDataContext } from '../../data/DataContext';
import { BCP47LocaleCode, LocaleData, PopulationSourceCategory } from '../../types/DataTypes';
import { ObjectType, SortBy } from '../../types/PageParamTypes';
import { getLanguageScopeLevel, ScopeLevel } from '../../types/ScopeLevel';
import { CodeColumn, InfoButtonColumn, NameColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

import LocaleCensusCitation from './LocaleCensusCitation';

type PartitionedLocales = {
  indigenous: LocaleData[];
  largePopulation: LocaleData[];
  maybeRedundant: LocaleData[];
};

const PotentialLocales: React.FC = () => {
  const {
    locales,
    censuses,
    languagesBySchema: { Inclusive: languages },
  } = useDataContext();
  const { localeSeparator } = usePageParams();
  const [percentThreshold, setPercentThreshold] = React.useState(0.01);

  // Iterate through all censuses and find locales that are not listed
  const allMissingLocales = useMemo(
    () =>
      Object.values(censuses).reduce<Record<BCP47LocaleCode, LocaleData>>((missing, census) => {
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
              type: ObjectType.Locale,
              ID: langID + '_' + census.isoRegionCode,
              codeDisplay: lang.codeDisplay + localeSeparator + census.isoRegionCode,
              languageCode: langID,
              language: lang,
              nameDisplay: lang.nameDisplay,
              names: lang.names,
              scope: lang.scope != null ? getLanguageScopeLevel(lang) : ScopeLevel.Other,

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

  // Maybe break it down by territory instead.
  // For each territory, find the listed locales & find the potential locales.

  // Partition the locales into 3 types:
  // 1. Locales where the language is indigenous
  // 2. Locales who has no other equivalent in the same territory
  // 3. All others, may not be a priority
  const partitionedLocales = Object.values(allMissingLocales).reduce<PartitionedLocales>(
    (partitions, locale) => {
      const siblingLocales = locale.language?.locales ?? [];
      // If the language is not listed in any locale in the territory.
      if (!siblingLocales.some((l) => l.territoryCode === locale.territoryCode)) {
        if (siblingLocales.some((l) => l.populationSpeaking < locale.populationSpeaking)) {
          partitions.largePopulation.push(locale);
        } else {
          partitions.indigenous.push(locale);
        }
      } else {
        // A similar locale already exists in the territory, this may not be necessary or maybe the locales need to be clarified
        partitions.maybeRedundant.push(locale);
      }

      return partitions;
    },
    {
      indigenous: [],
      largePopulation: [],
      maybeRedundant: [],
    },
  );

  return (
    <div>
      <h1>Potential Locales</h1>
      <p>
        This page will list locales from Census data that are not in the list of defined locales.
        There are too many possible combinations of language + territory + variation information, so
        the number of actualized locales is smaller than the possible ones. However ones that appear
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
          onChange={(percent: string) => setPercentThreshold(Number(percent))}
          placeholder=""
          value={Number.isNaN(percentThreshold) ? '' : percentThreshold.toString()}
        />
      </Selector>
      <details>
        <summary>Indigenous ({partitionedLocales.indigenous.length})</summary>
        Of all of the census records collected so far, these locales have more people speaking it
        than the other instantiated locales. This likely means the world population is indigenous to
        this country. However, since we do not have full census coverage it is very possible that
        the language is native to a different country without an inputted census record.
        Additionally, some of these locales are macrolanguages or constituents thereof, so we may
        actually have the language but represented by a different aspect.
        <LocaleTable locales={partitionedLocales.indigenous} />
      </details>
      <details>
        <summary>Large Population ({partitionedLocales.largePopulation.length})</summary>
        This is the list of locales native to other countries, but with a significant population in
        other countries.
        <LocaleTable locales={partitionedLocales.largePopulation} />
      </details>
      <details>
        <summary>Likely Redundant ({partitionedLocales.maybeRedundant.length})</summary>
        Locales in this table reflect languages that already exist in territories but not in this
        specific locale ID. For example, they may have an entry with a writing system specified.
        <LocaleTable locales={partitionedLocales.maybeRedundant} />
      </details>
    </div>
  );
};

const LocaleTable: React.FC<{
  locales: LocaleData[];
}> = ({ locales }) => {
  return (
    <ObjectTable<LocaleData>
      objects={locales}
      columns={[
        CodeColumn,
        NameColumn,
        {
          label: 'Population',
          render: (object) => object.populationSpeaking,
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          label: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
        },
        InfoButtonColumn,
      ]}
    />
  );
};

export default PotentialLocales;
