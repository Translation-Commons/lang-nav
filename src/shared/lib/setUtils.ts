// Stable to input order
export function uniqueBy<T>(items: T[], keyFn: (item: T) => string | number): T[] {
  const hasSeen = new Set<string | number>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (hasSeen.has(key)) {
      return false;
    } else {
      hasSeen.add(key);
      return true;
    }
  });
}

export function unique<T extends string | number>(items: T[]): T[] {
  return uniqueBy(items, (item) => item);
}

export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );
}

export function toDictionary<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Record<K, T> {
  return items.reduce(
    (dict, item) => {
      const key = keyFn(item);
      if (!dict[key]) dict[key] = item;
      return dict;
    },
    {} as Record<K, T>,
  );
}

export function sumBy<T>(items: T[], valueFn: (item: T) => number | undefined): number {
  return items.reduce((sum, item) => sum + (valueFn(item) ?? 0), 0);
}

export function areArraysIdentical<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const setB = new Set(b);
  return a.every((item) => setB.has(item));
}

export function maxBy<T, K>(items: T[], valueFn: (item: T) => K | undefined): K | undefined {
  return items.reduce<K | undefined>((max, child) => {
    const current = valueFn(child);
    if (current == null) return max;
    if (max == null) return current;
    return max > current ? max : current;
  }, undefined);
}

export function countOccurrencesBy<T>(
  items: T[],
  bucketFn: (item: T) => string | number,
): Record<string | number, number> {
  return items.reduce(
    (hist, item) => {
      const bucket = bucketFn(item);
      if (!hist[bucket]) hist[bucket] = 0;
      hist[bucket]++;
      return hist;
    },
    {} as Record<string | number, number>,
  );
}

export function countOccurrences<T extends string | number>(items: T[]): Record<string, number> {
  return items.reduce(
    (hist, item) => {
      if (!hist[item]) hist[item] = 0;
      hist[item]++;
      return hist;
    },
    {} as Record<T, number>,
  );
}
