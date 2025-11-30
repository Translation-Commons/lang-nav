import React from 'react';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';

import AlignedFraction from './AlignedFraction';
import Deemphasized from './Deemphasized';

type Props = { num?: number | null | boolean; alignFraction?: boolean };

const DecimalNumber: React.FC<Props> = ({ num, alignFraction = true }) => {
  if (num == null || num === false) return <Deemphasized>—</Deemphasized>;
  if (num !== true && num <= 0) return <Deemphasized>0</Deemphasized>;
  if (num === true || num <= 1e-4) return <Deemphasized>&gt;{(0).toLocaleString()}</Deemphasized>;
  return alignFraction ? <AlignedFraction value={num} /> : numberToFixedUnlessSmall(num);
};

export default DecimalNumber;
