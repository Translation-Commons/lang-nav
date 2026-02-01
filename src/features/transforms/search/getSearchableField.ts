import { ObjectType, SearchableField } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import { anyWordStartsWith } from '@shared/lib/stringUtils';

export default function getSearchableField(
  object: ObjectData,
  field: SearchableField,
  query?: string,
): string {
  switch (field) {
    case SearchableField.CodeOrNameAny:
      return (
        object.names.filter((name) => anyWordStartsWith(name, query ?? ''))[0] ?? object.codeDisplay
      );
    case SearchableField.NameAny:
      return object.names.filter((name) => anyWordStartsWith(name, query ?? ''))[0] ?? '';
    case SearchableField.Code:
      return object.codeDisplay;
    case SearchableField.NameEndonym:
      return object.nameEndonym ?? '';
    case SearchableField.NameDisplay:
      return object.nameDisplay;
    case SearchableField.NameISO:
      return object.type === ObjectType.Language ? (object.ISO?.name ?? '') : '';
    case SearchableField.NameCLDR:
      return object.type === ObjectType.Language ? (object.CLDR?.name ?? '') : '';
    case SearchableField.NameGlottolog:
      return object.type === ObjectType.Language ? (object.Glottolog?.name ?? '') : '';
    case SearchableField.NameEthnologue:
      return object.type === ObjectType.Language ? (object.Ethnologue?.name ?? '') : '';
  }
}
