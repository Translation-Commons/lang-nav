import React, { ReactNode } from 'react';

import ContextIcon from '@shared/ui/ContextIcon';

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
      {description && <ContextIcon>{description}</ContextIcon>}
    </span>
  );
};

function getStyle(display: SelectorDisplay): React.CSSProperties {
  const style: React.CSSProperties = {
    display: 'flex',
    gap: '0.25em',
    alignItems: 'center',
    fontWeight: '800', // adjusted font weight for easier visibility
    padding: '0.5em',
    margin: 'auto 0', // Vertically center
    whiteSpace: 'nowrap',
    borderRadius: '1em',
  };

  switch (display) {
    case SelectorDisplay.InlineDropdown:
      style.padding = '0 0.5em';
      break;
    case SelectorDisplay.FilterList:
      style.padding = '0 0 0.5em 0.5em';
      style.lineHeight = '2.25em'; // more spacing for visibility
      style.marginBottom = '-0.5em'; // adjusted to have selector buttons closer to their label
      break;
  }

  return style;
}

export default SelectorLabel;
