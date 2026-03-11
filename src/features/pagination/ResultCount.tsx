import React from 'react';

import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

const ResultCount: React.FC = () => {
  const { filteredObjects } = useFilteredObjects({});
  return (
    <span style={{ color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
      {filteredObjects.length.toLocaleString()} Results{' '}
    </span>
  );
};

export default ResultCount;
