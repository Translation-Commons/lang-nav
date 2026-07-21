import React from 'react';

import { cn } from '@shared/lib/utils';

type Props = React.PropsWithChildren<{
  align?: 'left' | 'center' | 'right';
}>;

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const CellLabel: React.FC<Props> = ({ children, align = 'left' }) => (
  <th className={cn('font-bold', alignClass[align])}>{children}</th>
);

export default CellLabel;
