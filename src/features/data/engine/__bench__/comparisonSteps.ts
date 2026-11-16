import { LocaleSeparator } from '@features/params/PageParamTypes';

import type { LanguageSource } from '@entities/language/LanguageTypes';
import { EntityType } from '@entities/types/EntityTypes';

import { getQueryableEntities, runCorePipeline } from '../compiler/runPipeline';
import type { SnapshotReader } from '../load/loadSnapshot';
import { buildVariantIndexes, loadVariant, switchToVariant } from '../load/loadSnapshot';
import {
  clearComputedSortOrders,
  createQueryEngine,
  executeQuery,
  isSortPrecomputed,
} from '../query/runQuery';
import { type EntityStore, getTable } from '../store/EntityStore';

import { firstDifference, heapUsedMB, ms, timeRuns } from './benchUtils';
import { runCurrentQuery } from './currentApproach';
import { getParityCases, type ParityCase } from './parityCases';

export const COMPARED_TYPES = [EntityType.Language, EntityType.Locale];
export const RUNS = 5;

export type CurrentResult = { ids: string[]; total: number; first: number; median: number };
export type Summary = Record<string, string | number>[];
export type CaseRow = Record<string, string | number>;

export const caseKey = (source: string, type: string, name: string) =>
  `${source} | ${type} | ${name}`;

/** Fresh load + source update, then every parity case through the current filter and sort code. */
export async function measureCurrentSource(
  source: LanguageSource,
  results: Map<string, CurrentResult>,
  summary: Summary,
): Promise<void> {
  const heapBefore = heapUsedMB();
  const run = await runCorePipeline(source, LocaleSeparator.Underscore);
  const heapAfter = heapUsedMB();
  summary.push(
    { metric: `current: load + connect (${source})`, value: ms(run.loadMs) },
    { metric: `current: updateEntitiesBasedOnDataParams (${source})`, value: ms(run.updateMs) },
    {
      metric: `current: heap after load (${source})`,
      value: `${(heapAfter - heapBefore).toFixed(1)} MB`,
    },
  );
  const queryable = getQueryableEntities(run.core);
  for (const type of COMPARED_TYPES) {
    const ents = queryable[type];
    for (const { name, query } of getParityCases(type, ents, source)) {
      const timing = timeRuns(() => runCurrentQuery(ents, query), RUNS);
      results.set(caseKey(source, type, name), {
        ids: timing.result.map((ent) => ent.ID),
        total: ents.length,
        first: timing.first,
        median: timing.median,
      });
    }
  }
}

const ratio = (current: number, engine: number) => `${(current / engine).toFixed(1)}x`;

/** Vacuous-pass guards: results must be non-empty, and filters must actually drop rows. */
function checkCase(parityCase: ParityCase, ids: string[], total: number): string {
  if (parityCase.expectEmpty) return ids.length === 0 ? 'ok (expected empty)' : 'EXPECTED EMPTY';
  if (ids.length === 0) return 'EMPTY';
  if (parityCase.filtered && ids.length >= total) return 'FILTER NO-OP';
  return 'ok';
}

function measureCase(
  store: EntityStore,
  engine: ReturnType<typeof createQueryEngine>,
  parityCase: ParityCase,
  key: string,
  expected: CurrentResult | undefined,
): CaseRow {
  const { query } = parityCase;
  const timing = timeRuns(() => executeQuery(store, query), RUNS);
  // Sort orders computed at runtime stay cached, so "cold" clears them before every run
  const cold = isSortPrecomputed(store, query)
    ? undefined
    : timeRuns(
        () => executeQuery(store, query),
        RUNS,
        () => clearComputedSortOrders(store),
      );
  const cached = timeRuns(() => engine.run(query), RUNS);
  const ids = timing.result.ids;
  const diff = expected ? firstDifference(ids, expected.ids) : 0;
  return {
    case: key,
    parity:
      diff === -1
        ? 'ok'
        : `DIFF@${diff}: engine ${ids[diff]} vs current ${expected?.ids[diff]} (${ids.length} vs ${expected?.ids.length})`,
    check: checkCase(parityCase, ids, expected?.total ?? Infinity),
    rows: `${ids.length}/${expected?.total}`,
    'cur first': ms(expected?.first ?? NaN),
    'cur median': ms(expected?.median ?? NaN),
    'eng first': ms(timing.first),
    'eng median': ms(timing.median),
    'eng cold sort': cold ? ms(cold.median) : 'precomputed',
    'eng cached': ms(cached.median),
    'speedup first': expected ? ratio(expected.first, timing.first) : '',
    'speedup median': expected ? ratio(expected.median, timing.median) : '',
    'speedup cold': expected && cold ? ratio(expected.median, cold.median) : '',
  };
}

/** Activates the variant (timing each step), then runs and checks every parity case. */
export async function measureEngineSource(
  store: EntityStore,
  read: SnapshotReader,
  source: LanguageSource,
  current: Map<string, CurrentResult>,
  summary: Summary,
): Promise<CaseRow[]> {
  let start = performance.now();
  const variant = await loadVariant(store, source, read);
  summary.push({
    metric: `engine: read + parse ${source} variant`,
    value: ms(performance.now() - start),
  });
  start = performance.now();
  buildVariantIndexes(store, variant);
  summary.push({ metric: `engine: index build (${source})`, value: ms(performance.now() - start) });
  start = performance.now();
  switchToVariant(store, source);
  summary.push({
    metric: `engine: apply patches (${source})`,
    value: ms(performance.now() - start),
  });

  const engine = createQueryEngine(store);
  const rows: CaseRow[] = [];
  for (const type of COMPARED_TYPES) {
    const table = getTable(store, type);
    const ents = table.entities.slice(0, table.queryable);
    for (const parityCase of getParityCases(type, ents, source)) {
      const key = caseKey(source, type, parityCase.name);
      rows.push(measureCase(store, engine, parityCase, key, current.get(key)));
    }
  }
  return rows;
}
