import { ArrowUpDownIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import useHoverCard from '@features/layers/hovercard/useHoverCard';
import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import TableColumn from './TableColumn';
import TableColumnHovercard from './TableColumnHovercard';
import { MAX_COLUMN_WIDTH } from './TableColumnWidth';

type Props<T extends EntityData> = {
  column: TableColumn<T>;
  appearance: 'th' | 'text';
};

function TableColumnName<T extends EntityData>({ column, appearance }: Props<T>) {
  const { sortBy, secondarySortBy } = usePageParams();

  return (
    <HoverableContainer column={column} appearance={appearance}>
      {(appearance === 'text' ? column.labelInColumnGroup : undefined) ??
        column.label ??
        column.key}{' '}
      {sortBy === column.field || secondarySortBy === column.field ? (
        <ArrowUpDownIcon
          size={14}
          style={{
            color: 'var(--color-button-primary)',
            opacity: secondarySortBy === column.field ? 0.5 : 1,
          }}
        />
      ) : null}
    </HoverableContainer>
  );
}

function HoverableContainer<T extends EntityData>({
  column,
  children,
  appearance,
}: React.PropsWithChildren<Props<T>>) {
  const { showHoverCard, onMouseLeaveTriggeringElement } = useHoverCard();
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      setIsHovering(true);
      showHoverCard(<TableColumnHovercard column={column} />, e.clientX, e.clientY);
    },
    [column, showHoverCard],
  );
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    onMouseLeaveTriggeringElement();
  }, [onMouseLeaveTriggeringElement]);

  if (appearance === 'th') {
    return (
      <th
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          backgroundColor: isHovering ? 'var(--color-background-hover)' : undefined,
          cursor: 'default',
          padding: '0.25em 0.5em',
          maxWidth: MAX_COLUMN_WIDTH,
          minHeight: '2em',
          textAlign: 'start',
        }}
      >
        {children}
      </th>
    );
  }

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: isHovering ? 'var(--color-background-hover)' : undefined,
      }}
    >
      {children}
    </span>
  );
}

export default TableColumnName;
