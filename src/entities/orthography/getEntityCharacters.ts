import { EntityData, EntityType } from '@entities/types/EntityTypes';

import { unique } from '@shared/lib/setUtils';

function getEntityCharacters(ent: EntityData): string | undefined {
  switch (ent.type) {
    case EntityType.Orthography:
      return ent.baseCharacters;
    case EntityType.WritingSystem:
      return Array.from(ent.characters ?? []).join('') || ent.sample;
    // return ent.sample ?? '';
    case EntityType.Language:
      return (
        unique(ent.orthographies?.flatMap((orth) => Array.from(orth.baseCharacters ?? [])) ?? [])
          .sort((a, b) => a.localeCompare(b))
          .join('') || undefined
      );
    default:
      return undefined;
  }
}

export default getEntityCharacters;
