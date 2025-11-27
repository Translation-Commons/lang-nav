import { InfoIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import Hoverable from '@features/hovercard/Hoverable';

import { ObjectData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

import TableColumn from './TableColumn';
import TableID from './TableID';
import TableSortButton from './TableSortButton';
import TableValueType from './TableValueType';

type Props<T> = {
  visibleColumns: TableColumn<T>[];
  objects: T[];
  tableID: TableID;
};

const MAX_COLUMN_WIDTH = '10em';

function BaseObjectTable<T extends ObjectData>({ visibleColumns, objects }: Props<T>) {
  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <table style={{ textAlign: 'start', borderCollapse: 'collapse', width: 'max-content' }}>
        <thead
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--color-background)',
            zIndex: 2,
          }}
        >
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: 'start',
                  maxWidth: MAX_COLUMN_WIDTH,
                  padding: '0.25em 0.5em',
                  minHeight: '2em',
                }}
              >
                {column.label ?? column.key}
                {column.description && (
                  <Hoverable hoverContent={column.description} style={{ marginLeft: '0.25em' }}>
                    <InfoIcon size="1em" display="block" />
                  </Hoverable>
                )}
                <TableSortButton columnSortBy={column.sortParam} valueType={column.valueType} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {objects.map((object, i) => (
            <tr key={object.ID || i}>
              {visibleColumns.map((column, idx) => (
                <td
                  key={column.key}
                  className={column.valueType}
                  style={{
                    maxWidth: MAX_COLUMN_WIDTH,
                    padding: '0.25em 0.5em',
                    position: idx === 0 ? 'sticky' : 'static',
                    left: idx === 0 ? 0 : 'auto',
                    backgroundColor: idx === 0 ? 'var(--color-background)' : 'inherit',
                    zIndex: idx === 0 ? 1 : 'auto',
                  }}
                >
                  <FormattedContent content={column.render(object)} valueType={column.valueType} />
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
      if (typeof content === 'number' || typeof content === 'boolean' || content == null) {
        return content?.toLocaleString() ?? <Deemphasized>—</Deemphasized>;
      }
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

export default BaseObjectTable;
