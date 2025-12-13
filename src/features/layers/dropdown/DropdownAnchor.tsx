import React from 'react';

import { DropdownAnchorContext } from './DropdownAnchorContext';

type Props = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement> & { style?: React.CSSProperties }
>;

const DropdownAnchor: React.FC<Props> = ({ children, style, ...rest }) => {
  const anchorRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <DropdownAnchorContext.Provider value={anchorRef}>
      <div
        {...rest}
        ref={anchorRef}
        style={{
          position: 'relative',
          ...style,
        }}
      >
        {children}
      </div>
    </DropdownAnchorContext.Provider>
  );
};

export default DropdownAnchor;
