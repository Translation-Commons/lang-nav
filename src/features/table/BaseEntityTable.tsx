import React, { ReactNode } from 'react';

import { ObjectData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/old/CountOfPeople';
import DecimalNumber from '@shared/ui/old/DecimalNumber';
import Deemphasized from '@shared/ui/old/Deemphasized';
import { TableBody, TableCell, TableHeader, TableRow } from '@shared/ui/table';

import { getValueTypeForColumn } from './getValueType';
import TableColumn from './TableColumn';
import TableColumnName from './TableColumnName';
import { MAX_COLUMN_WIDTH } from './TableColumnWidth';
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
    // Only scroll horizontally where the table is too wide to fit (below lg). At lg+ the wrapper
    // stays overflow-visible so `sticky top-0` on the header pins against the page scroll rather
    // than a never-scrolling overflow container (rendering the generated <Table> root instead
    // would force overflow-x:auto, which computes overflow-y to auto and breaks the sticky header).
    <div className="w-full overflow-x-auto lg:overflow-visible">
      <table data-slot="table" className="w-max caption-bottom text-start text-sm">
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
                      'align-top whitespace-normal',
                      isSticky ? 'alwaysVisible' : '',
                      isNumeric ? 'text-right tabular-nums' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ maxWidth: MAX_COLUMN_WIDTH }}
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
