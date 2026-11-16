import { parseFilterEntityID } from '@features/transforms/filtering/FilterEntityID';

import { EntityType } from '@entities/types/EntityTypes';

import Bitset from '../bitset/Bitset';
import type { TypeIndexes } from '../indexes/buildTypeIndexes';
import { addCsrRows } from '../indexes/Postings';
import { matchPrefix } from '../indexes/StringIndex';
import { normalizeForSearch } from '../search/normalizeSearch';
import { CONNECTION_TARGET, type ConnectionKind, SearchColumn } from '../snapshot/SnapshotTypes';
import { type EntityStore, getActiveIndexes, getTable, type TypeTable } from '../store/EntityStore';

function matchTargetsByCode(target: TypeTable, indexes: TypeIndexes, code: string): Bitset {
  const out = Bitset.fromRows(indexes.size, indexes.codeRows.get(code) ?? []);
  // Language filters also accept the ID: lang.codeDisplay === code || lang.ID === code
  if (target.type === EntityType.Language) {
    const row = target.rowById.get(code);
    if (row != null) out.add(row);
  }
  return out;
}

function matchTargetsByName(indexes: TypeIndexes, name: string): Bitset {
  const normalized = normalizeForSearch(name);
  // anyWordStartsWith(anything, '') is true, so every target matches
  if (normalized === '') return Bitset.range(indexes.size, indexes.size);
  return matchPrefix(indexes.search[SearchColumn.Display], normalized, indexes.size);
}

/**
 * Rows of `type` passing the connection filter, or null when the filter lets everything through
 * (empty value, nothing to match on, or the field is not applicable to the type).
 */
export function resolveConnectionFilter(
  store: EntityStore,
  type: EntityType,
  kind: ConnectionKind,
  filterValue: string | undefined,
): Bitset | null {
  if (!filterValue) return null;
  const table = getTable(store, type);
  if (!table.applicable[kind]) return null;

  const targetTable = getTable(store, CONNECTION_TARGET[kind]);
  const targetIndexes = getActiveIndexes(store, targetTable.type);
  const { name, code } = parseFilterEntityID(filterValue, targetTable.type);
  let targets: Bitset;
  if (code) targets = matchTargetsByCode(targetTable, targetIndexes, code);
  else if (name) targets = matchTargetsByName(targetIndexes, name);
  else return null;

  const indexes = getActiveIndexes(store, type);
  const postings = indexes.connections[kind];
  const out = new Bitset(indexes.size);
  if (postings) targets.forEach((targetRow) => addCsrRows(postings, targetRow, out));
  return out;
}
