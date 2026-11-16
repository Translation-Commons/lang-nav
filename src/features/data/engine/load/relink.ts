import type { EntityData } from '@entities/types/EntityTypes';

import { decodeRecordFields, type ResolveRef } from '../snapshot/snapshotCodec';
import type { BaseSnapshotJson, SnapshotManifest } from '../snapshot/SnapshotTypes';
import type { EntityStore, TypeTable } from '../store/EntityStore';

export function createResolver(tables: TypeTable[]): ResolveRef {
  return (typeIndex, row) => {
    const ent = tables[typeIndex]?.entities[row];
    if (ent == null) throw new Error(`Dangling reference to row ${row} of type ${typeIndex}`);
    return ent;
  };
}

function createTable(base: BaseSnapshotJson, typeIndex: number): TypeTable {
  const { type, queryable, applicable, records } = base.types[typeIndex];
  const entities = records as unknown as EntityData[];
  const byId = new Map<string, EntityData>();
  const rowById = new Map<string, number>();
  // First row wins, the same row the compiler points references at
  entities.forEach((ent, row) => {
    if (rowById.has(ent.ID)) return;
    byId.set(ent.ID, ent);
    rowById.set(ent.ID, row);
  });
  return { type, typeIndex, entities, byId, rowById, queryable, applicable };
}

/**
 * Turns the parsed base snapshot into a store. The parsed records become the entity objects and
 * every reference marker is replaced by the object it points to, in a single walk.
 */
export function relinkBaseSnapshot(
  base: BaseSnapshotJson,
  manifest: SnapshotManifest,
): EntityStore {
  const tables = base.types.map((_, typeIndex) => createTable(base, typeIndex));
  const resolve = createResolver(tables);
  for (const table of tables) {
    for (const ent of table.entities)
      decodeRecordFields(ent as unknown as Record<string, unknown>, resolve);
  }
  const aliases = new Map<string, EntityData>();
  for (const [key, typeIndex, row] of base.aliases)
    aliases.set(key, tables[typeIndex].entities[row]);

  return {
    manifest,
    meta: {
      baseSource: base.baseSource,
      localeSeparator: base.localeSeparator,
      sortDirections: base.sortDirections,
      populationDefaults: base.populationDefaults,
    },
    tables,
    tableByType: new Map(tables.map((table) => [table.type, table])),
    aliases,
    version: 0,
    variants: new Map(),
    undo: [],
  };
}
