import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import Hoverable from '../../../generic/Hoverable';
import { ObjectData } from '../../../types/DataTypes';

import { TableColumn } from './ObjectTable';

function TableColumnSelector<T extends ObjectData>({
  columns,
  currentlyVisibleColumns,
  visibleColumns,
  toggleColumn,
}: {
  columns: TableColumn<T>[];
  currentlyVisibleColumns: TableColumn<T>[];
  visibleColumns: Record<string, boolean>;
  toggleColumn: (key: string, isVisible?: boolean) => void;
}): React.ReactNode {
  const columnsByGroup = getColumnsByGroup(columns);

  return (
    <details style={{ margin: '.5em 0 1em 0', gap: '.5em 1em' }}>
      <summary style={{ cursor: 'pointer' }}>
        {currentlyVisibleColumns.length}/{columns.length} columns visible, click here to toggle.
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
            visibleColumns={visibleColumns}
            toggleColumn={toggleColumn}
          />
        ))}
      </div>
    </details>
  );
}

function getColumnsByGroup<T extends ObjectData>(
  columns: TableColumn<T>[],
): Record<string, TableColumn<T>[]> {
  return columns.reduce(
    (groups, column) => {
      const group = column.columnGroup || column.key;
      if (!groups[group]) groups[group] = [];
      groups[group].push(column);
      return groups;
    },
    {} as Record<string, TableColumn<T>[]>,
  );
}

function ColumnGroup<T extends ObjectData>({
  group,
  columns,
  visibleColumns,
  toggleColumn,
}: {
  group: string;
  columns: TableColumn<T>[];
  visibleColumns: Record<string, boolean>;
  toggleColumn: (key: string, isVisible?: boolean) => void;
}): React.ReactNode {
  // If all columns are visible, this function will turn them all off
  // If no columns are visible, this function will turn them all on
  // If some columns are visible, this function will turn them all on
  const allVisible = columns.every((col) => visibleColumns[col.key]);
  const someVisible = columns.some((col) => visibleColumns[col.key]);
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
        alignItems: 'flex-start',
      }}
    >
      {columns.length > 1 && (
        <strong>
          {group}
          <Hoverable
            hoverContent={toggleSelectHoverContent}
            onClick={toggleSelectAll}
            style={{ marginLeft: '0.125em' }}
          >
            {allVisible ? (
              <SquareCheckIcon size="1em" />
            ) : someVisible ? (
              <SquareMinusIcon size="1em" />
            ) : (
              <SquareIcon size="1em" />
            )}
          </Hoverable>
        </strong>
      )}
      {columns.map((column) => (
        <ColumnCheckbox
          key={column.key}
          column={column}
          isChecked={visibleColumns[column.key] || false}
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
  return (
    <label key={column.key} style={{ cursor: 'pointer', fontWeight: 'normal' }}>
      <input type="checkbox" checked={isChecked} onChange={() => toggleColumn(column.key)} />
      {column.label ?? column.key}
    </label>
  );
}

export default TableColumnSelector;
