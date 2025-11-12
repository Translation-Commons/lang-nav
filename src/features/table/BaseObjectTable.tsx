import { InfoIcon } from 'lucide-react';

import Hoverable from '@features/hovercard/Hoverable';

import { ObjectData } from '@entities/types/DataTypes';

import TableColumn from './TableColumn';
import TableSortButton from './TableSortButton';

type Props<T> = {
  visibleColumns: TableColumn<T>[];
  objects: T[];
};

const MAX_COLUMN_WIDTH = '10em';

function BaseObjectTable<T extends ObjectData>({ visibleColumns, objects }: Props<T>) {
  return (
    <table
      style={{
        width: 'fit-content',
        textAlign: 'start',
        borderSpacing: '12px 0px',
      }}
    >
      <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
        <tr>
          {visibleColumns.map((column) => (
            <th key={column.key} style={{ textAlign: 'start', maxWidth: MAX_COLUMN_WIDTH }}>
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
            {visibleColumns.map((column) => {
              let content = column.render(object);
              if (typeof content === 'number') {
                content = content.toLocaleString();
              }

              return (
                <td
                  key={column.key}
                  className={column.valueType}
                  style={{ maxWidth: MAX_COLUMN_WIDTH }}
                >
                  {content}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BaseObjectTable;
