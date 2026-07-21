import { ArrowUpDownIcon } from 'lucide-react';
import React, { useState } from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import { cn } from '@shared/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import TableColumn from './TableColumn';
import TableColumnHovercard from './TableColumnHovercard';

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
          className={cn('text-primary', secondarySortBy === column.field && 'opacity-50')}
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
        className={cn(
          'max-w-[10em] min-h-[2em] cursor-default px-2 py-1 text-start',
          isHovering && 'bg-accent',
        )}
      />
    ) : (
      <span
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(isHovering && 'bg-accent')}
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
