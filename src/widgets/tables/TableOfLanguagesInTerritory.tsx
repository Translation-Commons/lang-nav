import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, EndonymColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData, TerritoryData } from '@entities/types/DataTypes';

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
          field: Field.Name,
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
          render: (loc) => loc.populationSpeaking,
          valueType: TableValueType.Population,
          field: Field.Population,
        },
        {
          key: 'Population Source',
          render: (loc) => <LocaleCensusCitation locale={loc} size="short" />,
          valueType: TableValueType.Population,
          isInitiallyVisible: false,
        },
        {
          key: 'Percent Within Territory',
          render: (loc) => loc.populationSpeakingPercent,
          valueType: TableValueType.Decimal,
          field: Field.PercentOfTerritoryPopulation,
        },
      ]}
    />
  );
};

export default TableOfLanguagesInTerritory;
