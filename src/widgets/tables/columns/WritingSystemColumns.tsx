import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { getCountriesInObject } from '@entities/lib/getObjectRelatedTerritories';
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
      render: (object) => object.populationUpperBound,
      field: Field.Population,
    },
    {
      key: 'Languages',
      render: (object) =>
        object.languages && (
          <CommaSeparated limit={1} limitText="short">
            {Object.values(object.languages)
              .sort(sortByPopulation)
              .map((l) => (
                <HoverableObjectName object={l} key={l.ID} />
              ))}
          </CommaSeparated>
        ),
      field: Field.Language,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Language Count',
      render: (object) =>
        object.languages && (
          <HoverableEnumeration items={Object.values(object.languages).map((l) => l.nameDisplay)} />
        ),
      field: Field.CountOfLanguages,
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Keyboard Count',
      description: 'Number of keyboard layouts that output this writing system.',
      render: (object) => (
        <HoverableEnumeration items={object.outputKeyboards?.map((kb) => kb.nameDisplay)} />
      ),
      field: Field.CountOfKeyboards,
      columnGroup: 'Related Objects',
      isInitiallyVisible: false,
    },
    {
      key: 'Area of Origin',
      render: (object) => <HoverableObjectName object={object.territoryOfOrigin} />,
      field: Field.Territory,
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Used in Countries',
      render: (object) => (
        <HoverableEnumeration items={getCountriesInObject(object)?.map((t) => t.nameDisplay)} />
      ),
      isInitiallyVisible: false,
      field: Field.CountOfCountries,
      columnGroup: 'Related Objects',
    },
  ];
}

export default getWritingSystemColumns;
