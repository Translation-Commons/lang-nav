import { InfoIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObject from '@features/hovercard/HoverableObject';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { ObjectType, SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { CodeColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { CensusData } from '@entities/census/CensusTypes';
import {
  getLanguageRootLanguageFamily,
  getLanguageRootMacrolanguage,
} from '@entities/language/LanguageFamilyUtils';
import { LocaleData, TerritoryScope } from '@entities/types/DataTypes';
import { ObjectFieldHighlightedByPageSearch } from '@entities/ui/ObjectField';

import Deemphasized from '@shared/ui/Deemphasized';
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
      <InteractiveObjectTable<LocaleData>
        tableID={TableID.LanguagesInCensus}
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
                  field={SearchableField.NameDisplay}
                />
              </HoverableObject>
            ),
            sortParam: SortBy.Name,
          },
          {
            key: 'Population',
            render: (loc) => loc.populationSpeaking,
            valueType: TableValueType.Population,
            sortParam: SortBy.Population,
          },
          {
            key: 'Percent Within Territory',
            render: (loc) => loc.populationSpeakingPercent,
            valueType: TableValueType.Decimal,
            sortParam: SortBy.PercentOfTerritoryPopulation,
          },
          {
            key: 'Scope',
            render: (loc) => loc.language?.scope,
            isInitiallyVisible: false,
            valueType: TableValueType.Enum,
          },
          {
            key: 'Locale Entry',
            description: (
              <>
                The locale dataset has a canonical population estimate and may refer to estimates
                from multiple censuses. Hover for the canonical locale entry or click to see more
                details. The locale dataset does not contain every combination of language +
                territory so some may not be found.
              </>
            ),
            render: getActualLocaleInfoButton,
          },
          {
            key: 'Population Difference',
            description: (
              <>
                The difference the population estimate in this census is compared to the canonical
                locale population estimate. This compares percentages, so 8.3% - 10.4% is -2.1 pp
                (percentage points). Values are colored if the difference is more than 10%.
              </>
            ),
            render: getPopulationDifference,
            valueType: TableValueType.Decimal,
          },
          {
            key: 'Percent of Worldwide in Language',
            render: (object) =>
              object.populationSpeaking &&
              (object.populationSpeaking * 100) / (object.language?.populationEstimate || 1),
            valueType: TableValueType.Decimal,
            isInitiallyVisible: false,
            sortParam: SortBy.PercentOfOverallLanguageSpeakers,
          },
          {
            key: 'Macrolanguage',
            render: (loc) =>
              loc.language && (
                <HoverableObjectName object={getLanguageRootMacrolanguage(loc.language)} />
              ),
            isInitiallyVisible: false,
          },
          {
            key: 'Language Family',
            render: (loc) =>
              loc.language && (
                <HoverableObjectName object={getLanguageRootLanguageFamily(loc.language)} />
              ),
            isInitiallyVisible: false,
          },
          {
            key: 'Primary Country',
            render: (loc) => {
              const territory = loc.language?.locales
                .filter((l) => l.territory?.scope === TerritoryScope.Country)
                .sort(
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
