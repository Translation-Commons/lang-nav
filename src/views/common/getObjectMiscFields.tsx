import { sumBy, uniqueBy } from '../../generic/setUtils';
import { ObjectData, TerritoryData, TerritoryScope } from '../../types/DataTypes';
import { LanguageData } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';

export function getUniqueTerritoriesForLanguage(lang: LanguageData): TerritoryData[] {
  return uniqueBy(
    lang.locales.sort((a, b) => (b.populationSpeaking ?? 0) - (a.populationSpeaking ?? 0)),
    (loc) => loc.territoryCode ?? '',
  )
    .map((loc) => loc.territory)
    .filter((t) => t != null);
}

// SortBy.Date
export function getObjectDate(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Census:
      return object.yearCollected;
    case ObjectType.VariantTag:
      return object.dateAdded?.getTime();
    case ObjectType.Language:
    case ObjectType.Locale:
    case ObjectType.WritingSystem:
    case ObjectType.Territory:
      return undefined;
  }
}

// SortBy.CountOfLanguages
export function getCountOfLanguages(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.childLanguages.length;
    case ObjectType.Locale:
      return object.containedLocales?.length;
    case ObjectType.Census:
      return object.languageCount;
    case ObjectType.WritingSystem:
      return object.languages ? Object.values(object.languages).length : undefined;
    case ObjectType.Territory:
      return object.locales?.length;
    case ObjectType.VariantTag:
      return object.languageCodes?.length;
  }
}

export function getTerritoryChildren(territory: TerritoryData): TerritoryData[] {
  return [...(territory.containsTerritories ?? []), ...(territory.dependentTerritories ?? [])];
}

// SortBy.CountOfTerritories
export function getCountOfTerritories(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return getUniqueTerritoriesForLanguage(object).length;
    case ObjectType.Territory:
      return getTerritoryChildren(object).length;
    case ObjectType.Locale:
    case ObjectType.Census:
    case ObjectType.WritingSystem:
    case ObjectType.VariantTag:
      return undefined;
  }
}

// SortBy.Literacy
export function getObjectLiteracy(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Census:
    case ObjectType.WritingSystem:
    case ObjectType.VariantTag:
      // No literacy value to sort by
      return undefined;
    case ObjectType.Language:
      return getLanguageLiteracy(object);
    case ObjectType.Locale:
      return object.literacyPercent;
    case ObjectType.Territory:
      return object.literacyPercent;
  }
}

function getLanguageLiteracy(lang: LanguageData): number | undefined {
  const locales = uniqueBy(lang.locales, (loc) => loc.territoryCode ?? '').filter(
    (loc) => loc.territory?.scope === TerritoryScope.Country,
  );
  const totalLocalePopulation = sumBy(locales, (loc) => loc.populationSpeaking) || 0;
  const computedLiteracy =
    sumBy(
      locales,
      (locale) =>
        (locale.literacyPercent ?? locale.territory?.literacyPercent ?? 0) *
        (locale.populationSpeaking ?? 0),
    ) / totalLocalePopulation;
  return computedLiteracy || undefined;
}
