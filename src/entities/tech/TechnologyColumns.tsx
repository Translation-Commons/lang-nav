import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { CodeColumn, getFieldColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { TechnologyData } from './TechnologyTypes';

function getTechnologyColumns(): TableColumn<TechnologyData>[] {
  return [
    CodeColumn,
    NameColumn,
    { ...getFieldColumn(Field.Population), columnGroup: 'Population', isInitiallyVisible: true },
    {
      key: 'Source For Population',
      render: (ent) => (
        <div className="truncate">
          <EntityFieldDisplay ent={ent} field={Field.SourceForPopulation} />
        </div>
      ),
      field: Field.SourceForPopulation,
      isInitiallyVisible: false,
      columnGroup: 'Population',
    },
    { ...getFieldColumn(Field.Organization), isInitiallyVisible: true, columnGroup: 'Tech' },
    {
      key: 'Parent Technology',
      render: (ent) => <HoverableEntityName ent={ent.parentTech} />,
      isInitiallyVisible: false,
      columnGroup: 'Tech',
    },
    {
      key: 'Child Technologies',
      render: (ent) => (
        <CommaSeparated limit={1} limitText="short">
          {ent.childTechs?.map((childTech) => (
            <HoverableEntityName key={childTech.ID} ent={childTech} />
          ))}
        </CommaSeparated>
      ),
      isInitiallyVisible: false,
      columnGroup: 'Tech',
    },
    {
      key: 'Keyboards',
      render: (ent) => (
        <CommaSeparated limit={1} limitText="short">
          {ent.keyboards?.map((keyboard) => (
            <HoverableEntityName key={keyboard.ID} ent={keyboard} />
          ))}
        </CommaSeparated>
      ),
      columnGroup: 'Keyboards',
    },
    { ...getFieldColumn(Field.CountOfKeyboards), columnGroup: 'Keyboards' },
    { ...getFieldColumn(Field.LanguageList), isInitiallyVisible: true, columnGroup: 'Languages' },
    { ...getFieldColumn(Field.CountOfLanguages), columnGroup: 'Languages' },
  ];
}

export default getTechnologyColumns;
