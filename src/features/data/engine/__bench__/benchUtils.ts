import fs from 'node:fs';
import { gzipSync } from 'node:zlib';

export type Timing = { first: number; median: number };

/**
 * Times the first call on its own, then one untimed warmup call, then `runs` timed calls.
 * `before` runs ahead of every call without being timed.
 */
export function timeRuns<T>(
  fn: () => T,
  runs: number,
  before?: () => void,
): Timing & { result: T } {
  before?.();
  let start = performance.now();
  const result = fn();
  const first = performance.now() - start;
  before?.();
  fn();
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    before?.();
    start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return { result, first, median: samples[samples.length >> 1] ?? first };
}

export async function timeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now();
  const result = await fn();
  return { result, ms: performance.now() - start };
}

const gc = (globalThis as { gc?: () => void }).gc;
export const HAS_GC = gc != null;

/** Heap after a forced collection when --expose-gc is on, otherwise a noisy estimate. */
export function heapUsedMB(): number {
  gc?.();
  gc?.();
  return process.memoryUsage().heapUsed / 1024 / 1024;
}

export function fileSizes(files: Iterable<string>): { raw: number; gzip: number } {
  let raw = 0;
  let gzip = 0;
  for (const file of files) {
    const buffer = fs.readFileSync(file);
    raw += buffer.length;
    gzip += gzipSync(buffer).length;
  }
  return { raw, gzip };
}

export const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
export const ms = (value: number) => `${value.toFixed(1)} ms`;

export function formatTable(title: string, rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return '';
  const columns = Object.keys(rows[0]);
  const widths = columns.map((column) =>
    Math.max(column.length, ...rows.map((row) => String(row[column] ?? '').length)),
  );
  const line = (cells: string[]) => cells.map((cell, i) => cell.padEnd(widths[i])).join(' | ');
  return [
    `\n${title}`,
    line(columns),
    widths.map((w) => '-'.repeat(w)).join('-|-'),
    ...rows.map((row) => line(columns.map((column) => String(row[column] ?? '')))),
  ].join('\n');
}

/** First index where two ordered ID lists differ, or -1 when identical. */
export function firstDifference(a: string[], b: string[]): number {
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) if (a[i] !== b[i]) return i;
  return -1;
}
