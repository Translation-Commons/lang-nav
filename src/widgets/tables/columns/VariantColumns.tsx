import { TriangleAlertIcon } from 'lucide-react';

import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import { getWritingSystemsInObject } from '@entities/lib/getObjectMiscFields';
import { getObjectPopulation } from '@entities/lib/getObjectPopulation';
import { getChildTerritoriesInObject } from '@entities/lib/getObjectRelatedTerritories';
import { VariantData } from '@entities/variant/VariantTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

function getVariantColumns(): TableColumn<VariantData>[] {
  return [
    CodeColumn,
    NameColumn,
    {
      key: 'Date Added',
      render: (object) => object.dateAdded?.toLocaleDateString(),
      isInitiallyVisible: false,
      field: Field.Date,
    },
    {
      key: 'Languages',
      render: (object) => (
        <CommaSeparated limit={1} limitText="short">
          {object.languages.map((lang) => (
            <HoverableObjectName object={lang} key={lang.ID} />
          ))}
        </CommaSeparated>
      ),
      field: Field.Language,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Language Count',
      render: (object) => (
        <HoverableEnumeration items={object.languages.map((lang) => lang.nameDisplay)} />
      ),
      field: Field.CountOfLanguages,
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Writing Systems',
      render: (object) => (
        <CommaSeparated limit={1} limitText="short">
          {getWritingSystemsInObject(object)?.map((ws) => (
            <HoverableObjectName object={ws} key={ws.ID} />
          ))}
        </CommaSeparated>
      ),
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
      field: Field.WritingSystem,
    },
    {
      key: 'Specific to Territories',
      render: (object) => (
        <CommaSeparated limit={1} limitText="short">
          {getChildTerritoriesInObject(object)?.map((territory) => (
            <HoverableObjectName object={territory} key={territory.ID} />
          ))}
        </CommaSeparated>
      ),
      isInitiallyVisible: false,
      field: Field.Territory,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Potential Population',
      description: (
        <>
          <TriangleAlertIcon size="1em" /> This is not the actual population of this variant tag,
          but an estimate based on the language(s) it applies to. If its an orthographic variant
          maybe it applies to the full modern population, but if it is a dialect or historic
          variation it may only be a small group of people or only found in manuscripts.
        </>
      ),
      render: (object) => getObjectPopulation(object),
      isInitiallyVisible: false,
      field: Field.Population,
    },
  ];
}

export default getVariantColumns;
