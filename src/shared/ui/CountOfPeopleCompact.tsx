import React from 'react';

import Deemphasized from './Deemphasized';

const formatCompact = (n: number): string => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toPrecision(3).replace(/\.?0+$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toPrecision(3).replace(/\.?0+$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toPrecision(3).replace(/\.?0+$/, '') + 'K';
  return Math.round(n).toString();
};

const CountOfPeopleCompact: React.FC<{ count?: number | null }> = ({ count }) => {
  if (count == null || count <= 0) return <Deemphasized>—</Deemphasized>;
  return <span>{formatCompact(count)}</span>;
};

export default CountOfPeopleCompact;
