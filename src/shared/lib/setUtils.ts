export function uniqueBy<T>(items: T[], keyFn: (item: T) => string | number): T[] {
  return Object.values(
    items.reduce<Record<string | number, T>>((dict, item) => {
      const key = keyFn(item);
      if (dict[key] == null) {
        dict[key] = item;
      }
      return dict;
    }, {}),
  );
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
