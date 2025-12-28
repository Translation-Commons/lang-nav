import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay, useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import { getScaleBysApplicableToObjectType } from '@features/transforms/fields/FieldApplicability';

import { ScaleBy } from './ScaleTypes';

const ScaleBySelector: React.FC = () => {
  const { scaleBy, updatePageParams, objectType } = usePageParams();
  const { display } = useSelectorDisplay();

  const applicableScaleBys = getScaleBysApplicableToObjectType(objectType);
  const scaleByOptions: ScaleBy[] = ['None', ...applicableScaleBys];

  return (
    <Selector<ScaleBy>
      selectorLabel={display === SelectorDisplay.Dropdown ? 'Scale By' : undefined}
      selectorDescription="Choose a field to scale items by (map circles)."
      options={scaleByOptions}
      onChange={(scaleBy) => updatePageParams({ scaleBy })}
      selected={scaleBy}
    />
  );
};

export default ScaleBySelector;
