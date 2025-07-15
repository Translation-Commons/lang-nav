import { anyWordStartsWith } from '../generic/stringUtils';
import { ObjectData, TerritoryData, TerritoryScope } from '../types/DataTypes';
import { LanguageScope } from '../types/LanguageTypes';
import { ObjectType, SearchableField } from '../types/PageParamTypes';
import { getSearchableField } from '../views/common/ObjectField';

import { usePageParams } from './PageParamsContext';

export type FilterFunctionType = (a: ObjectData) => boolean;

/**
 * Provide a function that returns true for items that match filters based on substrings of their code or name.
 */
export function getSubstringFilter(): FilterFunctionType | undefined {
  const { searchBy, searchString } = usePageParams();
  if (searchString == '') {
    return undefined;
  }
  return getSubstringFilterOnQuery(searchString.toLowerCase(), searchBy);
}

export function getSubstringFilterOnQuery(
  query: string,
  searchBy: SearchableField,
): FilterFunctionType {
  const queryLowerCase = query.toLowerCase();
  switch (searchBy) {
    case SearchableField.Code:
    case SearchableField.Endonym:
    case SearchableField.EngName:
    case SearchableField.NameOrCode:
      return (a: ObjectData) => anyWordStartsWith(getSearchableField(a, searchBy), queryLowerCase);
    case SearchableField.Territory:
      return (a: ObjectData) => {
        return getTerritoriesRelevantToObject(a)
          .map((t) => getSearchableField(t, searchBy))
          .some((t) => anyWordStartsWith(t, queryLowerCase));
      };
    case SearchableField.AllNames:
      return (a: ObjectData) =>
        a.names
          .map((name) => anyWordStartsWith(name, queryLowerCase))
          .reduce((anyPasses, thisPasses) => anyPasses || thisPasses, false);
  }
}

function getTerritoriesRelevantToObject(object: ObjectData): TerritoryData[] {
  switch (object.type) {
    case ObjectType.Territory:
      return [object, object.parentUNRegion, object.sovereign].filter((t) => t != null);
    case ObjectType.Locale:
      return [object.territory].filter((t) => t != null);
    case ObjectType.Census:
      return [object.territory].filter((t) => t != null);
    case ObjectType.Language:
      return object.locales.map((l) => l.territory).filter((t) => t != null);
    case ObjectType.WritingSystem:
      return [object.territoryOfOrigin].filter((t) => t != null);
  }
}

/**
 * Provides a function that filters on the scope of an object
 */
export function getScopeFilter(): FilterFunctionType {
  const { languageScopes, territoryScopes } = usePageParams();

  function scopeFilter(object: ObjectData) {
    switch (object.type) {
      case ObjectType.Language:
        return (
          languageScopes.length == 0 ||
          languageScopes.includes(object.scope ?? LanguageScope.SpecialCode)
        );
      case ObjectType.Territory:
        return territoryScopes.length == 0 || territoryScopes.includes(object.scope);
      case ObjectType.Locale:
        return (
          (languageScopes.length == 0 && territoryScopes.length == 0) ||
          (languageScopes.includes(object.language?.scope ?? LanguageScope.SpecialCode) &&
            territoryScopes.includes(object.territory?.scope ?? TerritoryScope.Dependency))
        );
      case ObjectType.Census:
      case ObjectType.WritingSystem:
        return true;
    }
  }
  return scopeFilter;
}

export function getSliceFunction<T>(): (arr: T[]) => T[] {
  const { page, limit } = usePageParams();
  return (arr: T[]) =>
    limit < 1 || arr.length < limit ? arr : arr.slice(limit * (page - 1), limit * page);
}
