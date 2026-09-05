import React from 'react';

import usePageArrowKeys from '@features/pagination/usePageArrowKeys';
import { AllApplicableFilterSelectors } from '@features/transforms/filtering/selectors/FilterSelector';

import ResizablePanel from './ResizablePanel';
import useFilterPanel from './useFilterPanel';

const FilterPanel: React.FC = () => {
  usePageArrowKeys();

  const filterPanel = useFilterPanel();

  return (
    <ResizablePanel
      defaultWidth={300}
      purpose="filters"
      title={<strong>Filters</strong>}
      isOpen={filterPanel.isOpen}
      onClose={() => filterPanel.setIsOpen(false)}
    >
      <AllApplicableFilterSelectors />
    </ResizablePanel>
  );
};

export default FilterPanel;
