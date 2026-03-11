import React from 'react';

import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

const ResultCount: React.FC = () => {
  const { filteredObjects } = useFilteredObjects({});
  return (
    <span style={{ fontSize: '0.9em', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
      {filteredObjects.length} Results
    </span>
  );
};

export default ResultCount;
