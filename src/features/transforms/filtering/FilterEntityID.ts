import { EntityData, EntityType } from '@entities/types/EntityTypes';

export function getFilterEntityID(ent: EntityData): string {
  // if (ent.type === EntityType.Language) return ent.nameCanonical + ' [' + ent.ID + ']';
  return ent.nameDisplay + ' [' + ent.ID + ']';
}

export function parseFilterEntityID(
  filterEntID: string,
  entType?: EntityType,
): { name?: string; code?: string } {
  if (filterEntID.includes('[')) {
    const [name, id] = filterEntID.split('[');
    return {
      name: name.trim() || undefined,
      code: id.split(']')[0]?.trim() || undefined,
    };
  }

  const name = filterEntID.trim();
  let code = undefined;

  if (entType != null) {
    switch (entType) {
      case EntityType.Language:
        // if (name.match(/^[a-z]{2,3}$/)) code = name; // ISO 639 code
        if (name.match(/^[a-z]{4}[0-9]{4}$/)) code = name; // Glottocode
        break;
      case EntityType.Territory:
        if (name.match(/^[A-Za-z]{2}$/)) code = name.toUpperCase(); // ISO 3166 code
        if (name.match(/^[0-9]{3}$/)) code = name; // UN M.39 code
        break;
      case EntityType.WritingSystem:
        if (name.match(/[A-Z][a-z]{3}/)) code = name;
    }
  }

  return { name: name || undefined, code };
}
