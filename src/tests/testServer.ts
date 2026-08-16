import './polyfills/storage';

import fs from 'node:fs';
import path from 'node:path';

import type { SetupServer } from 'msw/node';

let server: SetupServer | null = null;

function readFile(filePath: string) {
  const absolutePath = path.resolve(__dirname, '../../public', filePath);
  return fs.readFileSync(absolutePath, 'utf8');
}

/** Serves a file under `public/` for a relative fetch, exactly as the dev
 *  server does. Exported so tests can register handlers for files beyond the
 *  fixed set below, e.g. the supplemental territory files. */
export async function makeFileAvailable(filePath: string) {
  const { http, HttpResponse } = await import('msw');
  return http.get(
    `*/${filePath}`,
    () =>
      new HttpResponse(readFile(filePath), {
        status: 200,
        headers: { 'Content-Type': 'text/tab-separated-values; charset=utf-8' },
      }),
  );
}

export async function getServer(): Promise<SetupServer> {
  if (server) return server;
  const [{ http, HttpResponse }, { setupServer }] = await Promise.all([
    import('msw'),
    import('msw/node'),
  ]);

  const fileHandlers = await Promise.all(
    [
      'data/tc/languages.tsv',
      'data/tc/locales.tsv',
      'data/tc/writingSystems.tsv',
      'data/tc/territories.tsv',
    ].map(makeFileAvailable),
  );

  server = setupServer(
    http.get('/api/health', () => HttpResponse.json({ ok: true })),
    ...fileHandlers,
  );
  return server;
}
