import { SearchableField } from '@features/params/PageParamTypes';

import { EntityData, EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { anyWordStartsWith } from '@shared/lib/stringUtils';

import { FilterFunctionType } from '../filtering/filter';

export default function getSubstringFilterOnQuery(
  query: string,
  searchBy: SearchableField,
): FilterFunctionType {
  // Case and accent normalization is handled in anyWordStartsWith
  switch (searchBy) {
    case SearchableField.Code:
      return (a: EntityData) => anyWordStartsWith(a.codeDisplay, query);
    case SearchableField.CodeISO:
      return (a: EntityData) => {
        if (a.type === EntityType.Language) return anyWordStartsWith(a.ISO.code ?? '', query);
        if (a.type === EntityType.Territory) return a.ID.length === 2 && a.ID.startsWith(query);
        if (a.type === EntityType.WritingSystem) return anyWordStartsWith(a.ID, query);
        return false;
      };
    case SearchableField.CodeGlottolog:
      return (a: EntityData) =>
        a.type === EntityType.Language && anyWordStartsWith(a.Glottolog.code ?? '', query);
    case SearchableField.NameEndonym:
      return (a: EntityData) => anyWordStartsWith(a.nameDisplay, query);
    case SearchableField.NameDisplay:
      return (a: EntityData) => anyWordStartsWith(a.nameEndonym ?? '', query);
    case SearchableField.NameISO:
      return (a: EntityData) =>
        a.type === EntityType.Language && !!a.ISO.name && anyWordStartsWith(a.ISO.name, query);
    case SearchableField.NameCLDR:
      return (a: EntityData) =>
        a.type === EntityType.Language && !!a.CLDR.name && anyWordStartsWith(a.CLDR.name, query);
    case SearchableField.NameGlottolog:
      return (a: EntityData) =>
        a.type === EntityType.Language &&
        !!a.Glottolog.name &&
        anyWordStartsWith(a.Glottolog.name, query);
    case SearchableField.NameAny:
      return (a: EntityData) => a.names.some((name) => anyWordStartsWith(name, query));
    case SearchableField.CodeOrNameAny:
      return (a: EntityData) =>
        a.names.some((name) => anyWordStartsWith(name, query)) ||
        anyWordStartsWith(a.codeDisplay, query);
    default:
      enforceExhaustiveSwitch(searchBy);
  }
}
