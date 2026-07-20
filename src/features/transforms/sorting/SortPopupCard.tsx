import { ArrowDownUpIcon } from 'lucide-react';
import React from 'react';

import PopupCard from '@features/layers/popupcard/PopupCard';
import usePageParams from '@features/params/usePageParams';

import SecondarySortBySelector from './SecondarySortBySelector';
import SortBySelector from './SortBySelector';
import SortDirectionSelector from './SortDirectionSelector';

const SortPopupCard: React.FC = () => {
  const { sortBy } = usePageParams();

  return (
    <PopupCard
      buttonLabel={
        <div className="flex content-center items-center gap-1">
          {sortBy} <ArrowDownUpIcon size="1.2em" />
        </div>
      }
      buttonClassName="primary rounded-[1em]"
      description="Change how items are sorted."
      title="Sorting Options"
      body={() => (
        <div className="flex w-max flex-col items-end gap-2">
          <SortBySelector />
          <SecondarySortBySelector />
          <SortDirectionSelector />
        </div>
      )}
    />
  );
};

export default SortPopupCard;
