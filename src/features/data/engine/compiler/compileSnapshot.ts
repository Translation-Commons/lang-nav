import type { LocaleSeparator } from '@features/params/LocalStorageParams';
import { getDefaultParams } from '@features/params/Profiles';

import type { LanguageSource } from '@entities/language/LanguageTypes';
import type { EntityData } from '@entities/types/EntityTypes';

import {
  type BaseSnapshotJson,
  type EncodedRecord,
  SNAPSHOT_FORMAT,
  type VariantSnapshotJson,
} from '../snapshot/SnapshotTypes';

import { computeDerived, dedupeAgainstBase } from './computeDerived';
import { getConnectionApplicability } from './deriveConnections';
import { getSortDirections } from './deriveSortKeys';
import { diffVariantRecords } from './diffVariant';
import { encodeAllRecords } from './encodeEntities';
import { createBaseRowTables, createVariantRowTables, type RowTables } from './rowTables';
import { runCorePipeline } from './runPipeline';

export type CompileOptions = {
  /** The first source is the base; every other source is stored as a variant on top of it. */
  sources: LanguageSource[];
  localeSeparator: LocaleSeparator;
  log?: (message: string) => void;
};

export type CompiledSnapshot = {
  base: BaseSnapshotJson;
  variants: Record<string, VariantSnapshotJson>;
  stats: Record<string, number>;
};

function getAliases(rows: RowTables, ents: Record<string, EntityData>) {
  const aliases: BaseSnapshotJson['aliases'] = [];
  for (const [key, ent] of Object.entries(ents)) {
    if (key === ent.ID) continue;
    const typeIndex = rows.indexOf.get(ent.type) ?? -1;
    const row = rows.tables[typeIndex]?.rowOf.get(ent.ID);
    if (row != null) aliases.push([key, typeIndex, row]);
  }
  return aliases;
}

async function compileBase(options: CompileOptions, stats: Record<string, number>) {
  const source = options.sources[0];
  const run = await runCorePipeline(source, options.localeSeparator);
  stats.baseLoadMs = run.loadMs;
  const rows = createBaseRowTables(run.core);
  const records = encodeAllRecords(rows) as EncodedRecord[][];
  const deriveStats = { missingTargets: 0 };
  const derived = computeDerived(rows, deriveStats);
  stats[`${source}.missingTargets`] = deriveStats.missingTargets;
  stats[`${source}.duplicateRefs`] = rows.stats.duplicateRefs;
  stats.queryableDuplicateIds = rows.stats.queryableDuplicateIds;
  const defaults = getDefaultParams();
  const base: BaseSnapshotJson = {
    format: SNAPSHOT_FORMAT,
    baseSource: source,
    localeSeparator: options.localeSeparator,
    types: rows.tables.map((table, t) => ({
      type: table.type,
      queryable: table.queryable,
      applicable: getConnectionApplicability(table.type),
      records: records[t],
    })),
    aliases: getAliases(rows, run.core.ents),
    sortDirections: getSortDirections(),
    populationDefaults: { min: defaults.populationMin, max: defaults.populationMax },
  };
  // Keep only what later variants need; the base run's object graph can be collected
  rows.tables.forEach((table) => (table.entities = []));
  return { base, rows, records, derived };
}

async function compileVariant(
  source: LanguageSource,
  options: CompileOptions,
  baseParts: Awaited<ReturnType<typeof compileBase>>,
  stats: Record<string, number>,
): Promise<VariantSnapshotJson> {
  const run = await runCorePipeline(source, options.localeSeparator);
  const rows = createVariantRowTables(baseParts.rows, run.core);
  const { patches, stats: diffStats } = diffVariantRecords(
    baseParts.records,
    encodeAllRecords(rows),
  );
  const deriveStats = { missingTargets: 0 };
  const derived = computeDerived(rows, deriveStats);
  Object.entries({
    ...diffStats,
    ...deriveStats,
    extraInVariant: rows.stats.extraInVariant,
  }).forEach(([key, value]) => (stats[`${source}.${key}`] = value));
  return {
    format: SNAPSHOT_FORMAT,
    source,
    patches,
    derived: derived.map((d, t) => dedupeAgainstBase(d, baseParts.derived[t])),
  };
}

export async function compileSnapshot(options: CompileOptions): Promise<CompiledSnapshot> {
  const log = options.log ?? (() => {});
  const stats: Record<string, number> = {};
  const [baseSource, ...others] = options.sources;
  if (baseSource == null) throw new Error('At least one language source is required');

  log(`Compiling base snapshot for ${baseSource}`);
  const baseParts = await compileBase(options, stats);
  const variants: Record<string, VariantSnapshotJson> = {
    [baseSource]: {
      format: SNAPSHOT_FORMAT,
      source: baseSource,
      patches: baseParts.rows.tables.map(() => []),
      derived: baseParts.derived,
    },
  };
  for (const source of others) {
    log(`Compiling ${source} variant`);
    variants[source] = await compileVariant(source, options, baseParts, stats);
  }
  return { base: baseParts.base, variants, stats };
}
