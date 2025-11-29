import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownWideNarrow,
  ArrowDownZA,
} from 'lucide-react';
import React, { useCallback } from 'react';

import HoverableButton from '@features/hovercard/HoverableButton';
import usePageParams from '@features/params/usePageParams';
import { SortBy, SortBehavior, SortDirection } from '@features/transforms/sorting/SortTypes';

import { getNormalSortDirection } from '../transforms/sorting/sort';

import TableValueType from './TableValueType';

type Props = {
  columnSortBy?: SortBy;
  valueType?: TableValueType;
};

const TableSortButton: React.FC<Props> = ({ columnSortBy, valueType = TableValueType.String }) => {
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
  valueType?: TableValueType;
  sortDirection?: SortDirection;
};

function SortButtonIcon({ valueType, sortDirection }: SortButtonIconProps) {
  switch (valueType) {
    case TableValueType.Population:
    case TableValueType.Count:
    case TableValueType.Decimal:
    case TableValueType.Date:
      return sortDirection === SortDirection.Ascending ? (
        <ArrowDown01 size="1em" display="block" />
      ) : (
        <ArrowDown10 size="1em" display="block" />
      );
    case TableValueType.Enum:
      return sortDirection === SortDirection.Ascending ? (
        <ArrowDownNarrowWide size="1em" display="block" />
      ) : (
        <ArrowDownWideNarrow size="1em" display="block" />
      );
    default:
      return sortDirection === SortDirection.Ascending ? (
        <ArrowDownAZ size="1em" display="block" />
      ) : (
        <ArrowDownZA size="1em" display="block" />
      );
  }
}
export default TableSortButton;
