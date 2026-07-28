import { ArrowDownUpIcon } from 'lucide-react';
import React from 'react';

import NewHoverable from '@features/layers/hovercard/NewHoverable';
import usePageParams from '@features/params/usePageParams';

import SecondarySortBySelector from './SecondarySortBySelector';
import SortBySelector from './SortBySelector';
import SortDirectionSelector from './SortDirectionSelector';

const SortPopupCard: React.FC = () => {
  const { sortBy } = usePageParams();

  return (
    <NewHoverable
      hoverContent={
        <div>
          <div style={{ fontSize: '1.5em', paddingBottom: '0.5em' }}>Sorting Options</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5em',
              width: 'max-content',
              alignItems: 'end',
            }}
          >
            <SortBySelector />
            <SecondarySortBySelector />
            <SortDirectionSelector />
          </div>
        </div>
      }
    >
      <button className="primary" style={{ borderRadius: '1em', cursor: 'auto' }}>
        <div
          style={{ display: 'flex', gap: '0.25em', alignContent: 'center', alignItems: 'center' }}
        >
          {sortBy} <ArrowDownUpIcon size="1.2em" />
        </div>
      </button>
    </NewHoverable>
  );
};

export default SortPopupCard;
