import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownWideNarrow,
  ArrowDownZA,
} from 'lucide-react';
import React, { useCallback } from 'react';

import { usePageParams } from '@features/page-params/usePageParams';
import { SortBy, SortBehavior, SortDirection } from '@features/sorting/SortTypes';

import HoverableButton from '@shared/ui/HoverableButton';

import { getNormalSortDirection } from '../sorting/sort';

import { ValueType } from './ObjectTable';

type Props = {
  columnSortBy?: SortBy;
  valueType?: ValueType;
};

const TableSortButton: React.FC<Props> = ({ columnSortBy, valueType = ValueType.String }) => {
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
        valueType={valueType}
        sortDirection={sortBy === columnSortBy ? currentSortDirection : normalSortDirection}
      />
    </HoverableButton>
  );
};

type SortButtonIconProps = {
  valueType?: ValueType;
  sortDirection?: SortDirection;
};

function SortButtonIcon({ valueType, sortDirection }: SortButtonIconProps) {
  if (valueType === ValueType.Numeric) {
    if (sortDirection === SortDirection.Ascending) {
      return <ArrowDown01 size="1em" display="block" />;
    } else {
      return <ArrowDown10 size="1em" display="block" />;
    }
  } else if (valueType === ValueType.Enum) {
    if (sortDirection === SortDirection.Ascending) {
      return <ArrowDownWideNarrow size="1em" display="block" />;
    } else {
      return <ArrowDownNarrowWide size="1em" display="block" />;
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
