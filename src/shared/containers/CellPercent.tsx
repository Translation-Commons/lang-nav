import React from 'react';

import DecimalNumber from '@shared/ui/DecimalNumber';

const CellPercent: React.FC<{ num?: number }> = ({ num }) => {
  return (
    <td className="decimal">
      <DecimalNumber num={num} />
    </td>
  );
};

export default CellPercent;
