import React from 'react';

import NavTabs from '@widgets/controls/NavTabs';

import { ObjectType } from '@features/params/PageParamTypes';

import ObjectTypeDescription from '@strings/ObjectTypeDescription';

const EntityTypeTabs: React.FC = () => {
  return (
    <NavTabs
      options={Object.values(ObjectType).map((entityType) => ({
        description: (
          <>
            <div style={{ marginBottom: '0.5em' }}>
              Click here to change the kind of entity viewed.
            </div>{' '}
            <ObjectTypeDescription objectType={entityType} />
          </>
        ),
        label: entityType,
        urlParams: { objectType: entityType },
      }))}
    />
  );
};

export default EntityTypeTabs;
