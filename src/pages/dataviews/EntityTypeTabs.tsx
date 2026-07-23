import React from 'react';

import NavTabs from '@widgets/controls/NavTabs';

import { ObjectType } from '@features/params/PageParamTypes';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';

import { toTitleCase } from '@shared/lib/stringUtils';

import ObjectTypeDescription from '@strings/ObjectTypeDescription';

const ORDERED_OBJECTS = [
  ObjectType.Language,
  ObjectType.Territory,
  ObjectType.Locale,
  ObjectType.WritingSystem,
  ObjectType.Variant,
  ObjectType.Keyboard,
  ObjectType.Census,
  ObjectType.Org,
];

const EntityTypeTabs: React.FC = () => {
  return (
    <NavTabs
      options={ORDERED_OBJECTS.map((entityType) => ({
        description: (
          <>
            <div style={{ marginBottom: '0.5em' }}>
              Click here to change the kind of entity viewed.
            </div>{' '}
            <ObjectTypeDescription objectType={entityType} />
          </>
        ),
        label: toTitleCase(getEntityTypeLabelPlural(entityType)),
        urlParams: { objectType: entityType },
      }))}
    />
  );
};

export default EntityTypeTabs;
