import type { EncodedRecord, PatchJson } from '../snapshot/SnapshotTypes';

export type DiffStats = { patchedRecords: number; patchedFields: number; missingInVariant: number };

type RecordDiff = [set: EncodedRecord] | [set: EncodedRecord, deleted: string[]];

function diffRecord(base: EncodedRecord, next: EncodedRecord): RecordDiff | undefined {
  const set: EncodedRecord = {};
  const deleted: string[] = [];
  for (const key of new Set([...Object.keys(base), ...Object.keys(next)])) {
    if (!(key in next)) deleted.push(key);
    else if (JSON.stringify(base[key]) !== JSON.stringify(next[key])) set[key] = next[key];
  }
  if (deleted.length === 0 && Object.keys(set).length === 0) return undefined;
  return deleted.length > 0 ? [set, deleted] : [set];
}

/**
 * Top-level field patches turning the base records into the variant's records. Rows the variant
 * never reached are left as in the base and counted.
 */
export function diffVariantRecords(
  base: EncodedRecord[][],
  next: (EncodedRecord | undefined)[][],
): { patches: PatchJson[][]; stats: DiffStats } {
  const stats: DiffStats = { patchedRecords: 0, patchedFields: 0, missingInVariant: 0 };
  const patches = base.map((baseRecords, t) => {
    const typePatches: PatchJson[] = [];
    baseRecords.forEach((baseRecord, row) => {
      const nextRecord = next[t][row];
      if (nextRecord == null) {
        stats.missingInVariant++;
        return;
      }
      const diff = diffRecord(baseRecord, nextRecord);
      if (!diff) return;
      stats.patchedRecords++;
      stats.patchedFields += Object.keys(diff[0]).length + (diff[1]?.length ?? 0);
      typePatches.push([row, ...diff]);
    });
    return typePatches;
  });
  return { patches, stats };
}
