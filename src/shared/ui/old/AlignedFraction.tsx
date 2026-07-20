import React from 'react';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';

import Deemphasized from './Deemphasized';

type AlignedFractionProps = {
  value: number | null | undefined;
};

const AlignedFraction: React.FC<AlignedFractionProps> = ({ value }) => {
  if (value == null) return <Deemphasized>—</Deemphasized>;

  return (
    <>
      {numberToFixedUnlessSmall(value)}
      {/* If the number is greater than 10, add an invisible 0 for alignment */}
      {value > 10 && <span className="invisible">0</span>}
    </>
  );
};

export default AlignedFraction;
