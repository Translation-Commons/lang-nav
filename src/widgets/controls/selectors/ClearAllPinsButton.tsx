import { BanIcon } from 'lucide-react';
import React from 'react';

import SelectorLabel from '@features/params/ui/SelectorLabel';
import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';

const ClearAllPinsButton: React.FC = () => {
  const { pinned, updatePageParams } = usePageParams();

  const onClearClick = () => {
    updatePageParams({ pinned: [] });
  };

  return (
    pinned.length > 0 && (
      <div className="flex items-center gap-1">
        <SelectorLabel
          label="Clear All Pins"
          description="Remove all pinned cards from the page."
        />
        <Button
          variant="outline"
          size="icon"
          aria-label="Clear all pinned cards"
          onClick={onClearClick}
        >
          <BanIcon className="ClearAllPinsButton-iconBan" size="1em" />
        </Button>
      </div>
    )
  );
};

export default ClearAllPinsButton;
