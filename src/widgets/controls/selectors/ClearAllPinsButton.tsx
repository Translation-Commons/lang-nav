import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';

const ClearAllPinsButton: React.FC = () => {
  const { pinned, updatePageParams } = usePageParams();
  const onClearClick = () => updatePageParams({ pinned: [] });

  if (pinned.length === 0) return null;

  return (
    <>
      <div className="text-right">Pinned entities</div>
      <Button aria-label="Clear all pinned cards" onClick={onClearClick} variant="destructive">
        Clear all pins
      </Button>
    </>
  );
};

export default ClearAllPinsButton;
