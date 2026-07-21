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
    // The table owns its own scroll box at every breakpoint: a bounded-height, both-axis
    // `overflow-auto` container. Because the box has a bounded height it is a real scrollport, so
    // `sticky top-0` on the header and `sticky left-0` on the pinned columns (header + body) anchor
    // to THIS box and work at all widths. The height is capped in viewport units so the box scrolls
    // internally instead of pushing the page: below lg the page still scrolls past it to the footer;
    // at lg+ the cap is sized to nearly fill the view region (leaving room for the sibling status
    // line) so the region itself does not also scroll — no double scrollbar. The 368px lg subtrahend
    // sums the fixed vertical chrome outside the box: ~154px above the view region (navbar + main
    // p-4 top + entity-type tabs + toolbar row) + ~16px region py-2 + ~136px of in-region siblings
    // (column-selector row + gap + bottom items-meter row + gap + LoadingStageDisplay + its margin)
    // + ~62px slack/below-region gap. Retune if that chrome changes. Cell backgrounds and the
    // sticky-left offsets live in tableStyles.css.
    <div className="entityTable w-full max-h-[70dvh] overflow-auto rounded-md border border-border lg:max-h-[calc(100dvh-368px)]">
      <table
        data-slot="table"
        className="w-max min-w-full caption-bottom text-start text-sm [&_td:last-child]:border-r-0 [&_td]:border-r [&_td]:border-border [&_th:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border"
      >
        <TableHeader className="sticky top-0 z-10">
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
