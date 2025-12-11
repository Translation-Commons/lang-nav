import React from 'react';

import { PositionInGroup } from '@shared/lib/PositionInGroup';

import { useSelectorDisplay } from './SelectorDisplayContext';
import { getOptionStyle } from './SelectorOption';

type Props = {
  position?: PositionInGroup;
};

const SelectorDropdownLabel: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  position = PositionInGroup.Middle,
}) => {
  const { display } = useSelectorDisplay();

  return (
    <button
      className="secondaryHoverableText" // grey unless hovered over
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
