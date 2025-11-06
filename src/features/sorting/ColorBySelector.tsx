import React from 'react';

import usePageParams from '@features/page-params/usePageParams';
import { getSortBysApplicableToObjectType } from '@features/sorting/sort';
import { ColorBy, SortBy } from '@features/sorting/SortTypes';

import Selector from '../../widgets/controls/components/Selector';
import { SelectorDisplay } from '../../widgets/controls/components/SelectorDisplay';

const ColorBySelector: React.FC = () => {
  const { colorBy, updatePageParams, objectType } = usePageParams();
  const applicableColorBys = getSortBysApplicableToObjectType(objectType);
  const colorByOptions: ColorBy[] = [
    'None',
    ...Object.values(SortBy).filter((cb) => applicableColorBys.includes(cb)),
  ];

  return (
    <Selector<ColorBy>
      selectorLabel="Color by"
      selectorDescription="Choose the color coding for items in the view."
      options={colorByOptions}
      onChange={(colorBy) => updatePageParams({ colorBy })}
      selected={colorBy}
      display={SelectorDisplay.Dropdown}
    />
  );
};

export default ColorBySelector;
