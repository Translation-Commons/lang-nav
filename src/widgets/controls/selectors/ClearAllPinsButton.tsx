import { BanIcon } from 'lucide-react';
import React from 'react';

import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import { getOptionStyle } from '@features/params/ui/SelectorOption';
import usePageParams from '@features/params/usePageParams';
import { PositionInGroup } from '@shared/lib/PositionInGroup';

const ClearAllPinsButton: React.FC = () => {
  const { pinned, updatePageParams } = usePageParams();

  const onClearClick = () => {
    updatePageParams({ pinned: [] });
  };

  return (
    pinned.length > 0 && (
      <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
        <SelectorLabel
          label="Clear All Pins"
          description="Remove all pinned cards from the page."
        />
        <button
          aria-label="Clear all pinned cards"
          className="selected"
          onClick={onClearClick}
          style={getOptionStyle(SelectorDisplay.Dropdown, true, PositionInGroup.Standalone)}
        >
          <BanIcon className="ClearAllPinsButton-iconBan" size="1em" display="block" />
        </button>
      </div>
    )
  );
};

export default ClearAllPinsButton;
