import React from 'react';

import AlignedFraction from './AlignedFraction';
import Deemphasized from './Deemphasized';

const TablePercentNumber: React.FC<{ percent?: number }> = ({ percent }) => {
  if (percent === undefined) return <Deemphasized>—</Deemphasized>;
  if (percent <= 0) return <Deemphasized>0</Deemphasized>;
  if (percent <= 1e-4) return <Deemphasized>&gt;{(0).toLocaleString()}</Deemphasized>;
  return <AlignedFraction value={percent} />;
};

export default TablePercentNumber;
