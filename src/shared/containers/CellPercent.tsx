import React from 'react';

import DecimalNumber from '@shared/ui/DecimalNumber';

type Props = {
  alignFraction?: boolean;
  leftContent?: React.ReactNode;
  percent?: number;
  showPercentSign?: boolean;
};

const CellPercent: React.FC<Props> = ({
  alignFraction = true,
  leftContent,
  percent,
  showPercentSign = false,
}) => {
  return (
    <td className="decimal">
      {leftContent}
      <DecimalNumber num={percent} alignFraction={alignFraction} />
      {showPercentSign && '%'}
    </td>
  );
};

export default CellPercent;
