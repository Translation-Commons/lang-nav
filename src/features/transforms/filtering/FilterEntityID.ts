import { EntityData, EntityType } from '@entities/types/EntityTypes';

import { toTitleCase } from '@shared/lib/stringUtils';

export function getFilterIDFromSearchString(searchString: string) {
  if (searchString.includes('[') && searchString.includes(']')) {
    return searchString.split('[')[1]?.split(']')[0] ?? '';
  }
  return searchString;
}

export function getFilterEntityID(ent: EntityData): string {
  // if (ent.type === EntityType.Language) return ent.nameCanonical + ' [' + ent.ID + ']';
  return ent.nameDisplay + ' [' + ent.ID + ']';
}

export function parseFilterEntityID(
  filterEntID: string,
  entType?: EntityType,
): { name?: string; code?: string } {
  if (filterEntID.includes('[')) {
    const [name, codeRaw] = filterEntID.split('[');
    let code = codeRaw?.split(']')[0]?.trim();
    if (code && entType === EntityType.Language) code = code.toLowerCase();
    if (code && entType === EntityType.Territory) code = code.toUpperCase();
    if (code && entType === EntityType.WritingSystem) code = toTitleCase(code);

    return {
      name: name.trim() || undefined,
      code: code || undefined,
    };
  }

  const name = filterEntID.trim();
  let code = undefined;

  if (entType != null) {
    switch (entType) {
      case EntityType.Language:
        // if (name.match(/^[a-z]{2,3}$/)) code = name; // ISO 639 code -- require []
        if (name.match(/^[a-z]{4}[0-9]{4}$/)) code = name; // Glottocode
        break;
      case EntityType.Territory:
        if (name.match(/^[A-Z]{2}$/)) code = name.toUpperCase(); // ISO 3166 code
        if (name.match(/^[0-9]{3}$/)) code = name; // UN M.39 code
        break;
      case EntityType.WritingSystem:
        if (name.match(/[A-Z][a-z]{3}/)) code = name;
    }
  }

  return { name: name || undefined, code };
}
