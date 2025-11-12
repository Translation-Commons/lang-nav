import { useCallback } from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { ObjectData, TerritoryData, WritingSystemData } from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import { toTitleCase } from '@shared/lib/stringUtils';

import { FilterFunctionType } from './filter';

/**
 * Returns a combined function that will filter objects by other objects they are connected to.
 */
export function getFilterByConnections(): FilterFunctionType {
  const filterByTerritory = getFilterByTerritory();
  const filterByWritingSystem = getFilterByWritingSystem();
  return useCallback(
    (object: ObjectData) => filterByTerritory(object) && filterByWritingSystem(object),
    [filterByTerritory, filterByWritingSystem],
  );
}

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

export function getTerritoriesRelevantToObject(object: ObjectData): TerritoryData[] {
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

export function getFilterByWritingSystem(): FilterFunctionType {
  const { writingSystemFilter } = usePageParams();
  // Split up strings like "United States [US]" into "US" and "United States"
  const splitFilter = writingSystemFilter.split('[');
  const nameMatch = splitFilter[0]?.toLowerCase().trim();
  let codeMatch = '';
  if (writingSystemFilter.length === 4 && writingSystemFilter.match(/[A-Z][a-z]{3}/)) {
    codeMatch = toTitleCase(writingSystemFilter); // ISO 15924 code
  } else if (splitFilter.length > 1) {
    const codeSection = splitFilter[1].split(']')[0];
    if (codeSection) codeMatch = toTitleCase(codeSection);
  }

  return useCallback(
    (object: ObjectData) => {
      if (!writingSystemFilter) return true;
      const scripts = getWritingSystemsRelevantToObject(object);
      if (codeMatch !== '') return scripts.some((ws) => ws.ID === codeMatch);
      return scripts.some((ws) => ws.nameDisplay.toLowerCase().startsWith(nameMatch));
    },
    [writingSystemFilter, codeMatch, nameMatch],
  );
}

export function getWritingSystemsRelevantToObject(object: ObjectData): WritingSystemData[] {
  switch (object.type) {
    case ObjectType.Territory:
      return object.locales?.flatMap((loc) => loc.writingSystem).filter((ws) => !!ws) ?? [];
    case ObjectType.Locale:
      return [object.writingSystem ?? object.language?.primaryWritingSystem].filter((ws) => !!ws);
    case ObjectType.Census:
      return []; // Not easy to get
    case ObjectType.Language:
      return uniqueBy(
        [object.primaryWritingSystem, ...Object.values(object.writingSystems ?? {})].filter(
          (ws) => !!ws,
        ),
        (ws) => ws.ID,
      );
    case ObjectType.WritingSystem:
      return [object, object.parentWritingSystem, ...(object.childWritingSystems ?? [])].filter(
        (ws) => !!ws,
      );
    case ObjectType.VariantTag:
      return []; // Not easy to get
  }
}
