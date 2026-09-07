import React, { ReactNode } from 'react';

import { EntityData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

import { getValueTypeForColumn } from './getValueType';
import TableColumn from './TableColumn';
import TableColumnHeader from './TableColumnHeader';
import { MAX_COLUMN_WIDTH } from './TableColumnWidth';
import TableID from './TableID';
import TableValueType from './TableValueType';

type Props<T> = {
  visibleColumns: TableColumn<T>[];
  ents: T[];
  tableID: TableID;
};

function BaseEntityTable<T extends EntityData>({ visibleColumns, ents, tableID }: Props<T>) {
  return (
    <div className="w-full h-screen relative text-xs overflow-x-auto">
      <table className={'EntityTable Table' + tableID + ' text-left w-max mx-auto'}>
        <thead className="sticky top-0 bg-background z-10">
          <tr>
            {visibleColumns.map((column) => (
              <TableColumnHeader column={column} key={column.key} />
            ))}
          </tr>
        </thead>
        <tbody>
          {ents.map((ent, i) => (
            <tr key={ent.ID || i}>
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
                    <FormattedContent content={column.render(ent)} valueType={valueType} />
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
