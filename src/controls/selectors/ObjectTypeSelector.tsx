import React, { useCallback } from 'react';

import { toTitleCase } from '../../generic/stringUtils';
import ObjectTypeDescription from '../../strings/ObjectTypeDescription';
import { ObjectType, View } from '../../types/PageParamTypes';
import { getObjectTypeLabelPlural } from '../../views/common/getObjectName';
import Selector from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

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
