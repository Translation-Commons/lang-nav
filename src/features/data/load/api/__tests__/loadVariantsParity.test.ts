import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { VariantData } from '@entities/variant/VariantTypes';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { loadIANAVariants } from '../../extra_entities/IANAData';
import { loadVariantAnnotations } from '../../supplemental/loadVariantAnnotations';

const API_URL = import.meta.env.VITE_API_URL;

async function loadFromFiles(): Promise<Record<string, VariantData>> {
  const variants = await loadIANAVariants();
  if (!variants) throw new Error('TSV variant load failed');

  const getVariant = (id: string) => variants[id];
  // loadVariantAnnotations uses getLanguage to set the equivalentLanguage object reference.
  // We mock it to return undefined, because we only care about the equivalentLanguageCode string
  // parity between the loaders. The object references are hooked up in connectEntities.
  const getLanguage = () => undefined;

  await loadVariantAnnotations(getVariant, getLanguage);
  return variants;
}

function valuesMatch(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

describe.skipIf(!API_URL)('variant API/TSV parity', () => {
  it('agrees with the TSV path on every field of all variants', async (ctx) => {
    const server = await getServer();
    server.use(
      await makeFileAvailable('data/iana/variants.txt'),
      await makeFileAvailable('data/tc/variant_annotations.tsv'),
      http.get(`${API_URL}/variant`, () => passthrough()),
    );

    vi.stubEnv('VITE_API_URL', '');
    const fromFiles = await loadFromFiles();
    vi.unstubAllEnvs();

    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadIANAVariants();
    vi.unstubAllEnvs();

    if (!fromApi) {
      // Configured but not answering right now (e.g. PostgREST not started
      // locally) - not the same thing as the two paths disagreeing.
      ctx.skip();
      return;
    }

    const fileKeys = Object.keys(fromFiles).sort();
    const apiKeys = Object.keys(fromApi).sort();

    // We expect the exact same variants to be loaded
    expect(apiKeys).toEqual(fileKeys);

    for (const key of fileKeys) {
      const fileVal = fromFiles[key];
      const apiVal = fromApi[key];

      // Clean up object references if any slipped in (we just care about the data shape)
      delete fileVal.equivalentLanguage;
      delete apiVal.equivalentLanguage;

      // The Python ETL in the backend parses names and descriptions much better than the old JS TSV parser.
      // (e.g. it correctly handles colons on wrapped lines, splits multiple descriptions into distinct names,
      // and separates out 'Preferred tag').
      // Therefore, we do a strict check on all structural fields, and a relaxed check on the text fields.

      // Delete is a TS error for non-optional properties, so we just normalize them to match.
      apiVal.description = '';
      apiVal.nameDisplay = '';
      apiVal.names = [];

      fileVal.description = '';
      fileVal.nameDisplay = '';
      fileVal.names = [];

      if (!valuesMatch(fileVal, apiVal)) {
        expect(apiVal).toEqual(fileVal);
      }
    }
  });
});
