import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import { ExportTerritoryLanguageDataButton } from '@features/table/UNESCOExport';
import Field from '@features/transforms/fields/Field';
import { getLanguageFamiliesRelevantToEntity } from '@features/transforms/filtering/filterByConnections';

import CensusCountForTerritory from '@entities/census/CensusCountForTerritory';
import { getWritingSystemsInEntity } from '@entities/lib/getEntityMiscFields';
import {
  getTerritoryBiggestLocale,
  getTerritoryChildren,
  getTerritoryCountries,
} from '@entities/lib/getEntityRelatedTerritories';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { sumBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

function getTerritoryColumns(): TableColumn<TerritoryData>[] {
  return [
    CodeColumn,
    {
      key: 'ISO Alpha-3 Code',
      render: (ent) => ent.codeAlpha3 || null,
      isInitiallyVisible: false,
      columnGroup: 'Codes',
    },
    {
      key: 'ISO Numeric Code',
      render: (ent) => ent.codeNumeric || ent.ID.match(/\d{3}/)?.[0] || null,
      isInitiallyVisible: false,
      columnGroup: 'Codes',
    },
    NameColumn,
    EndonymColumn,
    {
      key: 'Other names',
      render: (ent) => (
        <CommaSeparated limit={1} limitText="short">
          {[...(ent.nameOtherEndonyms || []), ...(ent.nameOtherExonyms || [])].filter(
            (n) => n !== ent.nameDisplay && n !== ent.nameEndonym,
          )}
        </CommaSeparated>
      ),
      isInitiallyVisible: false,
      columnGroup: 'Names',
    },
    {
      key: 'Population',
      render: (ent) => ent.pop.overall,
      field: Field.Population,
      columnGroup: 'Demographics',
    },
    {
      key: 'Population (Writing)',
      render: (ent) => ent.pop.writing,
      field: Field.PopulationWriting,
      columnGroup: 'Demographics',
      isInitiallyVisible: false,
    },
    {
      key: 'Literacy',
      render: (ent) => ent.literacyPercent,
      field: Field.Literacy,
      columnGroup: 'Demographics',
    },
    {
      key: 'Census Tables',
      render: (ent) => <CensusCountForTerritory territory={ent} />,
      columnGroup: 'Demographics',
      field: Field.CountOfCensuses,
      isInitiallyVisible: false,
    },
    {
      key: 'Language Count',
      render: (ent) =>
        ent.locales && (
          <HoverableEnumeration
            items={ent.locales.map((l) => l.language?.nameDisplay ?? l.nameDisplay)}
          />
        ),
      field: Field.CountOfLanguages,
      columnGroup: 'Language',
    },
    {
      key: 'Biggest Language',
      render: (ent) =>
        ent.locales &&
        ent.locales.length > 0 && (
          <HoverableEntityName labelSource="language" ent={getTerritoryBiggestLocale(ent)} />
        ),
      isInitiallyVisible: false,
      field: Field.Language,
      columnGroup: 'Language',
    },
    {
      key: 'Biggest Language %',
      render: (ent) => getTerritoryBiggestLocale(ent)?.pop.speaking.percent,
      isInitiallyVisible: false,
      field: Field.PopulationPercentInBiggestDescendantLanguage,
      columnGroup: 'Language',
    },
    {
      key: 'Language Families',
      render: (ent) => (
        <CommaSeparated limit={1} limitText="short">
          {getLanguageFamiliesRelevantToEntity(ent)
            ?.filter((lf) => lf.parentLanguage == null)
            .map((lf) => (
              <HoverableEntityName key={lf.ID} ent={lf} />
            ))}
        </CommaSeparated>
      ),
      field: Field.LanguageFamily,
      columnGroup: 'Language',
    },
    {
      key: 'Language Family Count',
      render: (ent) => (
        <HoverableEnumeration
          items={
            getLanguageFamiliesRelevantToEntity(ent)
              ?.filter((lf) => lf.parentLanguage == null)
              .map((ws) => ws.nameDisplay) ?? []
          }
        />
      ),
      isInitiallyVisible: false,
      columnGroup: 'Language',
    },
    {
      key: 'Writing Systems',
      render: (ent) => (
        <HoverableEnumeration
          items={getWritingSystemsInEntity(ent)?.map((ws) => ws.nameDisplay) ?? []}
        />
      ),
      field: Field.CountOfWritingSystems,
      columnGroup: 'Language',
    },
    {
      key: 'Contained UN Region',
      render: (ent) => <HoverableEntityName ent={ent.parentUNRegion} />,
      isInitiallyVisible: false,
      field: Field.Region,
      columnGroup: 'Relations',
    },
    {
      key: 'Child Territories',
      render: (ent) => (
        <HoverableEnumeration items={getTerritoryChildren(ent).map((t) => t.nameDisplay)} />
      ),
      isInitiallyVisible: false,
      field: Field.CountOfChildTerritories,
      columnGroup: 'Relations',
    },
    {
      key: 'Contained Countries',
      render: (ent) => (
        <HoverableEnumeration items={getTerritoryCountries(ent).map((t) => t.nameDisplay)} />
      ),
      isInitiallyVisible: false,
      field: Field.CountOfCountries,
      columnGroup: 'Relations',
    },
    {
      key: 'Population of Dependencies',
      render: (ent) =>
        ent.dependentTerritories &&
        ent.dependentTerritories.length > 0 &&
        sumBy(ent.dependentTerritories, (t) => t.pop.overall ?? 0),
      isInitiallyVisible: false,
      field: Field.PopulationOfDescendants,
      columnGroup: 'Relations',
    },
    {
      key: 'Latitude',
      render: (ent) => ent.latitude?.toFixed(2) ?? <Deemphasized>—</Deemphasized>,
      exportValue: (ent) => ent.latitude?.toFixed(4) ?? '',
      isInitiallyVisible: false,
      field: Field.Latitude,
      columnGroup: 'Location',
    },
    {
      key: 'Longitude',
      render: (ent) => ent.longitude?.toFixed(2) ?? <Deemphasized>—</Deemphasized>,
      exportValue: (ent) => ent.longitude?.toFixed(4) ?? '',
      isInitiallyVisible: false,
      field: Field.Longitude,
      columnGroup: 'Location',
    },
    {
      key: 'Land Area (km²)',
      description:
        'Surprisingly, sources report different numbers for the land area for some areas.',
      render: (ent) => ent.landArea && numberToSigFigs(ent.landArea, 3)?.toLocaleString(),
      isInitiallyVisible: false,
      field: Field.Area,
      columnGroup: 'Location',
    },
    {
      key: 'Density',
      description: 'People per square kilometer',
      render: (ent) => ent.landArea && ent.pop.overall && ent.pop.overall / ent.landArea,
      isInitiallyVisible: false,
      valueType: TableValueType.Decimal,
      columnGroup: 'Location',
    },
    {
      key: 'Type',
      render: (ent) => getTerritoryScopeLabel(ent?.scope),
      field: Field.TerritoryScope,
    },
    {
      key: 'Export Language Data',
      description:
        "Export language data for this territory in a format for the World's Atlas of Languages",
      render: (ent) => <ExportTerritoryLanguageDataButton territory={ent} />,
      isInitiallyVisible: false,
    },
  ];
}

export default getTerritoryColumns;
