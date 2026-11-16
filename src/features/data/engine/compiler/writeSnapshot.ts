// Node only: used by the compiler script and the comparison test, never by the runtime engine
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  MANIFEST_PATH,
  SNAPSHOT_FORMAT,
  type SnapshotFileRef,
  type SnapshotManifest,
} from '../snapshot/SnapshotTypes';

import type { CompiledSnapshot } from './compileSnapshot';

const HASHED_FILE = /^(base|variant-[\w-]+)\.[0-9a-f]{16}\.json$/;

function writeHashed(outDir: string, name: string, value: unknown): SnapshotFileRef {
  const text = JSON.stringify(value);
  const hash = createHash('sha256').update(text).digest('hex').slice(0, 16);
  const filePath = `${name}.${hash}.json`;
  fs.writeFileSync(path.join(outDir, filePath), text);
  return { path: filePath, hash, bytes: Buffer.byteLength(text) };
}

/** Writes content-hashed snapshot files plus manifest.json, removing stale snapshot files. */
export function writeSnapshot(outDir: string, compiled: CompiledSnapshot): SnapshotManifest {
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of fs.readdirSync(outDir)) {
    if (HASHED_FILE.test(file)) fs.rmSync(path.join(outDir, file));
  }
  const variants: Record<string, SnapshotFileRef> = {};
  for (const [source, variant] of Object.entries(compiled.variants)) {
    variants[source] = writeHashed(outDir, `variant-${source}`, variant);
  }
  const manifest: SnapshotManifest = {
    format: SNAPSHOT_FORMAT,
    createdAt: new Date().toISOString(),
    baseSource: compiled.base.baseSource,
    base: writeHashed(outDir, 'base', compiled.base),
    variants,
    stats: compiled.stats,
  };
  fs.writeFileSync(path.join(outDir, MANIFEST_PATH), JSON.stringify(manifest, null, 2));
  return manifest;
}

export function createFileReader(dir: string): (filePath: string) => Promise<string> {
  return async (filePath) => fs.promises.readFile(path.join(dir, filePath), 'utf8');
}
