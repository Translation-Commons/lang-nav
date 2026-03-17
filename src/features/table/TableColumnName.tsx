import Hoverable from '@features/layers/hovercard/Hoverable';
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

function TableColumnName<T extends EntityData>({ column }: { column: TableColumn<T> }) {
  return (
    <Hoverable
      hoverContent={<ColumnDescriptionAndInteractives column={column} />}
      style={{ color: 'var(--color-text)', display: 'inline' }}
    >
      {column.label ?? column.key}
    </Hoverable>
  );
}

function ColumnDescriptionAndInteractives<T extends EntityData>({
  column,
}: {
  column: TableColumn<T>;
}) {
  const isSortable = column.field && isFieldApplicable(column.field, TransformEnum.Sort);
  const isFilterable = column.field && isFieldApplicable(column.field, TransformEnum.Filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
      <strong>{column.label ?? column.key}</strong>
      {column.description && <div>{column.description}</div>}
      {isSortable && <ColumnSortControls column={column} />}
      {isFilterable && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5em', alignItems: 'center' }}>
          <strong>Filter:</strong>
          <div>
            <FilterSelector field={column.field!} />
          </div>
        </div>
      )}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
      <div>
        <strong>Sort:</strong>{' '}
        {sortBy === column.field
          ? "It's currently sorting from " + getSortingText(valueType, sortBehavior)
          : 'Click to sort by this column'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5em' }}>
        {[SortBehavior.Normal, SortBehavior.Reverse].map((sb) => (
          <button
            key={sb}
            className={isActive && sortBehavior === sb ? 'primary' : ''}
            onClick={() => updatePageParams({ sortBy: column.field, sortBehavior: sb })}
            style={{ padding: '0.25em 0.5em' }}
          >
            Sort {getSortingText(valueType, sb)}
          </button>
        ))}
      </div>
      <div>... or tie break regular sorting by this column</div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5em' }}>
        <button
          className={isSecondary ? 'primary' : ''}
          onClick={() => updatePageParams({ secondarySortBy: column.field })}
          style={{ padding: '0.25em 0.5em' }}
        >
          Secondary sort {getSortingText(valueType, sortBehavior)}
        </button>
      </div>
    </div>
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
export default TableColumnName;
