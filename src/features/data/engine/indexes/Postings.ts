import Bitset from '../bitset/Bitset';
import type { CsrJson } from '../snapshot/SnapshotTypes';

export type Csr = { offsets: Uint32Array; rows: Uint32Array };

/** Lists must already be free of duplicates. */
export function buildCsrJson(lists: readonly (readonly number[] | undefined)[]): CsrJson {
  const o: number[] = [0];
  const r: number[] = [];
  for (const list of lists) {
    if (list) for (const row of list) r.push(row);
    o.push(r.length);
  }
  return { o, r };
}

export function csrFromJson(json: CsrJson): Csr {
  return { offsets: Uint32Array.from(json.o), rows: Uint32Array.from(json.r) };
}

export function addCsrRows(csr: Csr, key: number, into: Bitset): void {
  const end = csr.offsets[key + 1];
  for (let i = csr.offsets[key]; i < end; i++) into.add(csr.rows[i]);
}

export function csrKeyCount(csr: Csr): number {
  return csr.offsets.length - 1;
}

/** Appends a row to a key's list, skipping it if it was the last row added (rows come in order). */
export function pushUniqueRow(lists: number[][], key: number, row: number): void {
  const list = (lists[key] ??= []);
  if (list[list.length - 1] !== row) list.push(row);
}
