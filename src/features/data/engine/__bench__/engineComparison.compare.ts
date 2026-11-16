// @vitest-environment node
// Parity + benchmark of the data engine against the current filtering and sorting code, on the
// real data in public/. Slow (minutes), so it only runs with `npm run engine:compare`.
import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { LocaleSeparator } from '@features/params/PageParamTypes';

import { LanguageSource } from '@entities/language/LanguageTypes';

import { compileSnapshot } from '../compiler/compileSnapshot';
import { installPublicFileFetch } from '../compiler/publicFileFetch';
import { createFileReader, writeSnapshot } from '../compiler/writeSnapshot';
import { loadSnapshotBase } from '../load/loadSnapshot';
import { MANIFEST_PATH, type SnapshotManifest } from '../snapshot/SnapshotTypes';

import { fileSizes, HAS_GC, heapUsedMB, mb, ms, formatTable, timeAsync } from './benchUtils';
import {
  type CaseRow,
  type CurrentResult,
  measureCurrentSource,
  measureEngineSource,
  RUNS,
  type Summary,
} from './comparisonSteps';
import { EXPECTED_EMPTY_CASES } from './parityCases';

const ROOT = path.resolve(__dirname, '../../../../..');
const OUT_DIR = path.join(ROOT, '.cache/engine-compare');
const SOURCES = [LanguageSource.Combined, LanguageSource.ISO];
const SCOPE =
  'Scope: core data + updateEntitiesBasedOnDataParams only, no supplemental data (census, ' +
  'Wikipedia, ...). This is parity against a core-only state, not exactly what the app renders ' +
  'after its supplemental load. The organization filter is not covered.';

/** Returns only the manifest so the compiled JSON is garbage before the engine heap is measured. */
async function compileAndWrite(summary: Summary): Promise<SnapshotManifest> {
  const compiled = await timeAsync(() =>
    compileSnapshot({ sources: SOURCES, localeSeparator: LocaleSeparator.Underscore }),
  );
  summary.push({ metric: `compiler run (${SOURCES.join(' + ')})`, value: ms(compiled.ms) });
  return writeSnapshot(OUT_DIR, compiled.result);
}

function summarizeSnapshot(manifest: SnapshotManifest, summary: Summary): void {
  const files = [
    MANIFEST_PATH,
    manifest.base.path,
    ...Object.values(manifest.variants).map((v) => v.path),
  ];
  const sizes = fileSizes(files.map((file) => path.join(OUT_DIR, file)));
  summary.push({
    metric: 'engine: snapshot raw / gzip',
    value: `${mb(sizes.raw)} / ${mb(sizes.gzip)}`,
  });
  for (const [name, ref] of [
    ['base', manifest.base],
    ...Object.entries(manifest.variants),
  ] as const) {
    summary.push({
      metric: `engine: file ${name === 'base' ? name : `variant ${name}`}`,
      value: mb(ref.bytes),
    });
  }
  for (const [key, value] of Object.entries(manifest.stats)) {
    summary.push({ metric: `compile stat ${key}`, value });
  }
}

describe('data engine vs current approach', () => {
  it(
    'returns identical ordered IDs and reports timings',
    async () => {
      const summary: Summary = [{ metric: 'forced GC for heap numbers', value: String(HAS_GC) }];
      const current = new Map<string, CurrentResult>();
      const publicFetch = installPublicFileFetch(path.join(ROOT, 'public'));
      try {
        for (const source of SOURCES) await measureCurrentSource(source, current, summary);
        publicFetch.assertAllServed();
        const tsv = fileSizes(publicFetch.servedFiles);
        summary.push({
          metric: `current: ${publicFetch.servedFiles.size} data files raw / gzip`,
          value: `${mb(tsv.raw)} / ${mb(tsv.gzip)}`,
        });
        summarizeSnapshot(await compileAndWrite(summary), summary);
      } finally {
        publicFetch.restore();
      }

      const read = createFileReader(OUT_DIR);
      const heapBefore = heapUsedMB();
      const { result: store, ms: baseMs } = await timeAsync(() => loadSnapshotBase(read));
      summary.push({ metric: 'engine: read + parse + relink base', value: ms(baseMs) });

      const rows: CaseRow[] = [];
      for (const source of SOURCES) {
        rows.push(...(await measureEngineSource(store, read, source, current, summary)));
        if (source === SOURCES[0]) {
          summary.push({
            metric: `engine: heap after load (${source}, indexes built, queries cached)`,
            value: `${(heapUsedMB() - heapBefore).toFixed(1)} MB`,
          });
        }
      }

      const report = [
        SCOPE,
        formatTable('Load, size, and memory', summary),
        formatTable(
          `Queries (first = first call; median of ${RUNS} after a warmup; cold sort = median with ` +
            'runtime sort orders cleared before each run). Exempt from the non-empty check: ' +
            EXPECTED_EMPTY_CASES.join(', '),
          rows,
        ),
      ].join('\n');
      // Vitest may hide console output of passing tests, so the report also goes to a file
      fs.writeFileSync(path.join(OUT_DIR, 'results.txt'), report);
      console.log(report);
      const failures = rows
        .filter((row) => row.parity !== 'ok' || !String(row.check).startsWith('ok'))
        .map((row) => `${row.case}: parity ${row.parity}, check ${row.check}`);
      expect(failures).toEqual([]);
    },
    60 * 60_000,
  );
});
