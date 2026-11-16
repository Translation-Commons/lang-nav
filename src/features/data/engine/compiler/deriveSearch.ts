import type { EntityData } from '@entities/types/EntityTypes';

import { buildStringIndexJson } from '../indexes/StringIndex';
import { SearchColumn, type StringIndexJson } from '../snapshot/SnapshotTypes';

import type { RowTable } from './rowTables';

/** The strings each search mode passes to anyWordStartsWith, per entity. */
const SEARCH_STRINGS: Record<SearchColumn, (ent: EntityData) => readonly unknown[]> = {
  [SearchColumn.Names]: (ent) => ent.names ?? [],
  [SearchColumn.Code]: (ent) => [ent.codeDisplay],
  [SearchColumn.Display]: (ent) => [ent.nameDisplay],
  [SearchColumn.Endonym]: (ent) => [ent.nameEndonym ?? ''],
};

/** Covers every row, not only queryable ones, since connection filters match targets by name. */
export function deriveSearch(table: RowTable): Record<SearchColumn, StringIndexJson> {
  return Object.fromEntries(
    Object.values(SearchColumn).map((column) => [
      column,
      buildStringIndexJson(
        Array.from(table.entities, (ent) => (ent ? SEARCH_STRINGS[column](ent) : undefined)),
      ),
    ]),
  ) as Record<SearchColumn, StringIndexJson>;
}

export function deriveCodes(table: RowTable): (string | null)[] {
  return Array.from(table.entities, (ent) => ent?.codeDisplay ?? null);
}
