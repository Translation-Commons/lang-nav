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

import { getVariantTypeDisplay } from '@strings/VariantStrings';

function getVariantColumns(): TableColumn<VariantData>[] {
  return [
    CodeColumn,
    NameColumn,
    {
      key: 'Type',
      render: (ent) => (ent.variantType ? getVariantTypeDisplay(ent.variantType) : '—'),
      field: Field.VariantType,
    },
    {
      key: 'Date Added',
      render: (ent) => ent.dateAdded?.toLocaleDateString(),
      isInitiallyVisible: false,
      field: Field.Date,
    },
    {
      key: 'Languages',
      render: (ent) => (
        <CommaSeparated limit={1} limitText="short">
          {ent.languages.map((lang) => (
            <HoverableObjectName ent={lang} key={lang.ID} />
          ))}
        </CommaSeparated>
      ),
      columnGroup: 'Related Objects',
    },
    {
      key: 'Equivalent Language',
      render: (ent) => {
        if (!ent.equivalentLanguage || ent.equivalentLanguage.ID === 'mis') return null;
        return <HoverableObjectName ent={ent.equivalentLanguage} />;
      },
      field: Field.Language,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Language Count',
      render: (ent) => (
        <HoverableEnumeration items={ent.languages.map((lang) => lang.nameDisplay)} />
      ),
      field: Field.CountOfLanguages,
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
    },
    {
      key: 'Writing Systems',
      render: (ent) => (
        <CommaSeparated limit={1} limitText="short">
          {getWritingSystemsInObject(ent)?.map((ws) => (
            <HoverableObjectName ent={ws} key={ws.ID} />
          ))}
        </CommaSeparated>
      ),
      isInitiallyVisible: false,
      columnGroup: 'Related Objects',
      field: Field.WritingSystem,
    },
    {
      key: 'Specific to Territories',
      render: (ent) => (
        <CommaSeparated limit={1} limitText="short">
          {getChildTerritoriesInObject(ent)?.map((territory) => (
            <HoverableObjectName ent={territory} key={territory.ID} />
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
          <TriangleAlertIcon size="1em" /> This is not the actual population of this variant, but an
          estimate based on the language(s) it applies to. If its an orthographic variant maybe it
          applies to the full modern population, but if it is a dialect or historic variation it may
          only be a small group of people or only found in manuscripts.
        </>
      ),
      render: (ent) => getObjectPopulation(ent),
      isInitiallyVisible: false,
      field: Field.Population,
    },
  ];
}

export default getVariantColumns;
