import { WritingSystemRow } from '@features/data/api/writingsystem/writingSystemList';
import HoverableEntityRef from '@features/layers/hovercard/HoverableEntityRef';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import { CodeRowColumn, EndonymRowColumn, NameRowColumn } from '@features/table/RowColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import CommaSeparated from '@shared/ui/CommaSeparated';

function getWritingSystemColumns(): TableColumn<WritingSystemRow>[] {
  return [
    CodeRowColumn,
    NameRowColumn,
    { ...EndonymRowColumn, isInitiallyVisible: true },
    {
      key: 'Potential Population',
      description: (
        <>
          An imprecise estimate of how many people use this writing system worldwide, calculated by
          adding up the population for all of the languages that use the writing system.
        </>
      ),
      render: (row) => row.populationUpperBound,
      field: Field.Population,
    },
    {
      key: 'Languages',
      render: (row) =>
        row.languages && (
          <CommaSeparated limit={1} limitText="short">
            {row.languages.map((lang) => (
              <HoverableEntityRef entRef={lang} key={lang.id} />
            ))}
          </CommaSeparated>
        ),
      field: Field.LanguageList,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Language Count',
      render: (row) =>
        row.languages && <HoverableEnumeration items={row.languages.map((l) => l.name)} />,
      field: Field.CountOfLanguages,
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Keyboard Count',
      description: 'Number of keyboard layouts that output this writing system.',
      render: (row) => <HoverableEnumeration items={row.keyboardNames} />,
      field: Field.CountOfKeyboards,
      columnGroup: 'Related Objects',
      isInitiallyVisible: false,
    },
    {
      key: 'Area of Origin',
      render: (row) => <HoverableEntityRef entRef={row.territoryOfOrigin} />,
      field: Field.TerritoryPrimary,
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Used in Countries',
      render: (row) => <HoverableEnumeration items={row.countryNames} />,
      isInitiallyVisible: false,
      field: Field.CountOfCountries,
      columnGroup: 'Related Objects',
    },
  ];
}

export default getWritingSystemColumns;
