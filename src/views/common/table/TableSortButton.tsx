import { ArrowDown01, ArrowDown10, ArrowDownAZ, ArrowDownZA } from 'lucide-react';
import React, { useCallback } from 'react';

import { usePageParams } from '../../../controls/PageParamsContext';
import HoverableButton from '../../../generic/HoverableButton';
import { SortBy } from '../../../types/PageParamTypes';

type Props = {
  columnSortBy?: SortBy;
  isNumeric?: boolean;
};

const TableSortButton: React.FC<Props> = ({ columnSortBy, isNumeric = false }) => {
  const { sortBy, updatePageParams, sortDirection } = usePageParams();

  if (!columnSortBy) {
    return <></>;
  }

  const onSortButtonClick = useCallback(
    (newSortBy: SortBy): void => {
      if (sortBy != newSortBy) {
        updatePageParams({ sortBy: newSortBy, sortDirection: 'normal' });
      } else {
        updatePageParams({ sortDirection: sortDirection === 'normal' ? 'reverse' : 'normal' });
      }
    },
    [sortBy, updatePageParams, sortDirection],
  );

  return (
    <HoverableButton
      className={sortBy === columnSortBy ? 'primary' : ''}
      style={{
        display: 'inline-block',
        margin: 0,
        marginLeft: '4px',
        padding: '2px',
        borderRadius: '2px',
      }}
      hoverContent="Click to sort by this column or to toggle the sort direction."
      onClick={() => onSortButtonClick(columnSortBy)}
    >
      <SortButtonIcon isNumeric={isNumeric} sortDirection={sortDirection} />
    </HoverableButton>
  );
};

type SortButtonIconProps = {
  isNumeric?: boolean;
  sortDirection?: 'normal' | 'reverse';
};

function SortButtonIcon({ isNumeric, sortDirection }: SortButtonIconProps) {
  if (isNumeric && sortDirection === 'reverse') return <ArrowDown01 size="1em" display="block" />;
  if (isNumeric && sortDirection === 'normal') return <ArrowDown10 size="1em" display="block" />;
  if (!isNumeric && sortDirection === 'reverse') return <ArrowDownZA size="1em" display="block" />;
  return <ArrowDownAZ size="1em" display="block" />;
}
export default TableSortButton;
