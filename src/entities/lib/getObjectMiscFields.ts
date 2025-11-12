import { ObjectType } from '@features/page-params/PageParamTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LocaleData, ObjectData, TerritoryData, TerritoryScope } from '@entities/types/DataTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

export function getTerritoryBiggestLocale(territory: TerritoryData): LocaleData | undefined {
  return (territory?.locales || []).sort(
    (a, b) => (b.populationSpeaking ?? 0) - (a.populationSpeaking ?? 0),
  )[0];
}

// SortBy.Language
export function getObjectMostImportantLanguageName(object: ObjectData): string | undefined {
  switch (object.type) {
    case ObjectType.Territory:
      return getTerritoryBiggestLocale(object)?.language?.nameDisplay;
    case ObjectType.Locale:
      return object.language?.nameDisplay;
    case ObjectType.Language:
      return object.nameDisplay;
    case ObjectType.VariantTag:
      return object.languages?.[0]?.nameDisplay;
    case ObjectType.WritingSystem:
      return object.languages
        ? Object.values(object.languages).sort(
            (a, b) => (b.populationEstimate ?? 0) - (a.populationEstimate ?? 0),
          )[0].nameDisplay
        : undefined;
    case ObjectType.Census:
      return undefined;
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
    .filter((t) => t != null);
}

// SortBy.Date
export function getObjectDateAsNumber(object: ObjectData): number | undefined {
  const date = getObjectDate(object);
  return date ? date.getTime() : undefined;
}

export function getObjectDate(object: ObjectData): Date | undefined {
  switch (object.type) {
    case ObjectType.Census:
      return new Date(object.yearCollected + '-01-02'); // The 2nd so timezone changes don't affect the year
    case ObjectType.VariantTag:
      return object.dateAdded;
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
      return object.containedLocales?.length; // Actually count of locales, not languages
    case ObjectType.Census:
      return object.languageCount;
    case ObjectType.WritingSystem:
      return object.languages ? Object.values(object.languages).length : undefined;
    case ObjectType.Territory:
      return object.locales && object.locales.length > 0
        ? uniqueBy(object.locales, (loc) => loc.languageCode).length
        : undefined;
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
      return getUniqueCountriesForLanguage(object).length;
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
