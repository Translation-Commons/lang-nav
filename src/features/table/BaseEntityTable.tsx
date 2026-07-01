import React, { ReactNode } from 'react';

import ZIndex from '@features/layers/ZIndex';

import { ObjectData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

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
            zIndex: ZIndex.TableStickyRow,
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
              {visibleColumns.map((column, idx) => (
                <td
                  key={column.key}
                  className={getValueTypeForColumn(column)}
                  style={{
                    maxWidth: MAX_COLUMN_WIDTH,
                    padding: '0.25em 0.5em',
                    position: idx === 0 ? 'sticky' : 'static',
                    left: idx === 0 ? 0 : 'auto',
                    backgroundColor: idx === 0 ? 'var(--color-background)' : 'inherit',
                    zIndex: idx === 0 ? ZIndex.TableStickyColumn : 'auto',
                  }}
                >
                  <FormattedContent
                    content={column.render(object)}
                    valueType={getValueTypeForColumn(column)}
                  />
                </td>
              ))}
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
