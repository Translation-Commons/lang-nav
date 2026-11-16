import type { SearchableField } from '@features/params/PageParamTypes';

import { type EntityData, EntityType } from '@entities/types/EntityTypes';

import { anyWordStartsWith } from '@shared/lib/stringUtils';

import { SearchColumn } from '../snapshot/SnapshotTypes';

import type { SearchMode } from './QueryTypes';

// Kept as literals so the engine does not import PageParamTypes at runtime; `satisfies` keeps them in sync
export const SEARCH_MODE = {
  CodeOrNameAny: 'Code or Any Name',
  Code: 'Code',
  CodeISO: 'ISO Code',
  CodeGlottolog: 'Glottolog Code',
  NameAny: 'Any Name',
  NameEndonym: 'Endonym',
  NameDisplay: 'English Name',
  NameISO: 'ISO Name',
  NameCLDR: 'CLDR Name',
  NameGlottolog: 'Glottolog Name',
} as const satisfies { [K in keyof typeof SearchableField]: `${(typeof SearchableField)[K]}` };

/**
 * Columns whose prefix index answers the search mode, or null when it falls back to a residual
 * predicate. Note the current code searches nameDisplay for "Endonym" and nameEndonym for
 * "English Name"; that is kept as is.
 */
export function getIndexedSearchColumns(mode: SearchMode): SearchColumn[] | null {
  switch (mode) {
    case SEARCH_MODE.CodeOrNameAny:
      return [SearchColumn.Names, SearchColumn.Code];
    case SEARCH_MODE.NameAny:
      return [SearchColumn.Names];
    case SEARCH_MODE.Code:
      return [SearchColumn.Code];
    case SEARCH_MODE.NameEndonym:
      return [SearchColumn.Display];
    case SEARCH_MODE.NameDisplay:
      return [SearchColumn.Endonym];
    default:
      return null;
  }
}

/** A copy of getSubstringFilterOnQuery, which cannot be imported without pulling in React. */
export function matchesSearch(a: EntityData, query: string, mode: SearchMode): boolean {
  switch (mode) {
    case SEARCH_MODE.Code:
      return anyWordStartsWith(a.codeDisplay, query);
    case SEARCH_MODE.CodeISO:
      if (a.type === EntityType.Language) return anyWordStartsWith(a.ISO.code ?? '', query);
      if (a.type === EntityType.Territory) return a.ID.length === 2 && a.ID.startsWith(query);
      if (a.type === EntityType.WritingSystem) return anyWordStartsWith(a.ID, query);
      return false;
    case SEARCH_MODE.CodeGlottolog:
      return a.type === EntityType.Language && anyWordStartsWith(a.Glottolog.code ?? '', query);
    case SEARCH_MODE.NameEndonym:
      return anyWordStartsWith(a.nameDisplay, query);
    case SEARCH_MODE.NameDisplay:
      return anyWordStartsWith(a.nameEndonym ?? '', query);
    case SEARCH_MODE.NameISO:
      return a.type === EntityType.Language && !!a.ISO.name && anyWordStartsWith(a.ISO.name, query);
    case SEARCH_MODE.NameCLDR:
      return (
        a.type === EntityType.Language && !!a.CLDR.name && anyWordStartsWith(a.CLDR.name, query)
      );
    case SEARCH_MODE.NameGlottolog:
      return (
        a.type === EntityType.Language &&
        !!a.Glottolog.name &&
        anyWordStartsWith(a.Glottolog.name, query)
      );
    case SEARCH_MODE.NameAny:
      return a.names.some((name) => anyWordStartsWith(name, query));
    case SEARCH_MODE.CodeOrNameAny:
      return (
        a.names.some((name) => anyWordStartsWith(name, query)) ||
        anyWordStartsWith(a.codeDisplay, query)
      );
  }
}
