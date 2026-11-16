// Node only: serves the loaders' fetch('data/...') calls from public/ on disk
import fs from 'node:fs';
import path from 'node:path';

export type PublicFileFetch = {
  servedFiles: Set<string>;
  missingFiles: Set<string>;
  /** Throws if any requested file was missing, in case a loader caught and logged the error. */
  assertAllServed: () => void;
  restore: () => void;
};

export function installPublicFileFetch(publicDir: string): PublicFileFetch {
  const originalFetch = globalThis.fetch;
  const servedFiles = new Set<string>();
  const missingFiles = new Set<string>();
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const file = path.resolve(publicDir, url.replace(/^\//, '').split('?')[0]);
    // The loaders never check res.ok, so a 404 would silently become an empty table
    if (!fs.existsSync(file)) {
      missingFiles.add(file);
      throw new Error(`Data file not found: ${file}`);
    }
    servedFiles.add(file);
    return new Response(fs.readFileSync(file, 'utf8'), { status: 200 });
  }) as typeof fetch;
  return {
    servedFiles,
    missingFiles,
    assertAllServed: () => {
      if (missingFiles.size > 0)
        throw new Error(`Missing data files: ${[...missingFiles].join(', ')}`);
      if (servedFiles.size === 0) throw new Error('No data files were read');
    },
    restore: () => (globalThis.fetch = originalFetch),
  };
}
