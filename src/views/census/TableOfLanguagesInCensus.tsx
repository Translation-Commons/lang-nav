import React, { useCallback } from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { useDataContext } from '../../data/DataContext';
import Hoverable from '../../generic/Hoverable';
import { numberToFixedUnlessSmall } from '../../generic/numberUtils';
import { PercentageDifference } from '../../generic/PercentageDifference';
import { CensusData } from '../../types/CensusTypes';
import { LocaleData } from '../../types/DataTypes';
import { ObjectType, SearchableField, SortBy } from '../../types/PageParamTypes';
import { getLanguageScopeLevel, ScopeLevel } from '../../types/ScopeLevel';
import HoverableObject from '../common/HoverableObject';
import { ObjectFieldHighlightedByPageSearch } from '../common/ObjectField';
import { CodeColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';

type Props = {
  census: CensusData;
};

const TableOfLanguagesInCensus: React.FC<Props> = ({ census }) => {
  const {
    languagesBySchema: { Inclusive: langObjects },
    locales,
  } = useDataContext();
  const { localeSeparator } = usePageParams();

  const langsNotFound: string[] = [];

  // Create new locale data objects based on the census results
  const languagesInCensus: LocaleData[] = Object.entries(census.languageEstimates)
    .map(([langID, populationSpeaking]) => {
      const lang = langObjects[langID];
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
        scope: lang.scope != null ? getLanguageScopeLevel(lang) : ScopeLevel.Other,

        territory: census.territory,
        territoryCode: census.isoRegionCode,

        populationSource: census.nameDisplay,
        populationSpeaking,
        populationSpeakingPercent: (populationSpeaking * 100) / census.eligiblePopulation,
      } as LocaleData;
    })
    .filter((loc) => loc != null);

  const getActualLocaleInfoButton = useCallback(
    (mockedLocale: LocaleData): React.ReactNode => (
      <ActualLocaleInfoButton actualLocale={locales[mockedLocale.ID]} />
    ),
    [locales],
  );

  const getPopulationDifference = useCallback(
    (mockedLocale: LocaleData): React.ReactNode => (
      <PercentageDifference
        percentNew={mockedLocale.populationSpeakingPercent || 0}
        percentOld={locales[mockedLocale.ID]?.populationSpeakingPercent}
      />
    ),
    [locales],
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
        columns={[
          CodeColumn,
          {
            label: 'Language',
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
            label: 'Population',
            render: (loc) => loc.populationSpeaking,
            isNumeric: true,
            sortParam: SortBy.Population,
          },
          {
            label: 'Percent within Territory',
            render: (loc) =>
              loc.populationSpeakingPercent != null
                ? numberToFixedUnlessSmall(loc.populationSpeakingPercent) + '%'
                : 'N/A',
            isNumeric: true,
          },
          {
            label: 'Scope',
            render: (loc) => loc.language?.scope,
            isNumeric: false,
          },
          {
            label: (
              <Hoverable hoverContent="The locale dataset has a canonical population estimate and may refer to estimates from multiple censuses. Hover for the canonical locale entry or click to see more details. The locale dataset does not contain every combination of language + territory so some may not be found.">
                Locale Entry
              </Hoverable>
            ),
            render: getActualLocaleInfoButton,
          },
          {
            label: (
              <Hoverable hoverContent="The difference the population estimate in this census is compared to the canonical locale population estimate. This compares percentages, so 8.3% - 10.4% is -2.1 pp (percentage points). Values are colored if the difference is more than 10%.">
                Population Difference
              </Hoverable>
            ),
            render: getPopulationDifference,
            isNumeric: true,
          },
        ]}
      />
    </div>
  );
};

const ActualLocaleInfoButton: React.FC<{ actualLocale?: LocaleData }> = ({ actualLocale }) => {
  if (actualLocale == null) {
    return (
      <span className="unsupported" style={{ fontSize: '0.8em' }}>
        not found
      </span>
    );
  }
  return (
    <HoverableObject object={actualLocale}>
      <button className="InfoButton">&#x24D8;</button>
    </HoverableObject>
  );
};

export default TableOfLanguagesInCensus;
