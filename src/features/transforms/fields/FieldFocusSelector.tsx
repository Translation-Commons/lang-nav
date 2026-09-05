import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import FieldDropdown from '../sorting/FieldDropdown';

const FieldFocusSelector: React.FC = () => {
  const { view } = usePageParams();

  // Only applies to the TreeList view for now, but could be expanded to other views in the future
  if (view !== View.Hierarchy && view !== View.Map) return null;

  return (
    <>
      <div className="text-right">Show this data always</div>
      <FieldDropdown pageParam="fieldFocus" />
    </>
  );
};

export default FieldFocusSelector;
