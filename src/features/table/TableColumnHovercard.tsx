import usePageParams from '@features/params/usePageParams';
import { isFieldApplicable } from '@features/transforms/fields/FieldApplicability';
import FilterSelector from '@features/transforms/filtering/selectors/FilterSelector';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';
import TransformEnum from '@features/transforms/TransformEnum';

import { EntityData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import { getValueTypeForColumn } from './getValueType';
import TableColumn from './TableColumn';
import TableValueType from './TableValueType';

type Props<T extends EntityData> = {
  column: TableColumn<T>;
};

function TableColumnHovercard<T extends EntityData>({ column }: Props<T>) {
  const isSortable = column.field && isFieldApplicable(column.field, TransformEnum.Sort);
  const isFilterable = column.field && isFieldApplicable(column.field, TransformEnum.Filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
      <strong>{column.label ?? column.key}</strong>
      {column.description && <div>{column.description}</div>}
      <table>
        <tbody>
          {isSortable && <ColumnSortControls column={column} />}
          {isFilterable && (
            <tr>
              <th>Filter</th>
              <td>
                <FilterSelector field={column.field!} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ColumnSortControls<T extends EntityData>({ column }: { column: TableColumn<T> }) {
  const { sortBy, secondarySortBy, sortBehavior, updatePageParams } = usePageParams();
  const isActive = column.field === sortBy;
  const isSecondary = column.field === secondarySortBy;

  if (!column.field) return null;

  const valueType = getValueTypeForColumn(column);

  return (
    <>
      <tr>
        <th>Sort</th>
        <td>
          {[SortBehavior.Normal, SortBehavior.Reverse].map((sb) => (
            <button
              key={sb}
              className={isActive && sortBehavior === sb ? 'primary' : ''}
              onClick={() => updatePageParams({ sortBy: column.field, sortBehavior: sb })}
              style={{ padding: '0.25em 0.5em', marginRight: '0.5em' }}
            >
              {getSortingText(valueType, sb)}
            </button>
          ))}
        </td>
      </tr>
      <tr>
        <td style={{ textAlign: 'center' }}>or</td>
        <td>
          <button
            className={isSecondary ? 'primary' : ''}
            onClick={() => updatePageParams({ secondarySortBy: column.field })}
            style={{ padding: '0.25em 0.5em' }}
          >
            Use as tie-breaker ({getSortingText(valueType, sortBehavior)})
          </button>
        </td>
      </tr>
    </>
  );
}

function getSortingText(valueType: TableValueType, sortBehavior: SortBehavior) {
  switch (valueType) {
    case TableValueType.Population:
    case TableValueType.Count:
    case TableValueType.Decimal:
    case TableValueType.Date:
    case TableValueType.Enum:
      return sortBehavior === SortBehavior.Normal ? 'high to low' : 'low to high';
    case TableValueType.String:
      return sortBehavior === SortBehavior.Normal ? 'A to Z' : 'Z to A';
    default:
      enforceExhaustiveSwitch(valueType);
  }
}
export default TableColumnHovercard;
