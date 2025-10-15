import { getObjectTypeLabelPlural } from '@entities/lib/getObjectName';
import { toTitleCase } from '@shared/lib/stringUtils';
import { ObjectType, View } from '@widgets/PageParamTypes';
import React, { useCallback } from 'react';

import ObjectTypeDescription from '../../../strings/ObjectTypeDescription';
import { usePageParams } from '../../PageParamsProvider';
import Selector from '../components/Selector';

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
