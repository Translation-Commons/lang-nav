import { describe, expect, it } from 'vitest';

import { anyWordStartsWith } from '@shared/lib/stringUtils';

import { buildStringIndexJson, matchPrefix, stringIndexFromJson } from '../indexes/StringIndex';
import { normalizeForSearch } from '../search/normalizeSearch';

const STRINGS_BY_ROW: string[][] = [
  ['German', 'Deutsch'],
  ['Swiss German', 'Schwyzerdütsch'],
  ['Algerian Arabic'],
  ['Français', 'French'],
  ['Indo-European'],
  ['Hindi', 'हिन्दी'],
  ['Tok Pisin'],
  [],
  ["Q'eqchi'", 'Kekchi'],
  ['ger_DE'],
];

const QUERIES = [
  'ger',
  'GER',
  'german',
  'swiss ger',
  'swiss  ger',
  'fran',
  'franç',
  'indo-eu',
  'indo-',
  'european',
  'hin',
  'हि',
  'tok p',
  "q'eq",
  'eqchi',
  'de',
  'ger_d',
  'x',
];

function expected(query: string): number[] {
  return STRINGS_BY_ROW.flatMap((strings, row) =>
    strings.some((s) => anyWordStartsWith(s, query)) ? [row] : [],
  );
}

describe('StringIndex prefix matching', () => {
  const index = stringIndexFromJson(buildStringIndexJson(STRINGS_BY_ROW));

  it.each(QUERIES)('matches anyWordStartsWith for %j', (query) => {
    const rows = matchPrefix(index, normalizeForSearch(query), STRINGS_BY_ROW.length).toArray();
    expect(rows).toEqual(expected(query));
  });

  it('stores each row once per key even when several strings share a word', () => {
    const json = buildStringIndexJson([['German', 'German dialects']]);
    const german = json.tokens.indexOf('german');
    expect(json.tokenRows.r.slice(json.tokenRows.o[german], json.tokenRows.o[german + 1])).toEqual([
      0,
    ]);
  });

  it('ignores non-string values', () => {
    const json = buildStringIndexJson([[undefined, 3, 'ok']]);
    expect(json.tokens).toEqual(['ok']);
  });
});
