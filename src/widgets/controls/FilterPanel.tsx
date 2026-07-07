import React from 'react';

import usePageArrowKeys from '@features/pagination/usePageArrowKeys';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
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
      <SelectorDisplayProvider display={SelectorDisplay.Dropdown}>
        <AllApplicableFilterSelectors />
      </SelectorDisplayProvider>
    </ResizablePanel>
  );
};

export default FilterPanel;
