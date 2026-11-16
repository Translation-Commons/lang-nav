import Field from '@features/transforms/fields/Field';
import { SortBehavior } from '@features/transforms/sorting/SortTypes';

export type SortKey = string | number | null | undefined;

export type SortSpec = {
  field: Field;
  behavior?: SortBehavior;
  secondary?: Field;
  secondaryBehavior?: SortBehavior;
};

export type ResolvedSort = {
  key: string;
  primary: Field;
  direction: number;
  secondary: Field | null;
  secondaryDirection: number;
};

/** Mirrors one side of getSortFunctionParameterized: nulls last regardless of direction. */
function compareNullsLast(a: SortKey, b: SortKey, direction: number): number {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  if (a > b) return direction;
  if (b > a) return -direction;
  return 0;
}

/**
 * Same result as getSortFunctionParameterized, with the remaining ties broken by row so that a
 * cached order matches a stable Array.sort over input in row order.
 */
export function compareRows(
  a: number,
  b: number,
  primary: readonly SortKey[] | null,
  direction: number,
  secondary: readonly SortKey[] | null,
  secondaryDirection: number,
): number {
  return (
    (primary ? compareNullsLast(primary[a], primary[b], direction) : 0) ||
    (secondary ? compareNullsLast(secondary[a], secondary[b], secondaryDirection) : 0) ||
    a - b
  );
}

export function computeSortOrder(
  count: number,
  primary: readonly SortKey[] | null,
  direction: number,
  secondary: readonly SortKey[] | null,
  secondaryDirection: number,
): Uint32Array {
  const order = Array.from({ length: count }, (_, row) => row);
  order.sort((a, b) => compareRows(a, b, primary, direction, secondary, secondaryDirection));
  return Uint32Array.from(order);
}

/**
 * Resolves directions the same way getSortFunctionParameterized does. `normalDirections` holds
 * getNormalSortDirection for each field, recorded by the compiler.
 */
export function resolveSort(
  spec: SortSpec | undefined,
  normalDirections: Record<string, number>,
): ResolvedSort {
  const primary = spec?.field ?? Field.None;
  const behavior = spec?.behavior ?? SortBehavior.Normal;
  const secondaryBehavior = spec?.secondaryBehavior ?? SortBehavior.Normal;
  const secondary =
    spec?.secondary != null && spec.secondary !== Field.None && spec.secondary !== primary
      ? spec.secondary
      : null;
  const direction = getNormalDirection(primary, normalDirections) * behavior;
  const secondaryDirection =
    secondary != null ? getNormalDirection(secondary, normalDirections) * secondaryBehavior : 1;
  const key = [primary, direction, secondary ?? Field.None, secondary ? secondaryDirection : 0];
  return { key: key.join('|'), primary, direction, secondary, secondaryDirection };
}

function getNormalDirection(field: Field, normalDirections: Record<string, number>): number {
  if (field === Field.None) return 1;
  const direction = normalDirections[field];
  if (direction == null)
    throw new Error(`Sort field "${field}" was not compiled into the snapshot`);
  return direction;
}
