// [DEBUG-perf] Throwaway timing harness. Delete after diagnosis.
import fs from 'node:fs';
import path from 'node:path';

import { act, renderHook } from '@testing-library/react';
import { beforeAll, describe, it, vi } from 'vitest';

import { useCoreData } from '@features/data/load/CoreData';
import Field from '@features/transforms/fields/Field';
import {
  buildFilterByLanguage,
  buildFilterByLanguageFamily,
  buildFilterByTerritory,
  buildFilterByWritingSystem,
} from '@features/transforms/filtering/filterByConnections';
import getSubstringFilterOnQuery from '@features/transforms/search/getSubstringFilterOnQuery';
import { getSortFunctionParameterized } from '@features/transforms/sorting/sort';
import getField from '@features/transforms/fields/getField';
import { SearchableField } from '@features/params/PageParamTypes';

import type { EntityData } from '@entities/types/EntityTypes';

let data: ReturnType<typeof useCoreData>['coreData'];

function time(label: string, fn: () => unknown, runs = 5) {
  fn();
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t = performance.now();
    fn();
    samples.push(performance.now() - t);
  }
  samples.sort((a, b) => a - b);
  console.log(`[DEBUG-perf] ${label.padEnd(48)} median ${samples[runs >> 1].toFixed(1)} ms`);
}

beforeAll(async () => {
  vi.stubGlobal('fetch', async (url: string) => {
    const file = path.resolve(__dirname, '../../public', String(url).replace(/^\//, ''));
    const body = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    return new Response(body, { status: fs.existsSync(file) ? 200 : 404 });
  });
  const { result } = renderHook(() => useCoreData());
  const t = performance.now();
  await act(async () => {
    await result.current.loadCoreData();
  });
  console.log(`[DEBUG-perf] load+connect core data: ${(performance.now() - t).toFixed(0)} ms`);
  data = result.current.coreData;
}, 120_000);

describe('[DEBUG-perf] filter + sort cost', () => {
  it('times filters and sorts', () => {
    const sets: Record<string, EntityData[]> = {
      languages: data.languages,
      locales: data.locales,
      territories: data.territories,
    };
    for (const [k, v] of Object.entries(sets)) console.log(`[DEBUG-perf] ${k}: ${v.length}`);

    for (const [name, ents] of Object.entries(sets)) {
      time(`${name} search "ger"`, () =>
        ents.filter(getSubstringFilterOnQuery('ger', SearchableField.CodeOrNameAny)),
      );
      time(`${name} territory "India"`, () => ents.filter(buildFilterByTerritory('India')));
      time(`${name} language "Hindi"`, () => ents.filter(buildFilterByLanguage('Hindi')));
      time(`${name} family "Indo-European"`, () =>
        ents.filter(buildFilterByLanguageFamily('Indo-European')),
      );
      time(`${name} writing system "Latin"`, () =>
        ents.filter(buildFilterByWritingSystem('Latin')),
      );
      for (const f of [Field.Population, Field.Name, Field.CountOfCountries]) {
        const sortFn = getSortFunctionParameterized(f, undefined, Field.Name);
        time(`${name} sort by ${f}`, () => ents.slice().sort(sortFn));
      }

      for (const f of [Field.Population, Field.CountOfCountries]) {
        time(`${name} KEYED sort by ${f}`, () => {
          const keyed = ents.map((e) => ({ e, k: getField(e, f), k2: getField(e, Field.Name) }));
          keyed.sort((a, b) => {
            if (a.k == null) return b.k == null ? String(a.k2).localeCompare(String(b.k2)) : 1;
            if (b.k == null) return -1;
            return a.k > b.k ? -1 : a.k < b.k ? 1 : 0;
          });
          return keyed.map((x) => x.e);
        });
      }
      const norm = new Map<EntityData, string[]>();
      for (const e of ents)
        norm.set(e, e.names.flatMap((n) => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^\p{L}\p{N}]/u)));
      time(`${name} CACHED search "ger"`, () =>
        ents.filter((e) => norm.get(e)!.some((w) => w.startsWith('ger'))),
      );
    }
  }, 120_000);
});
