import { buildTypeIndexes, type TypeIndexes } from '../indexes/buildTypeIndexes';
import {
  type BaseSnapshotJson,
  MANIFEST_PATH,
  SNAPSHOT_FORMAT,
  type SnapshotManifest,
  type VariantSnapshotJson,
} from '../snapshot/SnapshotTypes';
import type { EntityStore, LoadedVariant } from '../store/EntityStore';

import { applyVariantPatches, resolveDerived, revertVariantPatches } from './applyVariant';
import { relinkBaseSnapshot } from './relink';

/** Reads a snapshot file by its path relative to the snapshot directory (fs in Node, fetch in the browser). */
export type SnapshotReader = (path: string) => Promise<string>;

function checkFormat(format: number, what: string): void {
  if (format !== SNAPSHOT_FORMAT) {
    throw new Error(`Unsupported ${what} format ${format}, expected ${SNAPSHOT_FORMAT}`);
  }
}

export async function loadSnapshotBase(read: SnapshotReader): Promise<EntityStore> {
  const manifest = JSON.parse(await read(MANIFEST_PATH)) as SnapshotManifest;
  checkFormat(manifest.format, 'manifest');
  const base = JSON.parse(await read(manifest.base.path)) as BaseSnapshotJson;
  checkFormat(base.format, 'base snapshot');
  return relinkBaseSnapshot(base, manifest);
}

export async function loadVariant(
  store: EntityStore,
  source: string,
  read: SnapshotReader,
): Promise<LoadedVariant> {
  const cached = store.variants.get(source);
  if (cached) return cached;
  const ref = store.manifest.variants[source];
  if (!ref) throw new Error(`Source variant "${source}" was not compiled into the snapshot`);
  const json = JSON.parse(await read(ref.path)) as VariantSnapshotJson;
  checkFormat(json.format, `${source} variant`);
  const variant: LoadedVariant = { json, patchesDecoded: false };
  store.variants.set(source, variant);
  if (source !== store.meta.baseSource && json.derived.some((d) => d.inherits?.length)) {
    await loadVariant(store, store.meta.baseSource, read);
  }
  return variant;
}

export function buildVariantIndexes(store: EntityStore, variant: LoadedVariant): TypeIndexes[] {
  if (variant.indexes) return variant.indexes;
  const baseDerived = store.variants.get(store.meta.baseSource)?.json.derived;
  variant.indexes = store.tables.map((table) =>
    buildTypeIndexes(
      resolveDerived(variant.json.derived[table.typeIndex], baseDerived?.[table.typeIndex]),
      table.entities.length,
      table.queryable,
    ),
  );
  // Other variants inherit columns from the base JSON, so only non-base derived data can go
  if (variant.json.source !== store.meta.baseSource) variant.json.derived = [];
  return variant.indexes;
}

/** Swaps the live entities and indexes to an already loaded variant. */
export function switchToVariant(store: EntityStore, source: string): void {
  const variant = store.variants.get(source);
  if (!variant) throw new Error(`Source variant "${source}" is not loaded`);
  if (store.source === source && store.indexes) return;
  revertVariantPatches(store);
  applyVariantPatches(store, variant);
  store.indexes = buildVariantIndexes(store, variant);
  store.source = source;
  store.version++;
}

export async function activateSource(
  store: EntityStore,
  source: string,
  read: SnapshotReader,
): Promise<void> {
  await loadVariant(store, source, read);
  switchToVariant(store, source);
}

export async function loadSnapshot(read: SnapshotReader, source?: string): Promise<EntityStore> {
  const store = await loadSnapshotBase(read);
  await activateSource(store, source ?? store.meta.baseSource, read);
  return store;
}
