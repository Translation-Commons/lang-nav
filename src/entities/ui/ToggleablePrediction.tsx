import { RecycleIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

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
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
      <span
        style={{
          color: (currentValue ?? predictedValue) ? 'var(--color-green)' : 'var(--color-red)',
          opacity: currentValue == null ? 0.5 : 1,
        }}
      >
        {predictedText}
      </span>
      <HoverableButton onClick={onToggle} style={{ padding: '0.25em' }}>
        <RecycleIcon size="1em" display="block" />
      </HoverableButton>
    </div>
  );
};

export default ToggleablePrediction;
