import fs from 'node:fs';
import path from 'node:path';

import { http, HttpHandler, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

function makeFileAvailable(filePath: string): HttpHandler {
  const absolutePath = path.resolve(__dirname, '../../public', filePath);
  const fileText = fs.readFileSync(absolutePath, 'utf8');
  return http.get(
    `*/${filePath}`,
    () =>
      new HttpResponse(fileText, {
        status: 200,
        headers: { 'Content-Type': 'text/tab-separated-values; charset=utf-8' },
      }),
  );
}

// Add/adjust handlers as your API layers evolve
export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true })),
  makeFileAvailable('data/languages.tsv'),
  makeFileAvailable('data/locales.tsv'),
  makeFileAvailable('data/writingSystems.tsv'),
];

export const server = setupServer(...handlers);
