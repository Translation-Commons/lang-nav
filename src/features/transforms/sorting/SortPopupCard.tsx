import { ArrowDownUpIcon } from 'lucide-react';
import React from 'react';

import PopupCard from '@features/layers/popupcard/PopupCard';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import { getOptionStyle } from '@features/params/ui/SelectorOption';
import usePageParams from '@features/params/usePageParams';

import { PositionInGroup } from '@shared/lib/PositionInGroup';

import SecondarySortBySelector from './SecondarySortBySelector';
import SortBySelector from './SortBySelector';
import SortDirectionSelector from './SortDirectionSelector';

const SortPopupCard: React.FC = () => {
  const { sortBy } = usePageParams();

  return (
    <div className="selector" style={{ gap: '0.25em' }}>
      <ArrowDownUpIcon size="1.2em" />
      <PopupCard
        buttonLabel={<>{sortBy} ▶</>}
        buttonClassName="selected"
        buttonStyle={getOptionStyle(SelectorDisplay.Dropdown, true, PositionInGroup.Standalone)}
        description="Change how items are sorted."
        title="Sort"
        body={() => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
            <SortBySelector />
            <SecondarySortBySelector />
            <SortDirectionSelector />
          </div>
        )}
      />
    </div>
  );
};

export default SortPopupCard;
