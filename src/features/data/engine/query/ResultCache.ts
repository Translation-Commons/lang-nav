import type { Query, QueryResult } from './QueryTypes';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'undefined';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`;
}

export function getQueryCacheKey(query: Query, version: number): string {
  return `${version}#${stableStringify(query)}`;
}

/** Small LRU keyed by query + store version, so a variant switch never serves stale results. */
export class ResultCache {
  private readonly entries = new Map<string, QueryResult>();

  constructor(private readonly maxEntries = 64) {}

  get(key: string): QueryResult | undefined {
    const hit = this.entries.get(key);
    if (hit) {
      this.entries.delete(key);
      this.entries.set(key, hit);
    }
    return hit;
  }

  set(key: string, result: QueryResult): void {
    this.entries.delete(key);
    this.entries.set(key, result);
    if (this.entries.size > this.maxEntries) {
      this.entries.delete(this.entries.keys().next().value as string);
    }
  }

  get size(): number {
    return this.entries.size;
  }
}
