import { XIcon } from 'lucide-react';
import React from 'react';

import { AllApplicableFilterSelectors } from '@features/transforms/filtering/selectors/FilterSelector';

import { Button } from '@shared/ui/button';

type Props = {
  closeSidebar: () => void;
};

const FilterPanel: React.FC<Props> = ({ closeSidebar }) => {
  // usePageArrowKeys();

  return (
    <div className="p-4">
      <div className="w-full flex justify-center text-center relative px-2 text-2xl">
        <Button
          variant="secondary"
          className="absolute top-0 right-0 size-6"
          onClick={closeSidebar}
          aria-label="Close"
        >
          <XIcon />
        </Button>
        Filters
      </div>
      <AllApplicableFilterSelectors />
    </div>
  );
};

export default FilterPanel;
