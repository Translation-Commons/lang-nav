import React from 'react';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { SortBy } from '@features/sorting/SortTypes';
import { CodeColumn, EndonymColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData, TerritoryData } from '@entities/types/DataTypes';

import AlignedFraction from '@shared/ui/AlignedFraction';
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
    <InteractiveObjectTable<LocaleData>
      tableID={TableID.LanguagesInTerritory}
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
          valueType: TableValueType.Numeric,
          sortParam: SortBy.Population,
        },
        {
          key: 'Population Source',
          render: (loc) => <LocaleCensusCitation locale={loc} size="short" />,
          valueType: TableValueType.Numeric,
          isInitiallyVisible: false,
        },
        {
          key: 'Percent Within Territory',
          render: (loc) => <AlignedFraction value={loc.populationSpeakingPercent} />,
          valueType: TableValueType.Numeric,
          sortParam: SortBy.PercentOfTerritoryPopulation,
        },
      ]}
    />
  );
};

export default TableOfLanguagesInTerritory;
