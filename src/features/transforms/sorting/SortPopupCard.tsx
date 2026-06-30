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
        <div
          style={{ display: 'flex', gap: '0.25em', alignContent: 'center', alignItems: 'center' }}
        >
          {sortBy} <ArrowDownUpIcon size="1.2em" />
        </div>
      }
      buttonClassName="primary"
      buttonStyle={{ borderRadius: '1em' }}
      description="Change how items are sorted."
      title="Sorting Options"
      body={() => (
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
      )}
    />
  );
};

export default SortPopupCard;
