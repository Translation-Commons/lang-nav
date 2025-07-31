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
    <span
      style={{
        marginLeft: optionsDisplay === OptionsDisplay.ButtonGroup ? '-0.125em' : '0',
        marginRight: optionsDisplay === OptionsDisplay.ButtonGroup ? '-0.125em' : '0',
        lineHeight: '1em',
        fontWeight: 'bold',
        padding: '0.5em',
        whiteSpace: 'nowrap',
        borderTopLeftRadius: optionsDisplay === OptionsDisplay.ButtonList ? '0' : '1em',
        borderBottomLeftRadius: optionsDisplay === OptionsDisplay.ButtonList ? '0' : '1em',
        ...style,
      }}
    >
      <Hoverable hoverContent={description} style={{ textDecoration: 'none' }}>
        {label}
      </Hoverable>
    </span>
  );
};

export default SelectorLabel;
