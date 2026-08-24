import React, { useCallback } from 'react';

import { EntityType } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';

import { toTitleCase } from '@shared/lib/stringUtils';

import EntityTypeDescription from '@strings/EntityTypeDescription';

const EntityTypeSelector: React.FC = () => {
  const { entityType, updatePageParams } = usePageParams();
  const goToEntityType = useCallback(
    (entityType: EntityType) => {
      updatePageParams({ entityType });
    },
    [updatePageParams],
  );

  return (
    <Selector
      selectorLabel="Entity"
      options={Object.values(EntityType)}
      onChange={goToEntityType}
      selected={entityType}
      display={SelectorDisplay.ButtonList}
      getOptionLabel={(option) => toTitleCase(getEntityTypeLabelPlural(option))}
      getOptionDescription={(entityType) => (
        <>
          <div style={{ marginBottom: 8 }}>Click here to change the kind of entity viewed.</div>
          <EntityTypeDescription entityType={entityType} />
        </>
      )}
    />
  );
};

export default EntityTypeSelector;
