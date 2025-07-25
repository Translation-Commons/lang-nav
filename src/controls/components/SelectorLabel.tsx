import React, { ReactNode } from 'react';

import Hoverable from '../../generic/Hoverable';

import { OptionsDisplay } from './Selector';

type Props = {
  label?: ReactNode;
  description?: ReactNode;
  optionsDisplay: OptionsDisplay;
};

const SelectorLabel: React.FC<Props> = ({ label, description, optionsDisplay }) => {
  if (label == null) return null;
  return (
    <label
      style={{
        border:
          optionsDisplay === OptionsDisplay.ButtonList
            ? 'none'
            : '0.125em solid var(--color-button-primary)',
        marginLeft: optionsDisplay === OptionsDisplay.ButtonGroup ? '-0.125em' : '0',
        marginRight: optionsDisplay === OptionsDisplay.ButtonGroup ? '-0.125em' : '0',
        lineHeight: '1em',
        padding: '0.5em',
        whiteSpace: 'nowrap',
      }}
    >
      <Hoverable hoverContent={description} style={{ textDecoration: 'none' }}>
        {label}
      </Hoverable>
    </label>
  );
};

export default SelectorLabel;
