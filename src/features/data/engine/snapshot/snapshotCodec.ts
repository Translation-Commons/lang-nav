/**
 * JSON markers used in snapshot values. A marker is an object with exactly one of these keys:
 *   { $: [typeIndex, row] }  reference to another entity
 *   { $n: 'NaN' }            non-finite number (JSON would turn it into null)
 *   { $d: '2020-01-01...' }  Date
 *   { $x: 'text' }           React element, flattened to its text content (lossy)
 */
export const REF_KEY = '$';
export const NUMBER_KEY = '$n';
export const DATE_KEY = '$d';
export const ELEMENT_KEY = '$x';
export const MARKER_KEYS = new Set([REF_KEY, NUMBER_KEY, DATE_KEY, ELEMENT_KEY]);

export type ResolveRef = (typeIndex: number, row: number) => unknown;

export function encodeNumber(value: number): number | { $n: string } {
  return Number.isFinite(value) ? value : { [NUMBER_KEY]: String(value) };
}

function decodeMarker(key: string, value: unknown, resolve: ResolveRef): unknown {
  switch (key) {
    case REF_KEY: {
      const [typeIndex, row] = value as [number, number];
      return resolve(typeIndex, row);
    }
    case NUMBER_KEY:
      return Number(value);
    case DATE_KEY:
      return new Date(value as string);
    default:
      return value;
  }
}

/** Decodes markers, mutating parsed JSON in place. Only call once per parsed value. */
export function decodeValue(value: unknown, resolve: ResolveRef): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = decodeValue(value[i], resolve);
    return value;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 1 && MARKER_KEYS.has(keys[0])) {
    return decodeMarker(keys[0], obj[keys[0]], resolve);
  }
  for (const key of keys) obj[key] = decodeValue(obj[key], resolve);
  return obj;
}

/** Decodes the fields of a record without treating the record itself as a marker. */
export function decodeRecordFields(record: Record<string, unknown>, resolve: ResolveRef): void {
  for (const key of Object.keys(record)) record[key] = decodeValue(record[key], resolve);
}

const noRefs: ResolveRef = () => {
  throw new Error('Unexpected entity reference in a derived column');
};

export function decodeColumn<T>(column: unknown[]): T[] {
  return decodeValue(column, noRefs) as T[];
}
