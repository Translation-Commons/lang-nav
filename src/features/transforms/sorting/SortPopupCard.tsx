import { ArrowDownUpIcon } from 'lucide-react';
import React from 'react';

import NewHoverable from '@features/layers/hovercard/NewHoverable';
import usePageParams from '@features/params/usePageParams';

import FieldDropdown from './FieldDropdown';
import SortDirectionSelector from './SortDirectionSelector';

const SortPopupCard: React.FC = () => {
  const { sortBy } = usePageParams();

  return (
    <NewHoverable
      hoverContent={
        <div className="grid grid-cols-2">
          <div>Sort By</div>
          <FieldDropdown pageParam="sortBy" />
          <div>Secondary Sort By</div>
          <FieldDropdown pageParam="secondarySortBy" />
          <div>Sort Direction</div>
          <SortDirectionSelector />
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
