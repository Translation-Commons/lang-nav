import './polyfills/storage';

import fs from 'node:fs';
import path from 'node:path';

import type { SetupServer } from 'msw/node';

let server: SetupServer | null = null;

function readFile(filePath: string) {
  const absolutePath = path.resolve(__dirname, '../../public', filePath);
  return fs.readFileSync(absolutePath, 'utf8');
}

export async function getServer(): Promise<SetupServer> {
  if (server) return server;
  const [{ http, HttpResponse }, { setupServer }] = await Promise.all([import('msw'), import('msw/node')]);

  const makeFileAvailable = (filePath: string) =>
    http.get(
      `*/${filePath}`,
      () =>
        new HttpResponse(readFile(filePath), {
          status: 200,
          headers: { 'Content-Type': 'text/tab-separated-values; charset=utf-8' },
        }),
    );

  const handlers = [
    http.get('/api/health', () => HttpResponse.json({ ok: true })),
    makeFileAvailable('data/languages.tsv'),
    makeFileAvailable('data/locales.tsv'),
    makeFileAvailable('data/writingSystems.tsv'),
    makeFileAvailable('data/territories.tsv'),
  ];

  server = setupServer(...handlers);
  return server;
}
