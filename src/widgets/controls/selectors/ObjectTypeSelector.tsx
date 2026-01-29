import React, { useCallback } from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { getObjectTypeLabelPlural } from '@entities/lib/getObjectName';

import { toTitleCase } from '@shared/lib/stringUtils';

import ObjectTypeDescription from '@strings/ObjectTypeDescription';

const ObjectTypeSelector: React.FC = () => {
  const { objectType, updatePageParams, view } = usePageParams();
  const goToObjectType = useCallback(
    (objectType: ObjectType) => {
      updatePageParams({ objectType, searchString: undefined, page: 1 });
    },
    [updatePageParams, view],
  );

  return (
    <Selector
      selectorLabel="Entity"
      options={Object.values(ObjectType)}
      onChange={goToObjectType}
      selected={objectType}
      display={SelectorDisplay.ButtonList}
      getOptionLabel={(option) => toTitleCase(getObjectTypeLabelPlural(option))}
      getOptionDescription={(objectType) => (
        <>
          <div style={{ marginBottom: 8 }}>Click here to change the kind of entity viewed.</div>
          <ObjectTypeDescription objectType={objectType} />
        </>
      )}
    />
  );
};

export default ObjectTypeSelector;
