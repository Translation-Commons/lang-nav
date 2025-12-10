import { InfoIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { SelectorDisplay, useSelectorDisplay } from './SelectorDisplayContext';

type Props = {
  label?: ReactNode;
  description?: ReactNode;
};

const SelectorLabel: React.FC<Props> = ({ label, description }) => {
  const { display } = useSelectorDisplay();
  if (label == null) return null;
  return (
    <span style={getStyle(display)}>
      <div>{label}</div>
      {description && (
        <Hoverable hoverContent={description}>
          <InfoIcon size="1em" display="block" />
        </Hoverable>
      )}
    </span>
  );
};

function getStyle(display: SelectorDisplay): React.CSSProperties {
  const style: React.CSSProperties = {
    display: 'flex',
    gap: '0.25em',
    lineHeight: '1em',
    alignItems: 'center',
    fontWeight: 'bold',
    padding: '0.5em',
    margin: 'auto 0', // Vertically center
    whiteSpace: 'nowrap',
    borderRadius: '1em',
  };

  switch (display) {
    case SelectorDisplay.ButtonGroup:
      style.borderRadius = '1em 0 0 1em';
      style.marginLeft = '-0.125em'; // This may just be a remnant of the old style
      style.marginRight = '-0.125em';
      break;
    case SelectorDisplay.ButtonList:
      style.borderRadius = '1em 0 0 1em';
      break;
    case SelectorDisplay.InlineDropdown:
      style.padding = '0 0.5em';
      break;
    case SelectorDisplay.Dropdown:
      // nothing special
      break;
  }

  return style;
}

export default SelectorLabel;
