import { ArrowUpDownIcon } from 'lucide-react';
import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { EntityData } from '@entities/types/DataTypes';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

import TableColumn from './TableColumn';
import TableColumnHovercard from './TableColumnHovercard';
import { MAX_COLUMN_WIDTH } from './TableColumnWidth';

type Props<T extends EntityData> = {
  column: TableColumn<T>;
};

function TableColumnHeader<T extends EntityData>({ column }: Props<T>) {
  const { sortBy, secondarySortBy } = usePageParams();

  return (
    <HoverableContainer column={column}>
      {column.label ?? column.key}{' '}
      {sortBy === column.field || secondarySortBy === column.field ? (
        <ArrowUpDownIcon
          size={14}
          className="inline-block"
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
}: React.PropsWithChildren<Props<T>>) {
  return (
    <HoverCard>
      <HoverCardTrigger
        data-testid="hoverable"
        delay={10}
        render={
          <th
            className="hover:bg-accent py-1 px-2 text-left text-sm font-semibold text-muted-foreground"
            style={{ maxWidth: MAX_COLUMN_WIDTH }}
          >
            {children}
          </th>
        }
      />
      <HoverCardContent className="max-w-[20rem] w-fit">
        <TableColumnHovercard column={column} />
      </HoverCardContent>
    </HoverCard>
  );
}

export default TableColumnHeader;
