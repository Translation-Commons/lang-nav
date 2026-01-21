/**
 * This module provides functions to retrieve geographical information related to various object types.
 * The main 3 functions are:
 * - getContainingTerritories: Returns territories that contain the object.
 *     For example Denmark [DK] is in Northern Europe [154], Europe [150], and the World [001]
 * - getChildTerritoriesInObject: Returns child territories associated with the object.
 *     For example Denmark [DK] contains the Faroe Islands [FO] and Greenland [GL].
 * - getCountriesInObject: Returns countries associated with the object.
 *     For example Denmark [DK] contains itself as a country. Meanwhile Europe [150] contains many.
 */

import { getObjectParents } from '@widgets/pathnav/getParentsAndDescendants';

import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import {
  isTerritoryGroup,
  LocaleData,
  ObjectData,
  TerritoryData,
  TerritoryScope,
  WritingSystemData,
} from '@entities/types/DataTypes';

import { uniqueBy } from '@shared/lib/setUtils';

/**
 * This returns a list of the territories (countries, regions, dependencies) that contain the object.
 * This is used for filtering objects by territory.
 *
 * Sorting matters. The first territory should be the most relevant one.
 * Languages: The first are the biggest countries, then the regions or dependencies
 * Territories: The first is the territory itself, then the regions that contain it
 */
export function getContainingTerritories(object: ObjectData): TerritoryData[] {
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
      return uniqueBy(
        getWritingSystemLocales(object)
          .map((l) => l.territory)
          .filter((t): t is TerritoryData => t != null),
        (t) => t.ID,
      );
    case ObjectType.VariantTag:
      return getChildTerritoriesInObject(object) ?? [];
  }
}

export function getTerritoryBiggestLocale(territory: TerritoryData): LocaleData | undefined {
  return (territory?.locales || []).sort(
    (a, b) => (b.populationSpeaking ?? 0) - (a.populationSpeaking ?? 0),
  )[0];
}

export function getTerritoryChildren(territory: TerritoryData): TerritoryData[] {
  return [...(territory.containsTerritories ?? []), ...(territory.dependentTerritories ?? [])];
}

export function getTerritoryCountries(territory: TerritoryData): TerritoryData[] {
  switch (territory.scope) {
    case TerritoryScope.Country:
      return [territory];
    case TerritoryScope.Dependency:
      return [];
    case TerritoryScope.Region:
    case TerritoryScope.Continent:
    case TerritoryScope.Subcontinent:
    case TerritoryScope.World:
      return territory.containsTerritories?.flatMap(getTerritoryCountries) ?? [];
  }
}

function getLocaleCountryLocales(locale: LocaleData): LocaleData[] {
  return locale.territory && locale.territory.scope === TerritoryScope.Country
    ? [locale]
    : (locale.relatedLocales?.childTerritories?.flatMap(getLocaleCountryLocales) ?? []).sort(
        (a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0),
      );
}

function getLocaleCountries(locale: LocaleData): TerritoryData[] {
  return uniqueBy(
    getLocaleCountryLocales(locale)
      .map((loc) => loc.territory)
      .filter((t): t is TerritoryData => !!t),
    (t) => t.ID,
  );
}

// SortBy.CountOfCountries
export function getCountOfCountries(object: ObjectData): number | undefined {
  return getCountriesInObject(object)?.length;
}

export function getCountriesInObject(object: ObjectData): TerritoryData[] | undefined {
  switch (object.type) {
    case ObjectType.Territory:
      return getTerritoryCountries(object);
    case ObjectType.Locale:
      return getLocaleCountries(object);
    case ObjectType.Census:
      return object.territory?.scope === TerritoryScope.Country ? [object.territory] : [];
    case ObjectType.Language:
    case ObjectType.WritingSystem:
    case ObjectType.VariantTag:
      // Computationally a bit expensive, be careful using this application
      return uniqueBy(
        getObjectLocales(object)
          .filter((loc) => loc.territory?.scope === TerritoryScope.Country)
          .sort((a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0))
          .map((loc) => loc.territory)
          .filter((t): t is TerritoryData => !!t),
        (t) => t.ID,
      );
  }
}

// SortBy.CountOfChildTerritories
export function getCountOfChildTerritories(object: ObjectData): number | undefined {
  return getChildTerritoriesInObject(object)?.length;
}

export function getChildTerritoriesInObject(object: ObjectData): TerritoryData[] | undefined {
  switch (object.type) {
    case ObjectType.Territory:
      return getTerritoryChildren(object);
    case ObjectType.Locale:
      return object.territory ? [object.territory] : undefined;
    case ObjectType.Census:
      return object.territory ? [object.territory] : undefined;
    case ObjectType.VariantTag:
      // Most variant tags don't have specified territories but some may
      return uniqueBy(
        object.locales
          .map((locale) => locale.territory)
          .filter((t): t is TerritoryData => t != null),
        (t) => t.ID,
      );
    case ObjectType.Language:
    case ObjectType.WritingSystem:
      // child territories are not well defined for this, you probably want getCountriesInObject instead
      return undefined;
  }
}

export function getObjectLocales(object: ObjectData): LocaleData[] {
  switch (object.type) {
    case ObjectType.Territory:
      return object.locales ?? [];
    case ObjectType.Locale:
      return [object];
    case ObjectType.Census:
      return [];
    case ObjectType.Language:
      return object.locales;
    case ObjectType.WritingSystem:
      return getWritingSystemLocales(object);
    case ObjectType.VariantTag:
      return object.locales;
  }
}

export function getUniqueCountriesForLanguage(lang: LanguageData): TerritoryData[] {
  return uniqueBy(
    lang.locales
      .filter((loc) => loc.territory?.scope === TerritoryScope.Country)
      .sort((a, b) => (b.populationSpeaking ?? 0) - (a.populationSpeaking ?? 0)),
    (loc) => loc.territoryCode ?? '',
  )
    .map((loc) => loc.territory)
    .filter((t): t is TerritoryData => !!t);
}

// Requires a lot of lookups, not great to run in time-sensitive contexts
function getWritingSystemLocales(object: WritingSystemData): LocaleData[] {
  const locales = object.localesWhereExplicit ?? [];
  const localesWithThisWSInferred = Object.values(object.languages ?? {})
    .filter((lang) => lang.primaryWritingSystem?.ID === object.ID)
    .flatMap((lang) => lang.locales)
    .filter((loc) => loc.writingSystem == null && !isTerritoryGroup(loc.territory?.scope));
  return [...locales, ...localesWithThisWSInferred].sort(
    (a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0),
  );
}
