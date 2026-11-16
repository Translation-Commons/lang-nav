import type { EntityData } from '@entities/types/EntityTypes';

import {
  DATE_KEY,
  ELEMENT_KEY,
  encodeNumber,
  MARKER_KEYS,
  REF_KEY,
} from '../snapshot/snapshotCodec';
import { type EncodedRecord, TYPE_ORDER } from '../snapshot/SnapshotTypes';

import { type RowTables, rowFor } from './rowTables';

const ENTITY_TYPES = new Set<string>(TYPE_ORDER);

export function isEntity(value: object): value is EntityData {
  const candidate = value as Partial<EntityData>;
  return typeof candidate.ID === 'string' && ENTITY_TYPES.has(candidate.type as string);
}

function isReactElement(value: object): boolean {
  return typeof (value as { $$typeof?: unknown }).$$typeof === 'symbol';
}

/** React elements (eg. CLDR notes) cannot be stored; keep their visible text only. */
function elementText(node: unknown): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(elementText).join('');
  if (typeof node !== 'object') return '';
  if (isEntity(node)) return node.nameDisplay;
  if (isReactElement(node))
    return elementText((node as { props?: { children?: unknown } }).props?.children);
  return '';
}

function encodeObject(value: object, rows: RowTables, stack: Set<object>): unknown {
  if (isEntity(value)) {
    const row = rowFor(rows, value);
    return row < 0 ? null : { [REF_KEY]: [rows.indexOf.get(value.type), row] };
  }
  if (isReactElement(value)) return { [ELEMENT_KEY]: elementText(value) };
  if (value instanceof Date) {
    const time = value.getTime();
    return { [DATE_KEY]: Number.isNaN(time) ? 'Invalid Date' : value.toISOString() };
  }
  if (value instanceof Map || value instanceof Set)
    throw new Error('Map/Set values are not supported');
  if (stack.has(value)) throw new Error('Cycle through a non-entity object');
  stack.add(value);
  let out: unknown;
  if (Array.isArray(value)) {
    out = value.map((item) => encodeValue(item, rows, stack));
  } else {
    const keys = Object.keys(value);
    if (keys.length === 1 && MARKER_KEYS.has(keys[0]))
      throw new Error(`Field collides with marker ${keys[0]}`);
    out = encodeFields(value as Record<string, unknown>, rows, stack);
  }
  stack.delete(value);
  return out;
}

export function encodeValue(value: unknown, rows: RowTables, stack = new Set<object>()): unknown {
  switch (typeof value) {
    case 'number':
      return encodeNumber(value);
    case 'string':
    case 'boolean':
    case 'undefined':
      return value;
    case 'function':
    case 'symbol':
      return undefined;
    case 'bigint':
      throw new Error('bigint values are not supported');
    case 'object':
      return value === null ? null : encodeObject(value, rows, stack);
  }
}

function encodeFields(obj: Record<string, unknown>, rows: RowTables, stack: Set<object>) {
  const out: EncodedRecord = {};
  for (const key of Object.keys(obj)) {
    const encoded = encodeValue(obj[key], rows, stack);
    if (encoded !== undefined) out[key] = encoded;
  }
  return out;
}

export function encodeRecord(ent: EntityData, rows: RowTables): EncodedRecord {
  return encodeFields(ent as unknown as Record<string, unknown>, rows, new Set([ent]));
}

/**
 * Encodes every known entity. Encoding discovers referenced entities (appending rows in base
 * mode), so this repeats until no new rows show up. Variant rows never reached stay undefined.
 */
export function encodeAllRecords(rows: RowTables): (EncodedRecord | undefined)[][] {
  const records: (EncodedRecord | undefined)[][] = rows.tables.map(() => []);
  let progress = true;
  while (progress) {
    progress = false;
    rows.tables.forEach((table, t) => {
      for (let row = 0; row < table.entities.length; row++) {
        const ent = table.entities[row];
        if (ent == null || records[t][row] !== undefined) continue;
        records[t][row] = encodeRecord(ent, rows);
        progress = true;
      }
    });
  }
  rows.tables.forEach((table, t) => (records[t].length = table.ids.length));
  return records;
}
