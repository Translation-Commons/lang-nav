import { PilcrowLeftIcon } from 'lucide-react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import { CodeColumn, EndonymColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { getCountriesInEntity } from '@entities/lib/getEntityRelatedTerritories';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { WritingSystemData } from './WritingSystemTypes';

function getWritingSystemColumns(): TableColumn<WritingSystemData>[] {
  return [
    CodeColumn,
    NameColumn,
    { ...EndonymColumn, isInitiallyVisible: true },
    {
      key: 'Population',
      description: (
        <>
          The number of people that write in the language, based on the available locale data.
          Smaller scripts are probably undercounted.
        </>
      ),
      render: (ent) => ent.population,
      field: Field.Population,
      columnGroup: 'Demographics',
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
      field: Field.LanguageList,
      columnGroup: 'Demographics',
    },
    {
      key: 'Language Count',
      render: (ent) =>
        ent.languages && (
          <HoverableEnumeration items={Object.values(ent.languages).map((l) => l.nameDisplay)} />
        ),
      field: Field.CountOfLanguages,
      isInitiallyVisible: false,
      columnGroup: 'Demographics',
    },
    {
      key: 'Area of Origin',
      render: (ent) => <HoverableEntityName ent={ent.territoryOfOrigin} />,
      field: Field.TerritoryPrimary,
      isInitiallyVisible: false,
      columnGroup: 'Demographics',
    },
    {
      key: 'Used in Countries',
      render: (ent) => (
        <HoverableEnumeration items={getCountriesInEntity(ent)?.map((t) => t.nameDisplay)} />
      ),
      isInitiallyVisible: false,
      field: Field.CountOfCountries,
      columnGroup: 'Demographics',
    },
    {
      key: 'Keyboard Count',
      description: 'Number of keyboard layouts that output this writing system.',
      render: (ent) => (
        <HoverableEnumeration items={ent.outputKeyboards?.map((kb) => kb.nameDisplay)} />
      ),
      field: Field.CountOfKeyboards,
      columnGroup: 'Technical Support',
      isInitiallyVisible: false,
    },
    {
      key: 'Unicode Version',
      description: 'The Unicode version this writing system was first supported in.',
      render: ({ unicodeVersion }) =>
        unicodeVersion === null ? (
          <Deemphasized>Not supported</Deemphasized>
        ) : unicodeVersion != null ? (
          unicodeVersion
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        ),
      field: Field.UnicodeVersion,
      columnGroup: 'Technical Support',
    },
    {
      key: 'Right-to-left',
      render: (ent) =>
        ent.rightToLeft && (
          <Hoverable hoverContent="This writing system is written right to left; interfaces must handle this or risk disruptive display bugs for text in this writing system.">
            <PilcrowLeftIcon aria-label="Right-to-left" color="var(--color-yellow)" size="1em" />
          </Hoverable>
        ),
      exportValue: (ent) => (ent.rightToLeft != null ? (ent.rightToLeft ? 'Yes' : 'No') : ''),
      columnGroup: 'Technical Support',
    },
  ];
}

export default getWritingSystemColumns;
