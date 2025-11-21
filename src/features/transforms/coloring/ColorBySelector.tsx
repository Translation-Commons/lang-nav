import React from 'react';

import Selector from '@widgets/controls/components/Selector';
import {
  SelectorDisplay,
  useSelectorDisplay,
} from '@widgets/controls/components/SelectorDisplayContext';

import { View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { getSortBysApplicableToObjectType } from '@features/transforms/sorting/sort';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { ColorBy } from './ColorTypes';

const ColorBySelector: React.FC = () => {
  const { colorBy, updatePageParams, objectType, view } = usePageParams();
  const { display } = useSelectorDisplay();

  const applicableColorBys = getSortBysApplicableToObjectType(objectType);
  const colorByOptions: ColorBy[] = [
    'None',
    ...Object.values(SortBy).filter((cb) => applicableColorBys.includes(cb)),
  ];

  // Only applicable to the card list and map views
  if (view !== View.Map && view !== View.CardList) return null;

  return (
    <Selector<ColorBy>
      selectorLabel={display === SelectorDisplay.Dropdown ? 'Color By' : undefined}
      selectorDescription="Choose the color coding for items in the view."
      options={colorByOptions}
      onChange={(colorBy) => updatePageParams({ colorBy })}
      selected={colorBy}
    />
  );
};

export default ColorBySelector;
