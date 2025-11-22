import React from 'react';

import { View } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay, useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
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
