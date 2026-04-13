import React from 'react';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

const CellPopulation: React.FC<{ population?: number; percent?: number }> = ({
  population,
  percent,
}) => {
  return (
    <td className="population">
      <CountOfPeople count={population} />
      {percent != null && <Deemphasized> ({percent.toFixed(1)}%)</Deemphasized>}
    </td>
  );
};

export default CellPopulation;
