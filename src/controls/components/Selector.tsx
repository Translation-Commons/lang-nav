import React from 'react';

import Hoverable from '../../generic/Hoverable';

type Props = {
  appearance?: 'rounded' | 'tabs';
  children: React.ReactNode;
  selectorLabel?: string;
  selectorDescription?: React.ReactNode;
  size?: 'regular' | 'compact';
};

const Selector: React.FC<Props> = ({
  appearance = 'rounded',
  children,
  selectorLabel,
  selectorDescription,
  size = 'regular',
}) => {
  return (
    <div className={'selector ' + size + ' ' + appearance}>
      {selectorLabel != null && (
        <label>
          <Hoverable hoverContent={selectorDescription} style={{ textDecoration: 'none' }}>
            {selectorLabel}
          </Hoverable>
        </label>
      )}
      {children}
    </div>
  );
};

export default Selector;
