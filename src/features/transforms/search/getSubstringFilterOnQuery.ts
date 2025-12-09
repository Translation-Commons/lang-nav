import { SearchableField } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import { anyWordStartsWith } from '@shared/lib/stringUtils';

import { FilterFunctionType } from '../filtering/filter';

import getSearchableField from './getSearchableField';

export default function getSubstringFilterOnQuery(
  query: string,
  searchBy: SearchableField,
): FilterFunctionType {
  // Case and accent normalization is handled in anyWordStartsWith
  switch (searchBy) {
    case SearchableField.Code:
    case SearchableField.NameEndonym:
    case SearchableField.NameDisplay:
    case SearchableField.NameISO:
    case SearchableField.NameCLDR:
    case SearchableField.NameGlottolog:
    case SearchableField.NameOrCode:
      return (a: ObjectData) => anyWordStartsWith(getSearchableField(a, searchBy), query);
    case SearchableField.NameAny:
      return (a: ObjectData) =>
        a.names
          .map((name) => anyWordStartsWith(name, query))
          .reduce((anyPasses, thisPasses) => anyPasses || thisPasses, false);
    case SearchableField.All:
      return (a: ObjectData) =>
        a.names
          .map((name) => anyWordStartsWith(name, query))
          .reduce((anyPasses, thisPasses) => anyPasses || thisPasses, false) ||
        anyWordStartsWith(a.codeDisplay, query);
  }
}
