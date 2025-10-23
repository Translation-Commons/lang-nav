import { InfoIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { ObjectType, SearchableField } from '@features/page-params/PageParamTypes';
import { usePageParams } from '@features/page-params/usePageParams';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn } from '@features/table/CommonColumns';
import ObjectTable, { ValueType } from '@features/table/ObjectTable';

import { CensusData } from '@entities/census/CensusTypes';
import { LocaleData } from '@entities/types/DataTypes';
import HoverableObject from '@entities/ui/HoverableObject';
import HoverableObjectName from '@entities/ui/HoverableObjectName';
import { ObjectFieldHighlightedByPageSearch } from '@entities/ui/ObjectField';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import Deemphasized from '@shared/ui/Deemphasized';
import Hoverable from '@shared/ui/Hoverable';
import { PercentageDifference } from '@shared/ui/PercentageDifference';

type Props = {
  census: CensusData;
};

const TableOfLanguagesInCensus: React.FC<Props> = ({ census }) => {
  const { getLanguage, getLocale } = useDataContext();
  const { localeSeparator } = usePageParams();

  const langsNotFound: string[] = [];

  // Create new locale data objects based on the census results
  const languagesInCensus: LocaleData[] = Object.entries(census.languageEstimates)
    .map(([langID, populationSpeaking]) => {
      const lang = getLanguage(langID);
      if (lang == null) {
        langsNotFound.push(langID);
        return null;
      }
      return {
        type: ObjectType.Locale,
        ID: langID + '_' + census.isoRegionCode,
        codeDisplay: lang.codeDisplay + localeSeparator + census.isoRegionCode,
        languageCode: langID,
        language: lang,
        nameDisplay: lang.nameDisplay,
        names: lang.names,

        territory: census.territory,
        territoryCode: census.isoRegionCode,

        populationSource: census.nameDisplay,
        populationSpeaking,
        populationSpeakingPercent:
          (populationSpeaking * 100) / (census.respondingPopulation || census.eligiblePopulation),
        populationCensus: census,
      } as LocaleData;
    })
    .filter((loc) => loc != null);

  const getActualLocaleInfoButton = useCallback(
    (mockedLocale: LocaleData): React.ReactNode => (
      <ActualLocaleInfoButton actualLocale={getLocale(mockedLocale.ID)} />
    ),
    [getLocale],
  );

  const getPopulationDifference = useCallback(
    (mockedLocale: LocaleData): React.ReactNode => (
      <PercentageDifference
        percentNew={mockedLocale.populationSpeakingPercent || 0}
        percentOld={getLocale(mockedLocale.ID)?.populationSpeakingPercent}
      />
    ),
    [getLocale],
  );

  return (
    <div>
      {langsNotFound.length > 0 && (
        <div>
          <label>Languages not found in the database:</label>
          {langsNotFound.join(', ')}
        </div>
      )}
      <ObjectTable<LocaleData>
        objects={languagesInCensus}
        shouldFilterUsingSearchBar={false}
        columns={[
          CodeColumn,
          {
            key: 'Languages',
            render: (object) => (
              <HoverableObject object={object.language}>
                <ObjectFieldHighlightedByPageSearch
                  object={object}
                  field={SearchableField.EngName}
                />
              </HoverableObject>
            ),
            sortParam: SortBy.Name,
          },
          {
            key: 'Population',
            render: (loc) => loc.populationSpeaking,
            valueType: ValueType.Numeric,
            sortParam: SortBy.Population,
          },
          {
            key: 'Percent Within Territory',
            render: (loc) =>
              loc.populationSpeakingPercent != null
                ? numberToFixedUnlessSmall(loc.populationSpeakingPercent) + '%'
                : 'N/A',
            valueType: ValueType.Numeric,
            sortParam: SortBy.PercentOfTerritoryPopulation,
          },
          {
            key: 'Scope',
            render: (loc) => loc.language?.scope,
            isInitiallyVisible: false,
            valueType: ValueType.Enum,
          },
          {
            key: 'Locale Entry',
            label: (
              <Hoverable hoverContent="The locale dataset has a canonical population estimate and may refer to estimates from multiple censuses. Hover for the canonical locale entry or click to see more details. The locale dataset does not contain every combination of language + territory so some may not be found.">
                Locale Entry
              </Hoverable>
            ),
            render: getActualLocaleInfoButton,
          },
          {
            key: 'Population Difference',
            label: (
              <Hoverable hoverContent="The difference the population estimate in this census is compared to the canonical locale population estimate. This compares percentages, so 8.3% - 10.4% is -2.1 pp (percentage points). Values are colored if the difference is more than 10%.">
                Population Difference
              </Hoverable>
            ),
            render: getPopulationDifference,
            valueType: ValueType.Numeric,
          },
          {
            key: 'Percent of Worldwide in Language',
            render: (object) =>
              object.populationSpeaking &&
              numberToFixedUnlessSmall(
                (object.populationSpeaking * 100) / (object.language?.populationEstimate || 1),
              ) + '%',
            valueType: ValueType.Numeric,
            isInitiallyVisible: false,
            sortParam: SortBy.PercentOfOverallLanguageSpeakers,
          },
          {
            key: 'Primary Territory',
            render: (loc) => {
              const territory = loc.language?.locales.sort(
                (a, b) => (b.populationSpeaking ?? -1) - (a.populationSpeaking ?? -1),
              )[0]?.territory;
              return territory ? <HoverableObjectName object={territory} /> : null;
            },
            isInitiallyVisible: true,
          },
        ]}
      />
    </div>
  );
};

const ActualLocaleInfoButton: React.FC<{ actualLocale?: LocaleData }> = ({ actualLocale }) => {
  if (actualLocale == null) {
    return (
      <Deemphasized>
        <span style={{ fontSize: '0.8em' }}>not found</span>
      </Deemphasized>
    );
  }
  return (
    <HoverableObject object={actualLocale} style={{ verticalAlign: 'middle' }}>
      <InfoIcon size="1em" display="block" />
    </HoverableObject>
  );
};

export default TableOfLanguagesInCensus;
