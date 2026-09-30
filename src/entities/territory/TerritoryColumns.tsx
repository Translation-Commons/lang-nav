import React from 'react';

import { TerritoryRow } from '@features/data/api/territory/territoryList';
import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityRef from '@features/layers/hovercard/HoverableEntityRef';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import { CodeRowColumn, EndonymRowColumn, NameRowColumn } from '@features/table/RowColumns';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import { ExportTerritoryLanguageDataButton } from '@features/table/UNESCOExport';
import Field from '@features/transforms/fields/Field';

import CensusCountForTerritory from '@entities/census/CensusCountForTerritory';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import type { TerritoryData } from './TerritoryTypes';

function getTerritoryColumns(): TableColumn<TerritoryRow>[] {
  return [
    CodeRowColumn,
    {
      key: 'ISO Alpha-3 Code',
      render: (row) => row.codeAlpha3 ?? null,
      isInitiallyVisible: false,
      columnGroup: 'Codes',
    },
    {
      key: 'ISO Numeric Code',
      render: (row) => row.codeNumeric ?? null,
      isInitiallyVisible: false,
      columnGroup: 'Codes',
    },
    NameRowColumn,
    EndonymRowColumn,
    {
      key: 'Other names',
      render: (row) => (
        <CommaSeparated limit={1} limitText="short">
          {row.otherNames}
        </CommaSeparated>
      ),
      isInitiallyVisible: false,
      columnGroup: 'Names',
    },
    {
      key: 'Population',
      render: (row) => row.population,
      field: Field.Population,
      columnGroup: 'Demographics',
    },
    {
      key: 'Population (Writing)',
      render: (row) => row.populationWriting,
      field: Field.PopulationWriting,
      columnGroup: 'Demographics',
      isInitiallyVisible: false,
    },
    {
      key: 'Literacy',
      render: (row) => row.literacyPercent,
      field: Field.Literacy,
      columnGroup: 'Demographics',
    },
    {
      key: 'Census Tables',
      render: (row) => (
        <WithTerritory id={row.id} fallback={row.censusCount || <Deemphasized>—</Deemphasized>}>
          {(territory) => <CensusCountForTerritory territory={territory} />}
        </WithTerritory>
      ),
      columnGroup: 'Demographics',
      field: Field.CountOfCensuses,
      isInitiallyVisible: false,
    },
    {
      key: 'Language Count',
      render: (row) => row.languageNames && <HoverableEnumeration items={row.languageNames} />,
      field: Field.CountOfLanguages,
      columnGroup: 'Language',
    },
    {
      key: 'Biggest Language',
      render: (row) => <HoverableEntityRef entRef={row.biggestLanguage} />,
      isInitiallyVisible: false,
      field: Field.LanguagePrimary,
      columnGroup: 'Language',
    },
    {
      key: 'Languages',
      render: (row) => (
        <CommaSeparated limit={1} limitText="short">
          {row.languages.map((lang) => (
            <HoverableEntityRef key={lang.id} entRef={lang} />
          ))}
        </CommaSeparated>
      ),
      isInitiallyVisible: false,
      field: Field.LanguageList,
      columnGroup: 'Language',
    },
    {
      key: 'Biggest Language %',
      render: (row) => row.biggestLanguagePercent,
      isInitiallyVisible: false,
      field: Field.PopulationPercentInBiggestDescendantLanguage,
      columnGroup: 'Language',
    },
    {
      key: 'Language Families',
      render: (row) => (
        <CommaSeparated limit={1} limitText="short">
          {row.languageFamilies.map((lf) => (
            <HoverableEntityRef key={lf.id} entRef={lf} />
          ))}
        </CommaSeparated>
      ),
      field: Field.LanguageFamily,
      columnGroup: 'Language',
    },
    {
      key: 'Language Family Count',
      render: (row) => <HoverableEnumeration items={row.languageFamilies.map((lf) => lf.name)} />,
      isInitiallyVisible: false,
      columnGroup: 'Language',
    },
    {
      key: 'Writing Systems',
      render: (row) => <HoverableEnumeration items={row.writingSystemNames} />,
      field: Field.CountOfWritingSystems,
      columnGroup: 'Language',
    },
    {
      key: 'Contained UN Region',
      render: (row) => <HoverableEntityRef entRef={row.unRegion} />,
      isInitiallyVisible: false,
      field: Field.Region,
      columnGroup: 'Relations',
    },
    {
      key: 'Child Territories',
      render: (row) => <HoverableEnumeration items={row.childTerritoryNames} />,
      isInitiallyVisible: false,
      field: Field.CountOfChildTerritories,
      columnGroup: 'Relations',
    },
    {
      key: 'Contained Countries',
      render: (row) => <HoverableEnumeration items={row.countryNames} />,
      isInitiallyVisible: false,
      field: Field.CountOfCountries,
      columnGroup: 'Relations',
    },
    {
      key: 'Population of Dependencies',
      render: (row) => row.dependenciesPopulation,
      isInitiallyVisible: false,
      field: Field.PopulationOfDescendants,
      columnGroup: 'Relations',
    },
    {
      key: 'Latitude',
      render: (row) => row.latitude?.toFixed(2) ?? <Deemphasized>—</Deemphasized>,
      exportValue: (row) => row.latitude?.toFixed(4) ?? '',
      isInitiallyVisible: false,
      field: Field.Latitude,
      columnGroup: 'Location',
    },
    {
      key: 'Longitude',
      render: (row) => row.longitude?.toFixed(2) ?? <Deemphasized>—</Deemphasized>,
      exportValue: (row) => row.longitude?.toFixed(4) ?? '',
      isInitiallyVisible: false,
      field: Field.Longitude,
      columnGroup: 'Location',
    },
    {
      key: 'Land Area (km²)',
      description:
        'Surprisingly, sources report different numbers for the land area for some areas.',
      render: (row) => row.landArea && numberToSigFigs(row.landArea, 3)?.toLocaleString(),
      isInitiallyVisible: false,
      field: Field.Area,
      columnGroup: 'Location',
    },
    {
      key: 'Density',
      description: 'People per square kilometer',
      render: (row) => row.landArea && row.population && row.population / row.landArea,
      isInitiallyVisible: false,
      valueType: TableValueType.Decimal,
      columnGroup: 'Location',
    },
    {
      key: 'Type',
      render: (row) => getTerritoryScopeLabel(row.scope),
      field: Field.TerritoryScope,
    },
    {
      key: 'Export Language Data',
      description:
        "Export language data for this territory in a format for the World's Atlas of Languages",
      render: (row) => (
        <WithTerritory id={row.id}>
          {(territory) => <ExportTerritoryLanguageDataButton territory={territory} />}
        </WithTerritory>
      ),
      isInitiallyVisible: false,
    },
  ];
}

/** Graph seam: cells that still need the full territory, until they get their own endpoint. */
const WithTerritory: React.FC<{
  id: string;
  fallback?: React.ReactNode;
  children: (territory: TerritoryData) => React.ReactNode;
}> = ({ id, fallback = null, children }) => {
  const territory = useDataContext().getTerritory(id);
  return territory ? children(territory) : fallback;
};

export default getTerritoryColumns;
