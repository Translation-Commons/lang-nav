import React, { useCallback } from 'react';

import { ObjectType, View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { getObjectTypeLabelPlural } from '@entities/lib/getObjectName';

import { toTitleCase } from '@shared/lib/stringUtils';

import ObjectTypeDescription from '@strings/ObjectTypeDescription';

import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplayContext';

const ObjectTypeSelector: React.FC = () => {
  const { objectType, updatePageParams, view } = usePageParams();
  const goToObjectType = useCallback(
    (objectType: ObjectType) => {
      updatePageParams({
        objectID: undefined,
        objectType,
        view: view === View.Details ? View.CardList : view,
        searchString: undefined,
        page: 1,
      });
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
