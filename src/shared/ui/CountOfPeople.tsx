import React from 'react';

import Deemphasized from './Deemphasized';

const CountOfPeople: React.FC<{ count?: number | boolean | null }> = ({ count }) => {
  if (count == null || count === false) return <Deemphasized>—</Deemphasized>;
  if (count === true || (count >= 1 && count <= 10)) return <Deemphasized>≥1</Deemphasized>;
  if (count <= 0) return <Deemphasized>0</Deemphasized>;
  if (count < 1) return <Deemphasized>—</Deemphasized>;
  return <span>{Math.round(count).toLocaleString()}</span>;
};

export default CountOfPeople;
