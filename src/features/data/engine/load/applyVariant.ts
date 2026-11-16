import { decodeValue } from '../snapshot/snapshotCodec';
import type { DerivedTypeJson, VariantDerivedJson } from '../snapshot/SnapshotTypes';
import type { EntityStore, LoadedVariant, UndoEntry } from '../store/EntityStore';

import { createResolver } from './relink';

function decodePatches(store: EntityStore, variant: LoadedVariant): void {
  if (variant.patchesDecoded) return;
  const resolve = createResolver(store.tables);
  for (const typePatches of variant.json.patches) {
    for (const [, set] of typePatches) {
      for (const key of Object.keys(set)) set[key] = decodeValue(set[key], resolve);
    }
  }
  variant.patchesDecoded = true;
}

function setField(undo: UndoEntry[], target: Record<string, unknown>, key: string, value: unknown) {
  undo.push({
    target,
    key,
    had: Object.prototype.hasOwnProperty.call(target, key),
    value: target[key],
  });
  target[key] = value;
}

function deleteField(undo: UndoEntry[], target: Record<string, unknown>, key: string) {
  if (!Object.prototype.hasOwnProperty.call(target, key)) return;
  undo.push({ target, key, had: true, value: target[key] });
  delete target[key];
}

/** Applies the variant's field patches on top of the base entities, recording how to undo them. */
export function applyVariantPatches(store: EntityStore, variant: LoadedVariant): void {
  decodePatches(store, variant);
  variant.json.patches.forEach((typePatches, typeIndex) => {
    const entities = store.tables[typeIndex].entities;
    for (const [row, set, deleted] of typePatches) {
      const target = entities[row] as unknown as Record<string, unknown>;
      for (const key of Object.keys(set)) setField(store.undo, target, key, set[key]);
      for (const key of deleted ?? []) deleteField(store.undo, target, key);
    }
  });
}

export function revertVariantPatches(store: EntityStore): void {
  for (let i = store.undo.length - 1; i >= 0; i--) {
    const { target, key, had, value } = store.undo[i];
    if (had) target[key] = value;
    else delete target[key];
  }
  store.undo = [];
}

function getPath(obj: unknown, path: string): unknown {
  return path
    .split('/')
    .reduce<unknown>((value, key) => (value as Record<string, unknown>)?.[key], obj);
}

// Copies each parent on the way down so the base variant's objects are never mutated
function setPathCopying(root: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('/');
  let node = root;
  for (const key of keys.slice(0, -1)) {
    node[key] = { ...((node[key] as Record<string, unknown>) ?? {}) };
    node = node[key] as Record<string, unknown>;
  }
  node[keys[keys.length - 1]] = value;
}

/** Fills in columns the compiler dropped because they were identical to the base variant. */
export function resolveDerived(
  derived: VariantDerivedJson,
  baseDerived: VariantDerivedJson | undefined,
): DerivedTypeJson {
  if (!derived.inherits?.length) return derived as DerivedTypeJson;
  if (!baseDerived) throw new Error('Variant inherits columns but the base variant is not loaded');
  const out: Record<string, unknown> = { ...derived };
  delete out.inherits;
  for (const path of derived.inherits) setPathCopying(out, path, getPath(baseDerived, path));
  return out as DerivedTypeJson;
}
