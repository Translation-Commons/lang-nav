import React, { ReactNode } from 'react';

import Hoverable from '../../generic/Hoverable';

type Props = {
  children: ReactNode;
  selectorLabel?: ReactNode;
  selectorDescription?: ReactNode;
  size?: 'regular' | 'compact';
};

const Selector: React.FC<Props> = ({
  children,
  selectorLabel,
  selectorDescription,
  size = 'regular',
}) => {
  return (
    <div className={'selector ' + size}>
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
