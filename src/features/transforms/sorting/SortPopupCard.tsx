import { ArrowDownUpIcon } from 'lucide-react';
import React from 'react';

import usePageParams from '@features/params/usePageParams';


import TransformOptionsPopup from '../TransformOptionsPopup';

import FieldDropdown from './FieldDropdown';
import SortDirectionSelector from './SortDirectionSelector';

const SortPopupCard: React.FC = () => {
  const { sortBy } = usePageParams();

  return (
    <TransformOptionsPopup
      label={
        <>
          <ArrowDownUpIcon />
          <div className="truncate text-ellipsis">{sortBy}</div>
        </>
      }
      options={{
        'Sort By': <FieldDropdown pageParam="sortBy" />,
        'Secondary Sort By': <FieldDropdown pageParam="secondarySortBy" />,
        'Sort Direction': <SortDirectionSelector />,
      }}
    />
  );
};

export default SortPopupCard;
