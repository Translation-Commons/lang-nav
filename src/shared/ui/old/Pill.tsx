import React, { PropsWithChildren } from 'react';

import { cn } from '@shared/lib/utils';
import { Badge } from '@shared/ui/badge';

const Pill: React.FC<PropsWithChildren<{ className?: string; style?: React.CSSProperties }>> = ({
  children,
  className,
  style,
}) => {
  return (
    <Badge variant="secondary" className={cn('align-middle', className)} style={style}>
      {children}
    </Badge>
  );
};

export default Pill;
