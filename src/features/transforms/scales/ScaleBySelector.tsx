import React from 'react';

import { View } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay, useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { getScaleBysApplicableToObjectType } from '@features/transforms/fields/FieldApplicability';

import Field from '../fields/Field';

const ScaleBySelector: React.FC = () => {
  const { scaleBy, updatePageParams, objectType, view } = usePageParams();
  const { display } = useSelectorDisplay();

  // Only applicable to the map view
  if (view !== View.Map) return null;

  return (
    <Selector<Field>
      selectorLabel={display === SelectorDisplay.Dropdown ? 'Scale By' : undefined}
      selectorDescription="Choose a field to scale items by (map circles)."
      options={getScaleBysApplicableToObjectType(objectType)}
      onChange={(scaleBy) => updatePageParams({ scaleBy })}
      selected={scaleBy}
    />
  );
};

export default ScaleBySelector;
