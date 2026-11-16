import type { CoreData } from '@features/data/load/loadCoreDataArrays';

import type { EntityData, EntityType } from '@entities/types/EntityTypes';

import { TYPE_ORDER } from '../snapshot/SnapshotTypes';

import { getQueryableEntities } from './runPipeline';

export type RowTable = {
  type: EntityType;
  ids: string[];
  /** Objects of the pipeline run being encoded, by row. Undefined until discovered. */
  entities: (EntityData | undefined)[];
  rowOf: Map<string, number>;
  queryable: number;
};

export type RowStats = {
  duplicateRefs: number;
  extraInVariant: number;
  queryableDuplicateIds: number;
};

export type RowTables = {
  mode: 'base' | 'variant';
  tables: RowTable[];
  indexOf: Map<EntityType, number>;
  stats: RowStats;
};

function appendRow(table: RowTable, ent: EntityData): number {
  const row = table.ids.length;
  table.ids.push(ent.ID);
  table.entities.push(ent);
  if (!table.rowOf.has(ent.ID)) table.rowOf.set(ent.ID, row);
  return row;
}

/** Rows start with the queryable entities in list order, then every other entity in `ents`. */
export function createBaseRowTables(core: CoreData): RowTables {
  const queryable = getQueryableEntities(core);
  const tables = TYPE_ORDER.map((type): RowTable => {
    const table: RowTable = { type, ids: [], entities: [], rowOf: new Map(), queryable: 0 };
    queryable[type].forEach((ent) => appendRow(table, ent));
    table.queryable = table.ids.length;
    return table;
  });
  const queryableDuplicateIds = tables.reduce((sum, t) => sum + t.queryable - t.rowOf.size, 0);
  // References and rowById resolve an ID to one row, but the current code pins every duplicate
  if (queryableDuplicateIds > 0) {
    throw new Error(`${queryableDuplicateIds} duplicate IDs in the queryable lists`);
  }
  const indexOf = new Map(TYPE_ORDER.map((type, i) => [type, i]));
  const rowTables: RowTables = {
    mode: 'base',
    tables,
    indexOf,
    stats: { duplicateRefs: 0, extraInVariant: 0, queryableDuplicateIds },
  };
  Object.values(core.ents).forEach((ent) => rowFor(rowTables, ent));
  return rowTables;
}

/** Reuses the base rows so a variant can be expressed as patches on the base records. */
export function createVariantRowTables(base: RowTables, core: CoreData): RowTables {
  const queryable = getQueryableEntities(core);
  const tables = base.tables.map((baseTable): RowTable => {
    const list = queryable[baseTable.type];
    if (list.length !== baseTable.queryable || list.some((ent, i) => ent.ID !== baseTable.ids[i])) {
      throw new Error(`${baseTable.type} list differs from the base run; rows would not line up`);
    }
    const entities: (EntityData | undefined)[] = new Array(baseTable.ids.length);
    list.forEach((ent, row) => (entities[row] = ent));
    return { ...baseTable, entities };
  });
  const rowTables: RowTables = {
    mode: 'variant',
    tables,
    indexOf: base.indexOf,
    stats: { duplicateRefs: 0, extraInVariant: 0, queryableDuplicateIds: 0 },
  };
  Object.values(core.ents).forEach((ent) => rowFor(rowTables, ent));
  return rowTables;
}

/**
 * Row of an entity, appending it in base mode if it was not seen yet. In variant mode unknown
 * entities cannot get a row and return -1.
 */
export function rowFor(rowTables: RowTables, ent: EntityData): number {
  const table = rowTables.tables[rowTables.indexOf.get(ent.type) ?? -1];
  if (!table) throw new Error(`Unknown entity type ${ent.type}`);
  const row = table.rowOf.get(ent.ID);
  if (row == null) {
    if (rowTables.mode === 'variant') {
      rowTables.stats.extraInVariant++;
      return -1;
    }
    return appendRow(table, ent);
  }
  if (table.entities[row] == null) table.entities[row] = ent;
  else if (table.entities[row] !== ent) rowTables.stats.duplicateRefs++;
  return row;
}

export function getTableFor(rowTables: RowTables, type: EntityType): RowTable {
  return rowTables.tables[rowTables.indexOf.get(type) ?? -1];
}
