import type { EntityData, EntityType } from '@entities/types/EntityTypes';

import type { TypeIndexes } from '../indexes/buildTypeIndexes';
import type {
  ConnectionKind,
  PopulationDefaults,
  SnapshotManifest,
  VariantSnapshotJson,
} from '../snapshot/SnapshotTypes';

export type TypeTable = {
  type: EntityType;
  typeIndex: number;
  entities: EntityData[];
  byId: Map<string, EntityData>;
  rowById: Map<string, number>;
  /** Rows [0, queryable) are the entities the current app would list for this type, in order. */
  queryable: number;
  applicable: Record<ConnectionKind, boolean>;
};

export type UndoEntry = {
  target: Record<string, unknown>;
  key: string;
  had: boolean;
  value: unknown;
};

export type StoreMeta = {
  baseSource: string;
  localeSeparator: string;
  sortDirections: Record<string, number>;
  populationDefaults: PopulationDefaults;
};

export type LoadedVariant = {
  json: VariantSnapshotJson;
  patchesDecoded: boolean;
  indexes?: TypeIndexes[];
};

export type EntityStore = {
  manifest: SnapshotManifest;
  meta: StoreMeta;
  tables: TypeTable[];
  tableByType: Map<EntityType, TypeTable>;
  aliases: Map<string, EntityData>;
  /** Bumped whenever the active source variant changes; part of every result cache key. */
  version: number;
  source?: string;
  indexes?: TypeIndexes[];
  variants: Map<string, LoadedVariant>;
  undo: UndoEntry[];
};

export function getTable(store: EntityStore, type: EntityType): TypeTable {
  const table = store.tableByType.get(type);
  if (!table) throw new Error(`No entities of type ${type} in the snapshot`);
  return table;
}

export function getEntity(store: EntityStore, id: string): EntityData | undefined {
  for (const table of store.tables) {
    const ent = table.byId.get(id);
    if (ent) return ent;
  }
  return store.aliases.get(id);
}

export function getActiveIndexes(store: EntityStore, type: EntityType): TypeIndexes {
  const indexes = store.indexes?.[getTable(store, type).typeIndex];
  if (!indexes) throw new Error('No source variant is active; call activateSource first');
  return indexes;
}
