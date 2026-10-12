import { XIcon } from 'lucide-react';
import React from 'react';

import { SidebarFilterSelectors } from '@features/transforms/filtering/selectors/SidebarFilterSelectors';

import { Button } from '@shared/ui/button';

type Props = {
  closeSidebar: () => void;
};

const FilterPanel: React.FC<Props> = ({ closeSidebar }) => {
  // usePageArrowKeys();

  return (
    <div className="p-2">
      <div className="w-full flex justify-center text-center relative px-2 text-2xl">
        <Button
          variant="ghost"
          className="absolute top-0 right-0 size-6"
          onClick={closeSidebar}
          aria-label="Close"
        >
          <XIcon />
        </Button>
        Filters
      </div>
      <SidebarFilterSelectors />
    </div>
  );
};

export default FilterPanel;
