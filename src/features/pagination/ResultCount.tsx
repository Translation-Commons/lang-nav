import React from 'react';

import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

const ResultCount: React.FC = () => {
  const { filteredEntities } = useFilteredEntities({});
  return (
    <span className="text-foreground whitespace-nowrap">
      {filteredEntities.length.toLocaleString()} Results{' '}
    </span>
  );
};

export default ResultCount;
