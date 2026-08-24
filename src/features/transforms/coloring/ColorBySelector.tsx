import React from 'react';

import { EntityType, View } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay, useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import Field from '../fields/Field';
import { getApplicableFields } from '../fields/FieldApplicability';
import TransformEnum from '../TransformEnum';

type Props = {
  entType?: EntityType;
};

const ColorBySelector: React.FC<Props> = ({ entType }) => {
  const { colorBy, updatePageParams, view, entType: pageEntityType } = usePageParams();
  const { display } = useSelectorDisplay();

  // Only applicable to the card list and map views
  if (view !== View.Map && view !== View.CardList) return null;

  return (
    <Selector<Field>
      selectorLabel={display === SelectorDisplay.Dropdown ? 'Color By' : undefined}
      selectorDescription="Choose the color coding for items in the view."
      options={getApplicableFields(TransformEnum.Color, entType ?? pageEntityType)}
      onChange={(colorBy) => updatePageParams({ colorBy })}
      selected={colorBy}
    />
  );
};

export default ColorBySelector;
