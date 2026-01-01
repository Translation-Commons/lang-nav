import React from 'react';

import CountOfPeople from '@shared/ui/CountOfPeople';

const CellPopulation: React.FC<{ population?: number }> = ({ population }) => {
  return (
    <td className="population">
      <CountOfPeople count={population} />
    </td>
  );
};

export default CellPopulation;
