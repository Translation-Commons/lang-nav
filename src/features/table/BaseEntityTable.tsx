import React, { ReactNode } from 'react';

import { ObjectData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/old/CountOfPeople';
import DecimalNumber from '@shared/ui/old/DecimalNumber';
import Deemphasized from '@shared/ui/old/Deemphasized';
import { TableBody, TableCell, TableHeader, TableRow } from '@shared/ui/table';

import { getValueTypeForColumn } from './getValueType';
import TableColumn from './TableColumn';
import TableColumnName from './TableColumnName';
import TableID from './TableID';
import TableValueType from './TableValueType';

type Props<T> = {
  visibleColumns: TableColumn<T>[];
  objects: T[];
  tableID: TableID;
};

const NUMERIC_VALUE_TYPES = new Set([
  TableValueType.Population,
  TableValueType.Count,
  TableValueType.Decimal,
]);

function BaseEntityTable<T extends ObjectData>({ visibleColumns, objects }: Props<T>) {
  return (
    // The scrolling ancestor is the Data-page view region (both axes). This wrapper sets no
    // overflow of its own, so `sticky top-0` on the header and `sticky left-0` on the pinned
    // columns both pin against that single scroll container (an intermediate overflow wrapper
    // here would compute overflow-y to auto and break the sticky header).
    <div className="w-max min-w-full rounded-md border border-border">
      <table
        data-slot="table"
        className="w-full caption-bottom text-start text-sm [&_td:last-child]:border-r-0 [&_td]:border-r [&_td]:border-border [&_th:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border"
      >
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            {visibleColumns.map((column) => (
              <TableColumnName column={column} appearance="th" key={column.key} />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {objects.map((object, i) => (
            <TableRow key={object.ID || i} className="group">
              {visibleColumns.map((column, idx) => {
                const valueType = getValueTypeForColumn(column);
                // The pin column (idx 0) and the first data column (idx 1) stay pinned to the
                // left while scrolling horizontally. Their sticky positioning and background live
                // in tableStyles.css under `.alwaysVisible`.
                const isSticky = idx <= 1;
                const isNumeric = NUMERIC_VALUE_TYPES.has(valueType);
                return (
                  <TableCell
                    key={column.key}
                    className={[
                      'align-top whitespace-normal max-w-[10em]',
                      isSticky ? 'alwaysVisible' : '',
                      isNumeric ? 'text-right tabular-nums' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <FormattedContent content={column.render(object)} valueType={valueType} />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  );
}

const FormattedContent: React.FC<{ content: ReactNode; valueType?: TableValueType }> = ({
  content,
  valueType,
}) => {
  switch (valueType ?? TableValueType.String) {
    case TableValueType.Population:
      if (typeof content === 'number' || typeof content === 'boolean' || content == null) {
        return <CountOfPeople count={content} />;
      }
      return content;
    case TableValueType.Count:
      if (typeof content === 'boolean') return content;
      if (content == null) return <Deemphasized>—</Deemphasized>;
      if (typeof content === 'number') return content.toLocaleString();
      return content;
    case TableValueType.Decimal:
      if (typeof content === 'number' || typeof content === 'boolean' || content == null) {
        return <DecimalNumber num={content} />;
      }
      return content;
    case TableValueType.Date:
    case TableValueType.String:
    case TableValueType.Enum:
      return content;
  }
};

export default BaseEntityTable;
