import { ArrowDown01, ArrowDown10, ArrowDownAZ, ArrowDownZA } from 'lucide-react';
import React, { useCallback } from 'react';

import { usePageParams } from '../../../controls/PageParamsContext';
import { getNormalSortDirection } from '../../../controls/sort';
import HoverableButton from '../../../generic/HoverableButton';
import { SortBy, SortBehavior, SortDirection } from '../../../types/SortTypes';

type Props = {
  columnSortBy?: SortBy;
  isNumeric?: boolean;
};

const TableSortButton: React.FC<Props> = ({ columnSortBy, isNumeric = false }) => {
  const { sortBy, updatePageParams, sortBehavior } = usePageParams();

  if (!columnSortBy) {
    return <></>;
  }
  const currentSortDirection = getNormalSortDirection(sortBy) * sortBehavior;
  const normalSortDirection = getNormalSortDirection(columnSortBy);

  const onSortButtonClick = useCallback(
    (newSortBy: SortBy): void => {
      if (sortBy != newSortBy) {
        updatePageParams({ sortBy: newSortBy, sortBehavior: SortBehavior.Normal });
      } else {
        updatePageParams({ sortBehavior: sortBehavior * -1 });
      }
    },
    [sortBy, updatePageParams, sortBehavior],
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
      <SortButtonIcon
        isNumeric={isNumeric}
        sortDirection={sortBy === columnSortBy ? currentSortDirection : normalSortDirection}
      />
    </HoverableButton>
  );
};

type SortButtonIconProps = {
  isNumeric?: boolean;
  sortDirection?: SortDirection;
};

function SortButtonIcon({ isNumeric, sortDirection }: SortButtonIconProps) {
  if (isNumeric) {
    if (sortDirection === SortDirection.Ascending) {
      return <ArrowDown01 size="1em" display="block" />;
    } else {
      return <ArrowDown10 size="1em" display="block" />;
    }
  } else {
    if (sortDirection === SortDirection.Ascending) {
      return <ArrowDownAZ size="1em" display="block" />;
    } else {
      return <ArrowDownZA size="1em" display="block" />;
    }
  }
}
export default TableSortButton;
