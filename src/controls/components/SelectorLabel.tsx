import React, { ReactNode } from 'react';

import Hoverable from '../../generic/Hoverable';

import { OptionsDisplay } from './Selector';

type Props = {
  label?: ReactNode;
  description?: ReactNode;
  optionsDisplay: OptionsDisplay;
  style?: React.CSSProperties;
};

const SelectorLabel: React.FC<Props> = ({ label, description, optionsDisplay, style }) => {
  if (label == null) return null;
  return (
    <span style={{ ...getStyle(optionsDisplay), ...style }}>
      <Hoverable hoverContent={description} style={{ textDecoration: 'none' }}>
        {label}
      </Hoverable>
    </span>
  );
};

function getStyle(optionsDisplay: OptionsDisplay): React.CSSProperties {
  const style: React.CSSProperties = {
    lineHeight: '1em',
    fontWeight: 'bold',
    padding: '0.5em',
    whiteSpace: 'nowrap',
    borderRadius: '1em',
  };

  switch (optionsDisplay) {
    case OptionsDisplay.ButtonGroup:
      style.borderRadius = '1em 0 0 1em';
      style.marginLeft = '-0.125em'; // This may just be a remnant of the old style
      style.marginRight = '-0.125em';
      break;
    case OptionsDisplay.ButtonList:
      style.borderRadius = '1em 0 0 1em';
      break;
    case OptionsDisplay.InlineDropdown:
      style.padding = '0 0.5em';
      break;
    case OptionsDisplay.Dropdown:
      // nothing special
      break;
  }

  return style;
}

export default SelectorLabel;
