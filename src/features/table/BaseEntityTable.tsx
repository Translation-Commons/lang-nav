import React, { ReactNode } from 'react';

import { ObjectData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/old/CountOfPeople';
import DecimalNumber from '@shared/ui/old/DecimalNumber';
import Deemphasized from '@shared/ui/old/Deemphasized';

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

function BaseEntityTable<T extends ObjectData>({ visibleColumns, objects }: Props<T>) {
  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <table style={{ textAlign: 'start', borderCollapse: 'collapse', width: 'max-content' }}>
        <thead
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--color-background)',
            zIndex: 10, // sticky table header row
          }}
        >
          <tr>
            {visibleColumns.map((column) => (
              <TableColumnName column={column} appearance="th" key={column.key} />
            ))}
          </tr>
        </thead>
        <tbody>
          {objects.map((object, i) => (
            <tr key={object.ID || i}>
              {visibleColumns.map((column, idx) => {
                const valueType = getValueTypeForColumn(column);
                // The pin column (idx 0) and the first data column (idx 1) stay pinned to the
                // left while scrolling horizontally. Their sticky positioning, background, and
                // row-hover highlight live in tableStyles.css under `.alwaysVisible`.
                const isSticky = idx <= 1;
                return (
                  <td
                    key={column.key}
                    className={isSticky ? `${valueType} alwaysVisible` : valueType}
                    style={{ maxWidth: MAX_COLUMN_WIDTH, padding: '0.25em 0.5em' }}
                  >
                    <FormattedContent content={column.render(object)} valueType={valueType} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
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
