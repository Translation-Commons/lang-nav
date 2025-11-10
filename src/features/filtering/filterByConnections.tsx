import { useCallback } from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { ObjectData, TerritoryData } from '@entities/types/DataTypes';

import { FilterFunctionType } from './filter';

/**
 * Provide a function that returns true for items that are relevant to a territory.
 */
export function getFilterByTerritory(): FilterFunctionType {
  const { territoryFilter } = usePageParams();
  // Split up strings like "United States [US]" into "US" and "United States"
  const splitFilter = territoryFilter.split('[');
  const nameMatch = splitFilter[0]?.toLowerCase().trim();
  let codeMatch = '';
  if (territoryFilter.length === 2) {
    codeMatch = territoryFilter.toUpperCase(); // ISO 3166 alpha-2 code
  } else if (territoryFilter.length === 3 && territoryFilter.match(/^[0-9]{3}$/)) {
    codeMatch = territoryFilter; // UN M.49 code (eg. 419 = Latin America and the Caribbean)
  } else if (splitFilter.length > 1) {
    codeMatch = splitFilter[1].split(']')[0]?.toUpperCase();
  }

  return useCallback(
    (object: ObjectData) => {
      if (!territoryFilter) return true;
      const territories = getTerritoriesRelevantToObject(object);
      if (codeMatch !== '') return territories.some((t) => t.ID === codeMatch);
      return territories.some((t) => t.nameDisplay.toLowerCase().startsWith(nameMatch));
    },
    [territoryFilter, codeMatch, nameMatch],
  );
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
    case ObjectType.VariantTag:
      return [];
  }
}
