import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { getCountriesInEntity } from '@entities/lib/getEntityRelatedTerritories';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

function getWritingSystemColumns(): TableColumn<WritingSystemData>[] {
  return [
    CodeColumn,
    NameColumn,
    { ...EndonymColumn, isInitiallyVisible: true },
    {
      key: 'Potential Population',
      description: (
        <>
          An imprecise estimate of how many people use this writing system worldwide, calculated by
          adding up the population for all of the languages that use the writing system.
        </>
      ),
      render: (ent) => ent.populationUpperBound,
      field: Field.Population,
    },
    {
      key: 'Languages',
      render: (ent) =>
        ent.languages && (
          <CommaSeparated limit={1} limitText="short">
            {Object.values(ent.languages)
              .sort(sortByPopulation)
              .map((l) => (
                <HoverableEntityName ent={l} key={l.ID} />
              ))}
          </CommaSeparated>
        ),
      field: Field.Language,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Language Count',
      render: (ent) =>
        ent.languages && (
          <HoverableEnumeration items={Object.values(ent.languages).map((l) => l.nameDisplay)} />
        ),
      field: Field.CountOfLanguages,
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Keyboard Count',
      description: 'Number of keyboard layouts that output this writing system.',
      render: (ent) => (
        <HoverableEnumeration items={ent.outputKeyboards?.map((kb) => kb.nameDisplay)} />
      ),
      field: Field.CountOfKeyboards,
      columnGroup: 'Related Objects',
      isInitiallyVisible: false,
    },
    {
      key: 'Area of Origin',
      render: (ent) => <HoverableEntityName ent={ent.territoryOfOrigin} />,
      field: Field.Territory,
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Used in Countries',
      render: (ent) => (
        <HoverableEnumeration items={getCountriesInEntity(ent)?.map((t) => t.nameDisplay)} />
      ),
      isInitiallyVisible: false,
      field: Field.CountOfCountries,
      columnGroup: 'Related Objects',
    },
  ];
}

export default getWritingSystemColumns;
