import React from 'react';

import { PositionInGroup } from '@shared/lib/PositionInGroup';

import { useSelectorDisplay } from './SelectorDisplayContext';
import { getOptionStyle } from './SelectorOption';

type Props = {
  disabled?: boolean;
  position?: PositionInGroup;
};

const SelectorDropdownLabel: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  disabled = false,
  position = PositionInGroup.Middle,
}) => {
  const { display } = useSelectorDisplay();

  return (
    <button
      className="secondaryHoverableText" // grey unless hovered over
      disabled={disabled}
      style={{
        ...getOptionStyle(display, false, position),
        lineHeight: '0.5em',
      }}
      type="button"
    >
      <div style={{ fontSize: '0.75em' }}>{children}</div>
    </button>
  );
};

export default SelectorDropdownLabel;
