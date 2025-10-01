import React from 'react';

import { numberToFixedUnlessSmall } from '../../generic/numberUtils';
import { LocaleData, TerritoryData } from '../../types/DataTypes';
import { SortBy } from '../../types/PageParamTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import { CodeColumn, NameColumn, EndonymColumn } from '../common/table/CommonColumns';
import ObjectTable from '../common/table/ObjectTable';
import LocaleCensusCitation from '../locale/LocaleCensusCitation';
import { getOfficialLabel } from '../locale/LocaleStrings';

type Props = {
  territory: TerritoryData;
};

/**
 * Territory-scoped table of locales (languages-in-territory).
 * Uses LocaleData so we can show population, percent, and official status.
 */
const TableOfLanguagesInTerritory: React.FC<Props> = ({ territory }) => {
  const { locales } = territory;

  return (
    <ObjectTable<LocaleData>
      objects={locales}
      shouldFilterUsingSearchBar={false}
      columns={[
        CodeColumn,
        NameColumn,
        EndonymColumn,
        {
          key: 'Language',
          render: (loc) => <HoverableObjectName object={loc} labelSource="language" />,
          sortParam: SortBy.Name,
        },
        {
          key: 'Official Status',
          render: (loc) => (loc.officialStatus ? getOfficialLabel(loc.officialStatus) : <Deemphasized>None</Deemphasized>),
        },
        {
          key: 'Speakers',
          render: (loc) => (
            <span>
              {loc.populationSpeaking?.toLocaleString?.() ?? '—'}{' '}
              {loc.populationCensus && (
                <>
                  {' '}
                  [
                  <LocaleCensusCitation locale={loc} size="short" />]
                </>
              )}
            </span>
          ),
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'Percent Within Territory',
          render: (loc) =>
            loc.populationSpeakingPercent != null
              ? numberToFixedUnlessSmall(loc.populationSpeakingPercent) + '%'
              : 'N/A',
          isNumeric: true,
          sortParam: SortBy.RelativePopulation,
        },
      ]}
    />
  );
};

export default TableOfLanguagesInTerritory;
