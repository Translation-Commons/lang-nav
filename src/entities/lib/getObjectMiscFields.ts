import { getObjectChildren } from '@widgets/pathnav/getParentsAndDescendants';

import { ObjectType } from '@features/params/PageParamTypes';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { sumBy, uniqueBy } from '@shared/lib/setUtils';

import { getTerritoryBiggestLocale } from './getObjectRelatedTerritories';

// Field.Language
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
        ? Object.values(object.languages).sort(sortByPopulation)[0].nameDisplay
        : undefined;
    case ObjectType.Census:
      return undefined;
    case ObjectType.Keyboard:
      return object.language?.nameDisplay;
  }
}

// Field.Date
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
    case ObjectType.Keyboard:
      return undefined;
  }
}

// Field.CountOfLanguages
export function getCountOfLanguages(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.childLanguages.length;
    case ObjectType.Locale:
      return getObjectChildren(object).length;
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
    case ObjectType.Keyboard:
      return undefined;
  }
}

// Field.Literacy
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
    case ObjectType.Keyboard:
      return undefined;
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

// Field.CountOfWritingSystems
export function getCountOfWritingSystems(object: ObjectData): number | undefined {
  return getWritingSystemsInObject(object)?.length;
}

export function getWritingSystemsInObject(object: ObjectData): WritingSystemData[] | undefined {
  const { type } = object;
  switch (type) {
    case ObjectType.Language:
      // Putting the primary writing system first
      return uniqueBy(
        [object.primaryWritingSystem, ...Object.values(object.writingSystems ?? {})].filter(
          (ws) => !!ws,
        ),
        (ws) => ws.ID,
      );
    case ObjectType.Territory:
      return uniqueBy(
        object.locales
          ?.sort(sortByPopulation)
          .map((locale) => locale.writingSystem ?? locale.language?.primaryWritingSystem)
          .filter((ws) => !!ws) ?? [],
        (ws) => ws.ID,
      );
    case ObjectType.Locale:
      if (object.writingSystem) return [object.writingSystem];
      // Not certain if we should include the fallback writing system here
      // For instance, for `pan_PK` it's probably `Arab`, but for pan its `Guru` but we don't have
      // those inferences in the system right now
      if (object.language?.primaryWritingSystem) return [object.language.primaryWritingSystem];
      return undefined;
    case ObjectType.WritingSystem:
      // returns the number of contained writing systems + 1 for itself
      return [
        object,
        ...(object.childWritingSystems ?? []),
        ...(object.containsWritingSystems ?? []),
      ];
    case ObjectType.VariantTag:
      return uniqueBy(
        object.locales
          ?.map((locale) => locale.writingSystem)
          .filter((ws): ws is WritingSystemData => ws != null) ?? undefined,
        (ws) => ws.ID,
      );
    case ObjectType.Census:
      return undefined; // Potentially derivable, but computationally expensive
    case ObjectType.Keyboard:
      if (
        object.inputWritingSystem &&
        object.outputWritingSystem &&
        object.inputScriptCode !== object.outputScriptCode
      ) {
        return [object.inputWritingSystem, object.outputWritingSystem];
      }
      return object.inputWritingSystem ? [object.inputWritingSystem] : undefined;
    default:
      enforceExhaustiveSwitch(type);
  }
}

// Field.CountOfCensuses
export function getCountOfCensuses(object: ObjectData): number | undefined {
  const { type } = object;
  switch (type) {
    case ObjectType.Territory:
      return object.censuses?.length ?? 0;
    case ObjectType.Locale:
      return object.censusRecords?.length ?? 0;
    case ObjectType.Census:
      return 1;
    case ObjectType.Language:
    case ObjectType.WritingSystem:
    case ObjectType.VariantTag:
      return undefined;
    case ObjectType.Keyboard:
      return undefined;
    default:
      enforceExhaustiveSwitch(type);
  }
}

// Field.Depth
export function getDepth(object: ObjectData): number | undefined {
  const { type } = object;
  switch (type) {
    case ObjectType.Language:
      return object.depth;
    case ObjectType.Locale:
      // Locales are named like language_territory_variant, so depth is number of underscores
      return object.ID.split('_').length - 1;
    case ObjectType.Territory:
      // Root territories with no parent region have depth 0, otherwise depth is parent's depth + 1
      return object.parentUNRegion != null ? getDepth(object.parentUNRegion)! + 1 : 0;
    case ObjectType.WritingSystem:
      return object.parentWritingSystem ? getDepth(object.parentWritingSystem)! + 1 : 0;
    case ObjectType.Census:
    case ObjectType.VariantTag:
      return undefined;
    case ObjectType.Keyboard:
      return undefined;
    default:
      enforceExhaustiveSwitch(type);
  }
}
