/**
 * This module provides functions to retrieve geographical information related to various entity types.
 * The main 3 functions are:
 * - getContainingTerritories: Returns territories that contain the ent.
 *     For example Denmark [DK] is in Northern Europe [154], Europe [150], and the World [001]
 * - getChildTerritoriesInEntity: Returns child territories associated with the ent.
 *     For example Denmark [DK] contains the Faroe Islands [FO] and Greenland [GL].
 * - getCountriesInEntity: Returns countries associated with the ent.
 *     For example Denmark [DK] contains itself as a country. Meanwhile Europe [150] contains many.
 */

import { getEntityParents } from '@widgets/pathnav/getParentsAndDescendants';

import { EntityType } from '@features/params/PageParamTypes';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import {
  isTerritoryGroup,
  TerritoryData,
  TerritoryScope,
} from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { uniqueBy } from '@shared/lib/setUtils';

/**
 * This returns a list of the territories (countries, regions, dependencies) that contain the ent.
 * This is used for filtering entities by territory.
 *
 * Sorting matters. The first territory should be the most relevant one.
 * Languages: The first are the biggest countries, then the regions or dependencies
 * Territories: The first is the territory itself, then the regions that contain it
 */
export function getContainingTerritories(ent: EntityData): TerritoryData[] {
  switch (ent.type) {
    case EntityType.Territory:
      return [
        ent,
        ...getEntityParents(ent).filter(
          (t): t is TerritoryData => t?.type === EntityType.Territory,
        ),
        ent.sovereign,
      ].filter((t) => t != null);
    case EntityType.Locale:
      return [ent.territory].filter((t) => t != null);
    case EntityType.Census:
      return [ent.territory].filter((t) => t != null);
    case EntityType.Language:
      return uniqueBy(
        ent.locales
          .slice()
          .sort(sortByPopulation)
          .map((l) => l.territory)
          .filter((t) => t != null)
          .sort(
            (a, b) =>
              (a.scope === TerritoryScope.Country ? -1 : 1) -
              (b.scope === TerritoryScope.Country ? -1 : 1),
          ),
        (t) => t.ID,
      );
    case EntityType.WritingSystem:
      return uniqueBy(
        getWritingSystemLocales(ent)
          .map((l) => l.territory)
          .filter((t): t is TerritoryData => t != null),
        (t) => t.ID,
      );
    case EntityType.Variant:
      return getChildTerritoriesInEntity(ent) ?? [];
    case EntityType.Keyboard:
      return ent.territory ? [ent.territory] : [];
    case EntityType.Org:
      return ent.headquarters ? [ent.headquarters] : [];
  }
}

/**
 * By default only returns languages
 */
export function getTerritoryBiggestLocale(
  territory: TerritoryData,
  scopes: (LanguageScope | undefined)[] = [LanguageScope.Language],
): LocaleData | undefined {
  return (territory?.locales || [])
    .filter((l) => !scopes || scopes?.includes(l.language?.scope))
    .sort(sortByPopulation)[0];
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
        sortByPopulation,
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

// Field.CountOfCountries
export function getCountOfCountries(ent: EntityData): number | undefined {
  return getCountriesInEntity(ent)?.length;
}

export function getCountriesInEntity(ent: EntityData): TerritoryData[] | undefined {
  switch (ent.type) {
    case EntityType.Territory:
      return getTerritoryCountries(ent);
    case EntityType.Locale:
      return getLocaleCountries(ent);
    case EntityType.Census:
      return ent.territory?.scope === TerritoryScope.Country ? [ent.territory] : [];
    case EntityType.Language:
    case EntityType.WritingSystem:
    case EntityType.Variant:
    case EntityType.Keyboard:
      // Computationally a bit expensive, be careful using this application
      return uniqueBy(
        getEntityLocales(ent)
          .filter((loc) => loc.territory?.scope === TerritoryScope.Country)
          .sort(sortByPopulation)
          .map((loc) => loc.territory)
          .filter((t): t is TerritoryData => !!t),
        (t) => t.ID,
      );
    case EntityType.Org:
      return [ent.headquarters].filter((t) => !!t);
  }
}

// Field.CountOfChildTerritories
export function getCountOfChildTerritories(ent: EntityData): number | undefined {
  return getChildTerritoriesInEntity(ent)?.length;
}

export function getChildTerritoriesInEntity(ent: EntityData): TerritoryData[] | undefined {
  switch (ent.type) {
    case EntityType.Territory:
      return getTerritoryChildren(ent);
    case EntityType.Locale:
      return ent.territory ? [ent.territory] : undefined;
    case EntityType.Census:
      return ent.territory ? [ent.territory] : undefined;
    case EntityType.Variant:
      // Most variants don't have specified territories but some may
      return uniqueBy(
        ent.locales.map((locale) => locale.territory).filter((t): t is TerritoryData => t != null),
        (t) => t.ID,
      );
    case EntityType.Language:
    case EntityType.WritingSystem:
    case EntityType.Keyboard:
    case EntityType.Org:
      // child territories are not well defined for this, you probably want getCountriesInEntity instead
      return undefined;
  }
}

export function getEntityLocales(ent: EntityData): LocaleData[] {
  switch (ent.type) {
    case EntityType.Territory:
      return ent.locales ?? [];
    case EntityType.Locale:
      return [ent];
    case EntityType.Census:
      return [];
    case EntityType.Language:
      return ent.locales;
    case EntityType.WritingSystem:
      return getWritingSystemLocales(ent);
    case EntityType.Variant:
      return ent.locales;
    case EntityType.Keyboard:
      return [];
    case EntityType.Org:
      return [];
  }
}

export function getUniqueCountriesForLanguage(lang: LanguageData): TerritoryData[] {
  return uniqueBy(
    lang.locales
      .filter((loc) => loc.territory?.scope === TerritoryScope.Country)
      .sort(sortByPopulation),
    (loc) => loc.territoryCode ?? '',
  )
    .map((loc) => loc.territory)
    .filter((t): t is TerritoryData => !!t);
}

// Requires a lot of lookups, not great to run in time-sensitive contexts
function getWritingSystemLocales(ent: WritingSystemData): LocaleData[] {
  const locales = ent.localesWhereExplicit ?? [];
  const localesWithThisWSInferred = Object.values(ent.languages ?? {})
    .filter((lang) => lang.primaryWritingSystem?.ID === ent.ID)
    .flatMap((lang) => lang.locales)
    .filter((loc) => loc.writingSystem == null && !isTerritoryGroup(loc.territory?.scope));
  return [...locales, ...localesWithThisWSInferred].sort(sortByPopulation);
}
