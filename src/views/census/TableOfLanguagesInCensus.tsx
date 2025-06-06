import React, { useCallback } from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { useDataContext } from '../../data/DataContext';
import Hoverable from '../../generic/Hoverable';
import { numberToFixedUnlessSmall } from '../../generic/numUtils';
import { CensusData } from '../../types/CensusTypes';
import { LocaleData } from '../../types/DataTypes';
import { ObjectType, SortBy } from '../../types/PageParamTypes';
import { getLanguageScopeLevel, ScopeLevel } from '../../types/ScopeLevel';
import HoverableObject from '../common/HoverableObject';
import { CodeColumn, NameColumn } from '../common/table/CommonColumns';
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
    .map(([langID, populationEstimate]) => {
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
        populationEstimate,
        populationPercentOfTerritory: (populationEstimate * 100) / census.eligiblePopulation,
      } as LocaleData;
    })
    .filter((loc) => loc != null);

  const getActualLocaleInfoButton = useCallback(
    (mockedLocale: LocaleData): React.ReactNode => (
      <ActualLocaleInfoButton actualLocale={locales[mockedLocale.ID]} />
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
          NameColumn,
          {
            label: 'Population',
            render: (loc) => loc.populationEstimate,
            isNumeric: true,
            sortParam: SortBy.Population,
          },
          {
            label: 'Percent within Territory',
            render: (loc) =>
              loc.populationPercentOfTerritory != null
                ? numberToFixedUnlessSmall(loc.populationPercentOfTerritory) + '%'
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
