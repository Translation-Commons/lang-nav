import React from 'react';

import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn } from '@features/table/CommonColumns';
import ObjectTable from '@features/table/ObjectTable';

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData, TerritoryData } from '@entities/types/DataTypes';
import HoverableObjectName from '@entities/ui/HoverableObjectName';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import Deemphasized from '@shared/ui/Deemphasized';

type Props = {
  territory: TerritoryData;
};

/**
 * Territory-scoped table of locales (languages-in-territory).
 * Uses LocaleData so we can show population, percent, and official status.
 */
const TableOfLanguagesInTerritory: React.FC<Props> = ({ territory }) => {
  const { locales } = territory;

  if (!locales || locales.length === 0) {
    return null;
  }

  return (
    <ObjectTable<LocaleData>
      objects={locales}
      shouldFilterUsingSearchBar={false}
      columns={[
        CodeColumn,
        EndonymColumn,
        {
          key: 'Language',
          render: (loc) => <HoverableObjectName object={loc} labelSource="language" />,
          sortParam: SortBy.Name,
        },
        {
          key: 'Official Status',
          render: (loc) =>
            loc.officialStatus ? (
              getOfficialLabel(loc.officialStatus)
            ) : (
              <Deemphasized>None</Deemphasized>
            ),
        },
        {
          key: 'Population',
          render: (loc) => loc.populationSpeaking?.toLocaleString() ?? '—',
          isNumeric: true,
          sortParam: SortBy.Population,
        },
        {
          key: 'Population Source',
          render: (loc) => <LocaleCensusCitation locale={loc} size="short" />,
          isNumeric: true,
          isInitiallyVisible: false,
        },
        {
          key: 'Percent Within Territory',
          render: (loc) =>
            loc.populationSpeakingPercent != null ? (
              <>
                {numberToFixedUnlessSmall(loc.populationSpeakingPercent)}
                {loc.populationSpeakingPercent > 10 && (
                  <span style={{ visibility: 'hidden' }}>0</span>
                )}
              </>
            ) : (
              'N/A'
            ),
          isNumeric: true,
          sortParam: SortBy.PercentOfTerritoryPopulation,
        },
      ]}
    />
  );
};

export default TableOfLanguagesInTerritory;
