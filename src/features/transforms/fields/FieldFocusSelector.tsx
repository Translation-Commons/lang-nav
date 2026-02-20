import React from 'react';

import { View } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import Field from './Field';
import { getFieldsForObjectType } from './FieldApplicability';

const FieldFocusSelector: React.FC = () => {
  const { fieldFocus, updatePageParams, view, objectType } = usePageParams();

  // Only applies to the TreeList view for now, but could be expanded to other views in the future
  if (view !== View.Hierarchy) return null;

  return (
    <Selector<Field>
      selectorLabel="Show Data"
      selectorDescription="Choose data to show to the right side of the tree list nodes."
      options={getFieldsForObjectType(objectType)}
      onChange={(field) => updatePageParams({ fieldFocus: field })}
      selected={fieldFocus}
    />
  );
};

export default FieldFocusSelector;
