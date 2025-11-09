import React from 'react';

import { View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { getSortBysApplicableToObjectType } from '@features/sorting/sort';
import { ColorBy, SortBy } from '@features/sorting/SortTypes';

import Selector from '../../widgets/controls/components/Selector';
import { SelectorDisplay } from '../../widgets/controls/components/SelectorDisplay';

type Props = {
  display?: SelectorDisplay;
};

const ColorBySelector: React.FC<Props> = ({ display = SelectorDisplay.Dropdown }) => {
  const { colorBy, updatePageParams, objectType, view } = usePageParams();
  const applicableColorBys = getSortBysApplicableToObjectType(objectType);
  const colorByOptions: ColorBy[] = [
    'None',
    ...Object.values(SortBy).filter((cb) => applicableColorBys.includes(cb)),
  ];

  // Only applicable to the card list and map views
  if (view !== View.Map && view !== View.CardList) return null;

  return (
    <Selector<ColorBy>
      selectorLabel={display === SelectorDisplay.Dropdown ? 'Color by' : undefined}
      selectorDescription="Choose the color coding for items in the view."
      options={colorByOptions}
      onChange={(colorBy) => updatePageParams({ colorBy })}
      selected={colorBy}
      display={display}
    />
  );
};

export default ColorBySelector;
