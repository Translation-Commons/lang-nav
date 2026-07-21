import { RecycleIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { cn } from '@shared/lib/utils';

const ToggleablePrediction = <T,>({
  currentValue,
  predictedValue,
  predictedText,
  onToggle,
}: {
  currentValue: T | undefined;
  predictedValue: T;
  predictedText: React.ReactNode;
  onToggle: () => void;
}) => {
  return (
    <div className="flex items-center gap-1">
      <span
        className={cn(
          (currentValue ?? predictedValue) ? 'text-green' : 'text-red',
          currentValue == null && 'opacity-50',
        )}
      >
        {predictedText}
      </span>
      <HoverableButton onClick={onToggle} className="p-1">
        <RecycleIcon size="1em" display="block" />
      </HoverableButton>
    </div>
  );
};

export default ToggleablePrediction;
