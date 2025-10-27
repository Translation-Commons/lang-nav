import { InfoIcon, SquareCheckIcon, SquareIcon, SquareMinusIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import usePageParams from '@features/page-params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import { groupBy } from '@shared/lib/setUtils';
import Hoverable from '@shared/ui/Hoverable';
import HoverableButton from '@shared/ui/HoverableButton';

import TableColumn from './TableColumn';
import TableSortButton from './TableSortButton';

function TableColumnSelector<T extends ObjectData>({
  columns,
  columnVisibility,
  resetColumnVisibility,
  toggleColumn,
}: {
  columns: TableColumn<T>[];
  columnVisibility: Record<string, boolean>;
  resetColumnVisibility: () => void;
  toggleColumn: (key: string, isVisible?: boolean) => void;
}): React.ReactNode {
  const columnsByGroup = groupBy(columns, (column) => column.columnGroup || column.key);
  const nVisible = columns.filter((col) => columnVisibility[col.key]).length;

  return (
    <details style={{ margin: '.5em 0 1em 0', gap: '.5em 1em' }}>
      <summary style={{ cursor: 'pointer' }}>
        {nVisible}/{columns.length} columns visible, click here to toggle.
      </summary>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '.5em',
          backgroundColor: 'var(--color-button-secondary)',
          padding: '0.5em',
          borderRadius: '.5em',
        }}
      >
        {Object.entries(columnsByGroup).map(([group, columns]) => (
          <ColumnGroup
            key={group}
            group={group}
            columns={columns}
            columnVisibility={columnVisibility}
            toggleColumn={toggleColumn}
          />
        ))}
        <HoverableButton
          onClick={resetColumnVisibility}
          style={{ height: 'fit-content', justifySelf: 'end', alignSelf: 'end' }}
          hoverContent="Reset to default column visibility"
        >
          Reset
        </HoverableButton>
      </div>
    </details>
  );
}

function ColumnGroup<T extends ObjectData>({
  group,
  columns,
  columnVisibility,
  toggleColumn,
}: {
  group: string;
  columns: TableColumn<T>[];
  columnVisibility: Record<string, boolean>;
  toggleColumn: (key: string, isVisible?: boolean) => void;
}): React.ReactNode {
  // If all columns are visible, this function will turn them all off
  // If no columns are visible, this function will turn them all on
  // If some columns are visible, this function will turn them all on
  const allVisible = columns.every((col) => columnVisibility[col.key]);
  const someVisible = columns.some((col) => columnVisibility[col.key]);
  const toggleSelectAll = useCallback(() => {
    columns.forEach((col) => toggleColumn(col.key, !allVisible));
  }, [columns, toggleColumn, allVisible]);
  const toggleSelectHoverContent = allVisible
    ? 'All columns visible. Click to hide all columns in this group.'
    : someVisible
      ? 'Some columns visible. Click to show all columns in this group.'
      : 'No columns visible. Click to show all columns in this group.';

  return (
    <div
      key={group}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginRight: '1em',
        textAlign: 'start',
        maxWidth: '12em',
      }}
    >
      {columns.length > 1 && (
        <Hoverable
          hoverContent={toggleSelectHoverContent}
          onClick={toggleSelectAll}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>{group}</div>
          <div style={{ marginLeft: '0.25em' }}>
            {allVisible ? (
              <SquareCheckIcon size="1em" display="block" />
            ) : someVisible ? (
              <SquareMinusIcon size="1em" display="block" />
            ) : (
              <SquareIcon size="1em" display="block" />
            )}
          </div>
        </Hoverable>
      )}
      {columns.map((column) => (
        <ColumnCheckbox
          key={column.key}
          column={column}
          isChecked={columnVisibility[column.key] || false}
          toggleColumn={toggleColumn}
        />
      ))}
    </div>
  );
}

function ColumnCheckbox<T extends ObjectData>({
  column,
  isChecked,
  toggleColumn,
}: {
  column: TableColumn<T>;
  isChecked: boolean;
  toggleColumn: (key: string) => void;
}): React.ReactNode {
  const { sortBy } = usePageParams();
  return (
    <label key={column.key} style={{ cursor: 'pointer', fontWeight: 'normal', textAlign: 'start' }}>
      <input
        type="checkbox"
        checked={isChecked || sortBy === column.sortParam}
        onChange={() => toggleColumn(column.key)}
      />
      {column.label ?? column.key}
      {column.description && (
        <Hoverable hoverContent={column.description} style={{ marginLeft: '0.25em' }}>
          <InfoIcon size="1em" display="block" />
        </Hoverable>
      )}
      {column.sortParam && (
        <TableSortButton columnSortBy={column.sortParam} valueType={column.valueType} />
      )}
    </label>
  );
}

export default TableColumnSelector;
