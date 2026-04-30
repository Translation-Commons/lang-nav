import { ArrowUpDownIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

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

  return (
    <th
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        color: 'var(--color-text)',
        backgroundColor: isHovering ? 'var(--color-background-hover)' : undefined,

        textAlign: 'start',
        maxWidth: MAX_COLUMN_WIDTH,
        minHeight: '2em',

        cursor: appearance === 'text' ? 'pointer' : 'default',
        display: appearance === 'text' ? 'inline' : undefined,
        padding: appearance === 'th' ? '0.25em 0.5em' : undefined,
        fontWeight: appearance === 'th' ? 'bold' : 'normal',
      }}
    >
      {column.label ?? column.key}{' '}
      {sortBy === column.field || secondarySortBy === column.field ? (
        <ArrowUpDownIcon
          size={14}
          style={{
            color: 'var(--color-button-primary)',
            opacity: secondarySortBy === column.field ? 0.5 : 1,
          }}
        />
      ) : null}
    </th>
  );
}

export default TableColumnName;
