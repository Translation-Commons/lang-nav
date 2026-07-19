import { ArrowUpDownIcon } from 'lucide-react';
import React, { useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

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
  const [isHovering, setIsHovering] = useState(false);
  const onMouseEnter = () => setIsHovering(true);
  const onMouseLeave = () => setIsHovering(false);

  const trigger =
    appearance === 'th' ? (
      <th
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          backgroundColor: isHovering ? 'var(--color-background-hover)' : undefined,
          cursor: 'default',
          padding: '0.25em 0.5em',
          maxWidth: MAX_COLUMN_WIDTH,
          minHeight: '2em',
          textAlign: 'start',
        }}
      />
    ) : (
      <span
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ backgroundColor: isHovering ? 'var(--color-background-hover)' : undefined }}
      />
    );

  return (
    <HoverCard>
      <HoverCardTrigger render={trigger}>{children}</HoverCardTrigger>
      <HoverCardContent className="w-auto max-w-96">
        <TableColumnHovercard column={column} />
      </HoverCardContent>
    </HoverCard>
  );
}

export default TableColumnName;
