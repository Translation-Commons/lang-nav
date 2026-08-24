import { EntityType, SearchableField } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';

import { anyWordStartsWith } from '@shared/lib/stringUtils';

export default function getSearchableField(
  ent: EntityData,
  field: SearchableField,
  query?: string,
): string {
  switch (field) {
    case SearchableField.CodeOrNameAny:
      return ent.names.filter((name) => anyWordStartsWith(name, query ?? ''))[0] ?? ent.codeDisplay;
    case SearchableField.NameAny:
      return ent.names.filter((name) => anyWordStartsWith(name, query ?? ''))[0] ?? '';
    case SearchableField.Code:
      return ent.codeDisplay;
    case SearchableField.NameEndonym:
      return ent.nameEndonym ?? '';
    case SearchableField.NameDisplay:
      return ent.nameDisplay;
    case SearchableField.NameISO:
      return ent.type === EntityType.Language ? (ent.ISO?.name ?? '') : '';
    case SearchableField.NameCLDR:
      return ent.type === EntityType.Language ? (ent.CLDR?.name ?? '') : '';
    case SearchableField.NameGlottolog:
      return ent.type === EntityType.Language ? (ent.Glottolog?.name ?? '') : '';
    case SearchableField.NameEthnologue:
      return ent.type === EntityType.Language ? (ent.Ethnologue?.name ?? '') : '';
  }
}
