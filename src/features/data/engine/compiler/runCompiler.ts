// Node entry point, loaded by scripts/compile-engine-snapshot.mjs through Vite's SSR loader
import path from 'node:path';

import { LocaleSeparator } from '@features/params/LocalStorageParams';

import { LanguageSource } from '@entities/language/LanguageTypes';

import { compileSnapshot } from './compileSnapshot';
import { installPublicFileFetch } from './publicFileFetch';
import { writeSnapshot } from './writeSnapshot';

export const DEFAULT_SNAPSHOT_SOURCES = [LanguageSource.Combined, LanguageSource.ISO];

function parseSources(args: string[]): LanguageSource[] {
  if (args.length === 0) return DEFAULT_SNAPSHOT_SOURCES;
  const known = Object.values(LanguageSource) as string[];
  const unknown = args.filter((arg) => !known.includes(arg));
  if (unknown.length > 0) throw new Error(`Unknown language sources: ${unknown.join(', ')}`);
  return args as LanguageSource[];
}

export async function runCompiler({
  root,
  outDir,
  args = [],
}: {
  root: string;
  outDir: string;
  args?: string[];
}): Promise<void> {
  const sources = parseSources(args);
  const publicFetch = installPublicFileFetch(path.join(root, 'public'));
  try {
    const start = performance.now();
    const compiled = await compileSnapshot({
      sources,
      localeSeparator: LocaleSeparator.Underscore,
      log: (message) => console.log(`[engine] ${message}`),
    });
    publicFetch.assertAllServed();
    compiled.stats.dataFilesRead = publicFetch.servedFiles.size;
    const manifest = writeSnapshot(outDir, compiled);
    console.log(
      `[engine] Compiled ${sources.join(', ')} in ${(performance.now() - start).toFixed(0)} ms`,
    );
    console.table({
      base: manifest.base,
      ...Object.fromEntries(Object.entries(manifest.variants).map(([k, v]) => [`variant ${k}`, v])),
    });
    console.log(`[engine] Read ${publicFetch.servedFiles.size} data files`);
    console.table(manifest.stats);
    console.log(`[engine] Wrote ${path.relative(root, outDir)}/manifest.json`);
  } finally {
    publicFetch.restore();
  }
}
