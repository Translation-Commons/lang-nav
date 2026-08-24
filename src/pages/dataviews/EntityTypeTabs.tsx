import React from 'react';

import NavTabs from '@widgets/controls/NavTabs';

import { EntityType } from '@features/params/PageParamTypes';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';

import { toTitleCase } from '@shared/lib/stringUtils';

import EntityTypeDescription from '@strings/EntityTypeDescription';

const ORDERED_OBJECTS = [
  EntityType.Language,
  EntityType.Territory,
  EntityType.Locale,
  EntityType.WritingSystem,
  EntityType.Variant,
  EntityType.Keyboard,
  EntityType.Census,
  EntityType.Org,
];

const EntityTypeTabs: React.FC = () => {
  return (
    <NavTabs
      extendedOptionsLabel="More entities that can be viewed"
      options={ORDERED_OBJECTS.map((entType) => ({
        description: (
          <>
            <div style={{ marginBottom: '0.5em' }}>
              Click here to change the kind of entity viewed.
            </div>{' '}
            <EntityTypeDescription entType={entType} />
          </>
        ),
        label: toTitleCase(getEntityTypeLabelPlural(entType)),
        urlParams: { entType: entType },
      }))}
    />
  );
};

export default EntityTypeTabs;
