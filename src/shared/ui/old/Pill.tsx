import React, { PropsWithChildren } from 'react';

import { Badge } from '@shared/ui/badge';

const Pill: React.FC<PropsWithChildren<{ style?: React.CSSProperties }>> = ({
  children,
  style,
}) => {
  return (
    <Badge variant="secondary" className="align-middle" style={style}>
      {children}
    </Badge>
  );
};

export default Pill;
