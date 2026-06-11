import React from 'react';

import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

const ResultCount: React.FC = () => {
  const { filteredEntities } = useFilteredEntities({});
  return (
    <span style={{ color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
      {filteredEntities.length.toLocaleString()} Results{' '}
    </span>
  );
};

export default ResultCount;
