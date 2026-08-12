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
        <div className="flex flex-col gap-2 w-max items-end">
          <SortBySelector />
          <SecondarySortBySelector />
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
