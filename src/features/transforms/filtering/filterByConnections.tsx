import { useCallback } from 'react';

import { getObjectParents } from '@widgets/pathnav/getParentsAndDescendants';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '@entities/language/LanguageTypes';
import {
  ObjectData,
  TerritoryData,
  TerritoryScope,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import { toTitleCase } from '@shared/lib/stringUtils';

import { FilterFunctionType } from './filter';

/**
 * Returns a combined function that will filter objects by other objects they are connected to.
 */
export function getFilterByConnections(): FilterFunctionType {
  const filterByTerritory = getFilterByTerritory();
  const filterByWritingSystem = getFilterByWritingSystem();
  const filterByLanguage = getFilterByLanguage();
  return useCallback(
    (object: ObjectData) =>
      filterByTerritory(object) && filterByWritingSystem(object) && filterByLanguage(object),
    [filterByTerritory, filterByWritingSystem, filterByLanguage],
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
      if (codeMatch !== '') return territories.some((t) => t.codeDisplay === codeMatch);
      return territories.some((t) => t.nameDisplay.toLowerCase().startsWith(nameMatch));
    },
    [territoryFilter, codeMatch, nameMatch],
  );
}

/**
 * The first should be the best default territory for the object.
 *
 * Sorting matters. The first territory should be the most relevant one.
 * Languages: The first are the biggest countries, then the regions or dependencies
 * Territories: The first is the territory itself, then the regions that contain it
 */
export function getTerritoriesRelevantToObject(object: ObjectData): TerritoryData[] {
  switch (object.type) {
    case ObjectType.Territory:
      return [
        object,
        ...getObjectParents(object).filter(
          (t): t is TerritoryData => t?.type === ObjectType.Territory,
        ),
        object.sovereign,
      ].filter((t) => t != null);
    case ObjectType.Locale:
      return [object.territory].filter((t) => t != null);
    case ObjectType.Census:
      return [object.territory].filter((t) => t != null);
    case ObjectType.Language:
      return uniqueBy(
        object.locales
          .sort((a, b) => (b.populationSpeaking || 0) - (a.populationSpeaking || 0))
          .map((l) => l.territory)
          .filter((t) => t != null)
          .sort(
            (a, b) =>
              (a.scope === TerritoryScope.Country ? -1 : 1) -
              (b.scope === TerritoryScope.Country ? -1 : 1),
          ),
        (t) => t.ID,
      );
    case ObjectType.WritingSystem:
      return [object.territoryOfOrigin].filter((t) => t != null);
    case ObjectType.VariantTag:
      return [];
  }
}

export function getFilterByWritingSystem(): FilterFunctionType {
  const { writingSystemFilter } = usePageParams();
  // Split up strings like "Traditional Han [Hant]" into "Hant" and "Traditional Han"
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
      if (codeMatch !== '') return scripts.some((ws) => ws.codeDisplay === codeMatch);
      return scripts.some((ws) => ws.nameDisplay.toLowerCase().startsWith(nameMatch));
    },
    [writingSystemFilter, codeMatch, nameMatch],
  );
}

export function getWritingSystemsRelevantToObject(object: ObjectData): WritingSystemData[] {
  switch (object.type) {
    case ObjectType.Territory:
      return uniqueBy(
        object.locales
          ?.filter((loc) => (loc.populationWritingPercent || 0) > 1)
          ?.map((loc) => loc.writingSystem ?? loc.language?.primaryWritingSystem)
          .filter((ws) => !!ws) ?? [],
        (ws) => ws.ID,
      );
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

export function getFilterByLanguage(): FilterFunctionType {
  const { languageFilter } = usePageParams();
  // Split up strings like "German [deu]" into "deu" and "German"
  const splitFilter = languageFilter.split('[');
  const nameMatch = splitFilter[0]?.toLowerCase().trim();
  let codeMatch = '';
  if (languageFilter.length === 3 && languageFilter.match(/[a-z]{3}/)) {
    codeMatch = languageFilter; // ISO 639 code
  } else if (splitFilter.length > 1) {
    const codeSection = splitFilter[1].split(']')[0];
    if (codeSection) codeMatch = codeSection.toLowerCase();
  }

  return useCallback(
    (object: ObjectData) => {
      if (!languageFilter) return true;
      const langs = getLanguagesRelevantToObject(object);
      if (codeMatch !== '') return langs.some((lang) => lang.codeDisplay === codeMatch);
      return langs.some((lang) => lang.nameDisplay.toLowerCase().startsWith(nameMatch));
    },
    [languageFilter, codeMatch, nameMatch],
  );
}

export function getLanguagesRelevantToObject(object: ObjectData): LanguageData[] {
  switch (object.type) {
    case ObjectType.Territory:
      return uniqueBy(
        object.locales
          ?.filter((loc) => (loc.populationSpeakingPercent || 0) > 1)
          ?.map((loc) => loc.language)
          .filter((lang) => !!lang) ?? [],
        (lang) => lang.ID,
      );
    case ObjectType.Locale:
      return [object.language].filter((lang) => !!lang);
    case ObjectType.Census:
      return []; // Not easy to get
    case ObjectType.Language:
      // gets the language family
      return [...(getObjectParents(object) as LanguageData[]), object].filter((lang) => !!lang);
    case ObjectType.WritingSystem:
      return Object.values(object.languages ?? {});
    case ObjectType.VariantTag:
      return object.languages ?? [];
  }
}

export function getConnectionsFilterLabels(): {
  territoryFilterLabel: string;
  writingSystemFilterLabel: string;
  languageFilterLabel: string;
} {
  const { territoryFilter, writingSystemFilter, languageFilter } = usePageParams();
  const territoryFilterLabel = territoryFilter
    ? `in ${territoryFilter.split('[')[0].trim()}`
    : 'in any territory';
  const writingSystemFilterLabel = writingSystemFilter
    ? `using ${writingSystemFilter.split('[')[0].trim()} script`
    : 'using any script';
  const languageFilterLabel = languageFilter
    ? `related to ${languageFilter.split('[')[0].trim()}`
    : 'related to any language';
  return {
    territoryFilterLabel,
    writingSystemFilterLabel,
    languageFilterLabel,
  };
}
