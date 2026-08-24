import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { CodeColumn, EndonymColumn } from '@features/table/CommonColumns';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

import Deemphasized from '@shared/ui/Deemphasized';

import LocaleEcrmlCoverage from './LocaleEcrmlCoverage';

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

  const hasECRMLData = locales.some((locale) => locale.ecrmlProtection != null);

  return (
    <LocalParamsProvider overrides={{ territoryScopes: [territory.scope], page: 1, limit: 10 }}>
      <InteractiveEntityTable
        tableID={TableID.LanguagesInTerritory}
        ents={locales}
        shouldFilterUsingSearchBar={false}
        columns={[
          CodeColumn,
          EndonymColumn,
          {
            key: 'Language',
            render: (loc) => <HoverableObjectName ent={loc} labelSource="language" />,
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
            key: 'Coverage under ECRML',
            description:
              'Whether the language is covered by the European Charter for Regional or Minority Languages in this territory.',
            render: (loc) => <LocaleEcrmlCoverage locale={loc} />,
            field: Field.ECRMLProtection,
            isInitiallyVisible: hasECRMLData,
          },
          {
            key: 'Population (Speaking)',
            render: (loc) => loc.pop.speaking.adjusted,
            field: Field.PopulationSpeaking,
          },
          {
            key: 'Population Source',
            render: (loc) => <LocaleCensusCitation locale={loc} focus={PopulationFocus.Speaking} />,
            isInitiallyVisible: false,
          },
          {
            key: 'Percent Within Territory',
            render: (loc) => loc.pop.speaking.percent,
            valueType: TableValueType.Decimal,
            field: Field.PercentOfTerritoryPopulation,
          },
          {
            key: 'Population (Writing)',
            render: (loc) => loc.pop.writing.adjusted,
            field: Field.PopulationWriting,
            isInitiallyVisible: false,
          },
        ]}
      />
    </LocalParamsProvider>
  );
};

export default TableOfLanguagesInTerritory;
