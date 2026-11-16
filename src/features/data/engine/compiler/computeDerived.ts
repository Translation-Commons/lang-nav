import type { DerivedTypeJson, VariantDerivedJson } from '../snapshot/SnapshotTypes';

import { deriveConnections } from './deriveConnections';
import { deriveEnums, derivePopulation } from './deriveFilters';
import { deriveCodes, deriveSearch } from './deriveSearch';
import { deriveSortKeys } from './deriveSortKeys';
import type { RowTables } from './rowTables';

export type DeriveStats = { missingTargets: number };

export function computeDerived(rows: RowTables, stats: DeriveStats): DerivedTypeJson[] {
  return rows.tables.map((table) => ({
    codes: deriveCodes(table),
    search: deriveSearch(table),
    connections: deriveConnections(rows, table, stats),
    enums: deriveEnums(table),
    population: derivePopulation(table),
    ...deriveSortKeys(table),
  }));
}

/** Paths (joined with '/') of the columns that can be compared and inherited one by one. */
function listColumnPaths(derived: DerivedTypeJson): string[] {
  const paths: string[] = ['codes', 'population'];
  for (const group of ['search', 'connections', 'enums', 'sortKeys', 'orders'] as const) {
    for (const key of Object.keys(derived[group])) paths.push(`${group}/${key}`);
  }
  return paths;
}

function getColumn(derived: DerivedTypeJson, path: string): unknown {
  const [group, key] = path.split('/');
  const value = (derived as Record<string, unknown>)[group];
  return key == null ? value : (value as Record<string, unknown>)[key];
}

/**
 * Drops columns identical to the base variant so a variant only carries what the source changes
 * (names, codes, parents, populations, and everything derived from them).
 */
export function dedupeAgainstBase(
  derived: DerivedTypeJson,
  base: DerivedTypeJson,
): VariantDerivedJson {
  const out: Record<string, unknown> = { ...derived };
  const inherits: string[] = [];
  for (const path of listColumnPaths(derived)) {
    const column = getColumn(derived, path);
    if (JSON.stringify(column) !== JSON.stringify(getColumn(base, path))) continue;
    inherits.push(path);
    const [group, key] = path.split('/');
    if (key == null) delete out[group];
    else {
      const copy = { ...(out[group] as Record<string, unknown>) };
      delete copy[key];
      out[group] = copy;
    }
  }
  return { ...(out as VariantDerivedJson), inherits };
}
