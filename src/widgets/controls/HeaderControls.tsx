import React from 'react';

import SecondarySortBySelector from '@features/transforms/sorting/SecondarySortBySelector';
import SortBySelector from '@features/transforms/sorting/SortBySelector';
import SortDirectionSelector from '@features/transforms/sorting/SortDirectionSelector';

import ViewSelector from './selectors/ViewSelector';

const HeaderControls: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
        <ViewSelector />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap' }}>
        <SortBySelector />
        <SecondarySortBySelector />
        <SortDirectionSelector />
      </div>
    </div>
  );
};

export default HeaderControls;
