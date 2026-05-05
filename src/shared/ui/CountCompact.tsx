import React from 'react';

import Deemphasized from './Deemphasized';

const formatCompact = (n: number): string =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(n);

const CountCompact: React.FC<{ count?: number | null }> = ({ count }) => {
  if (count == null || count <= 0) return <Deemphasized>—</Deemphasized>;
  return <span>{formatCompact(count)}</span>;
};

export default CountCompact;
