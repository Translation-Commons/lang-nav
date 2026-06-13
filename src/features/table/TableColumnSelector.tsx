import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import Modal from '@features/layers/modal/Modal';

import { ObjectData } from '@entities/types/DataTypes';

import { groupBy } from '@shared/lib/setUtils';

import TableColumn from './TableColumn';
import TableColumnName from './TableColumnName';
import { ColumnVisibilityModule } from './useColumnVisibility';

function TableColumnSelector<T extends ObjectData>({
  columns,
  visibilityModule,
}: {
  columns: TableColumn<T>[];
  visibilityModule: ColumnVisibilityModule<T>;
}): React.ReactNode {
  const { columnVisibility } = visibilityModule;
  const columnsByGroup = groupBy(columns, (column) => column.columnGroup || column.key);
  const nVisible = columns.filter((col) => columnVisibility[col.key]).length;

  return (
    <Modal
      buttonLabel={`${nVisible}/${columns.length} columns visible. Click to configure.`}
      description="Select which columns to show or hide"
      title="Select Columns"
      body={
        <>
          Click to toggle the visibility of columns in the table. You can also hover over column
          names for more info and sorting/filtering options.
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(12em, 1fr))',
              gap: '1em',
              padding: '0.5em',
            }}
          >
            {Object.entries(columnsByGroup).map(([group, columns]) => (
              <ColumnGroup
                columns={columns}
                group={group}
                key={group}
                visibilityModule={visibilityModule}
              />
            ))}
          </div>
          <GlobalControls columns={columns} visibilityModule={visibilityModule} />
        </>
      }
    />
  );
}

function ColumnGroup<T extends ObjectData>({
  columns,
  visibilityModule: { columnVisibility, toggleColumn, setColumns },
  group,
}: {
  columns: TableColumn<T>[];
  visibilityModule: ColumnVisibilityModule<T>;
  group: string;
}): React.ReactNode {
  // If all columns are visible, this function will turn them all off
  // If no columns are visible, this function will turn them all on
  // If some columns are visible, this function will turn them all on
  const allVisible = columns.every((col) => columnVisibility[col.key]);
  const someVisible = columns.some((col) => columnVisibility[col.key]);
  const toggleSelectAll = useCallback(() => {
    setColumns(
      columns.map((col) => col.key),
      !allVisible,
    );
  }, [columns, setColumns, allVisible]);
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
        textAlign: 'start',
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
  return (
    <label key={column.key} style={{ cursor: 'pointer', fontWeight: 'normal', textAlign: 'start' }}>
      <input type="checkbox" checked={isChecked} onChange={() => toggleColumn(column.key)} />
      <TableColumnName column={column} appearance="text" />
    </label>
  );
}

function GlobalControls<T extends ObjectData>({
  columns,
  visibilityModule: { setColumns, resetColumnVisibility },
}: {
  columns: TableColumn<T>[];
  visibilityModule: ColumnVisibilityModule<T>;
}): React.ReactNode {
  const selectAll = useCallback(() => {
    setColumns(
      columns.map((col) => col.key),
      true,
    );
  }, [columns, setColumns]);
  const deselectAll = useCallback(() => {
    setColumns(
      columns.map((col) => col.key),
      false,
    );
  }, [columns, setColumns]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'end',
        gap: '0.5em',
        padding: '0.5em',
      }}
    >
      <HoverableButton
        onClick={resetColumnVisibility}
        style={{ padding: '0.25em' }}
        hoverContent="Reset to default column visibility"
      >
        Reset
      </HoverableButton>
      <HoverableButton
        onClick={selectAll}
        style={{ padding: '0.25em' }}
        hoverContent="Show all columns"
      >
        Show all
      </HoverableButton>
      <HoverableButton
        onClick={deselectAll}
        style={{ padding: '0.25em' }}
        hoverContent="Hide all columns"
      >
        Hide all
      </HoverableButton>
    </div>
  );
}

export default TableColumnSelector;
