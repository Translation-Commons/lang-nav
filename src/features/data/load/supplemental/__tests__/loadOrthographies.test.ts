import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadOrthographies } from '../loadOrthographies';

const TSV = [
  'ISO_639_3\tScript\tBase_Characters',
  'srp\tLatn\tabcčć',
  'srp\tLatn\tabcdž', // a second Latin orthography
  'srp\tCyrl\tабвг',
].join('\n');

describe('loadOrthographies', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('prefixes IDs so they cannot replace the locale with the same code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: async () => TSV }));

    const orthographies = await loadOrthographies();

    expect(Object.keys(orthographies ?? {})).toEqual([
      'orth.srp_Latn',
      'orth.srp_Latn_2',
      'orth.srp_Cyrl',
    ]);
    expect(orthographies?.['orth.srp_Latn_2']).toMatchObject({
      ID: 'orth.srp_Latn_2',
      codeDisplay: 'srp_Latn_2',
      instance: 2,
    });
  });
});
