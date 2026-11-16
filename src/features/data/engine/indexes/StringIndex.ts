import Bitset from '../bitset/Bitset';
import { normalizeForSearch, queryNeedsWholeString, splitWords } from '../search/normalizeSearch';
import type { StringIndexJson } from '../snapshot/SnapshotTypes';

import { addCsrRows, buildCsrJson, type Csr, csrFromJson } from './Postings';

export type StringIndex = {
  tokens: string[];
  tokenRows: Csr;
  fulls: string[];
  fullRows: Csr;
};

function toSortedCsr(keyRows: Map<string, number[]>): {
  keys: string[];
  csr: StringIndexJson['tokenRows'];
} {
  // Default sort compares UTF-16 code units, the same order that `<` and startsWith rely on
  const keys = [...keyRows.keys()].sort();
  return { keys, csr: buildCsrJson(keys.map((key) => keyRows.get(key))) };
}

function addKey(keyRows: Map<string, number[]>, key: string, row: number): void {
  let rows = keyRows.get(key);
  if (rows == null) keyRows.set(key, (rows = []));
  if (rows[rows.length - 1] !== row) rows.push(row);
}

/** stringsByRow[row] holds the raw (unnormalized) strings searchable for that row. */
export function buildStringIndexJson(
  stringsByRow: readonly (readonly unknown[] | undefined)[],
): StringIndexJson {
  const tokenRows = new Map<string, number[]>();
  const fullRows = new Map<string, number[]>();
  stringsByRow.forEach((strings, row) => {
    for (const raw of strings ?? []) {
      if (typeof raw !== 'string') continue;
      const normalized = normalizeForSearch(raw);
      if (normalized === '') continue; // only an empty query matches it, which is never indexed
      addKey(fullRows, normalized, row);
      for (const word of splitWords(normalized)) if (word !== '') addKey(tokenRows, word, row);
    }
  });
  const tokens = toSortedCsr(tokenRows);
  const fulls = toSortedCsr(fullRows);
  return { tokens: tokens.keys, tokenRows: tokens.csr, fulls: fulls.keys, fullRows: fulls.csr };
}

export function stringIndexFromJson(json: StringIndexJson): StringIndex {
  return {
    tokens: json.tokens,
    tokenRows: csrFromJson(json.tokenRows),
    fulls: json.fulls,
    fullRows: csrFromJson(json.fullRows),
  };
}

function lowerBound(keys: string[], query: string): number {
  let lo = 0;
  let hi = keys.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (keys[mid] < query) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Rows where anyWordStartsWith(str, query) holds for at least one indexed string.
 * The query must already be normalized and non-empty.
 */
export function matchPrefix(index: StringIndex, normalizedQuery: string, size: number): Bitset {
  const wholeString = queryNeedsWholeString(normalizedQuery);
  const keys = wholeString ? index.fulls : index.tokens;
  const csr = wholeString ? index.fullRows : index.tokenRows;
  const out = new Bitset(size);
  for (let i = lowerBound(keys, normalizedQuery); i < keys.length; i++) {
    if (!keys[i].startsWith(normalizedQuery)) break;
    addCsrRows(csr, i, out);
  }
  return out;
}
