import React from 'react';

import usePageParams from '@features/params/usePageParams';

import Deemphasized from '@shared/ui/Deemphasized';

import { getFilterFields, isFieldApplicable } from '../fields/FieldApplicability';
import TransformEnum from '../TransformEnum';

import FilterButton from './FilterButton';
import isFilterActive from './isFilterActive';

const ENABLED = false;

/**
 * Shows the current active filters as a series of buttons.
 *
 * For example: [Extinct v] / [Macrolanguage, Language, or Dialect v] / [In United States x] / [Name matches "n" x]
 */
const ActiveFilterButtons: React.FC = () => {
  const params = usePageParams();
  const filters = getFilterFields().filter(
    (f) => isFilterActive(f, params) && isFieldApplicable(f, TransformEnum.Filter, params.entType),
  );

  if (!ENABLED) return null;

  if (filters.length === 0) {
    return (
      <span className="text-xs">
        <Deemphasized>No filters applied</Deemphasized>
      </span>
    );
  }

  return (
    <span className="text-xs flex flex-wrap gap-1 items-center">
      {filters.map((f) => (
        <FilterButton key={f} field={f} />
      ))}
    </span>
  );
};

export default ActiveFilterButtons;
