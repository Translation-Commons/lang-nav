import { getObjectChildren } from '@widgets/pathnav/getParentsAndDescendants';

import { EntityType } from '@features/params/PageParamTypes';
import { getVariantsForEntity } from '@features/transforms/fields/getEntityConnection';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { EntityData } from '@entities/types/DataTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { sumBy, uniqueBy } from '@shared/lib/setUtils';

import { getTerritoryBiggestLocale } from './getObjectRelatedTerritories';

// Field.Language
export function getObjectMostImportantLanguageName(ent: EntityData): string | undefined {
  switch (ent.type) {
    case EntityType.Territory:
      return getTerritoryBiggestLocale(ent)?.language?.nameDisplay;
    case EntityType.Locale:
      return ent.language?.nameDisplay;
    case EntityType.Language:
      return ent.nameDisplay;
    case EntityType.Variant:
      return (ent.equivalentLanguage ?? ent.languages?.[0])?.nameDisplay;
    case EntityType.WritingSystem:
      return ent.languages
        ? Object.values(ent.languages).sort(sortByPopulation)[0].nameDisplay
        : undefined;
    case EntityType.Census:
      return undefined;
    case EntityType.Keyboard:
      return ent.languages?.[0]?.nameDisplay;
    case EntityType.Org:
      return undefined;
  }
}

// Field.Date
export function getObjectDateAsNumber(ent: EntityData): number | undefined {
  const date = getObjectDate(ent);
  return date ? date.getTime() : undefined;
}

export function getObjectDate(ent: EntityData): Date | undefined {
  switch (ent.type) {
    case EntityType.Census:
      return new Date(ent.yearCollected + '-01-02'); // The 2nd so timezone changes don't affect the year
    case EntityType.Variant:
      return ent.dateAdded;
    case EntityType.Language:
    case EntityType.Locale:
    case EntityType.WritingSystem:
    case EntityType.Territory:
    case EntityType.Keyboard:
    case EntityType.Org:
      return undefined;
  }
}

// Field.CountOfLanguages
export function getCountOfLanguages(ent: EntityData): number | undefined {
  switch (ent.type) {
    case EntityType.Language:
      return ent.childLanguages.length;
    case EntityType.Locale:
      return getObjectChildren(ent).length;
    case EntityType.Census:
      return ent.languageCount;
    case EntityType.WritingSystem:
      return ent.languages ? Object.values(ent.languages).length : undefined;
    case EntityType.Territory:
      return ent.locales && ent.locales.length > 0
        ? uniqueBy(ent.locales, (loc) => loc.languageCode).length
        : undefined;
    case EntityType.Variant:
      return ent.languageCodes?.length;
    case EntityType.Keyboard:
      return ent.languageCodes?.length;
    case EntityType.Org:
      return undefined; // Too computationally intensive to get
  }
}

// Field.CountOfKeyboards
export function getCountOfKeyboards(ent: EntityData): number | undefined {
  const { type } = ent;
  switch (type) {
    case EntityType.Language:
      return ent.keyboards?.length ?? 0;
    case EntityType.WritingSystem:
      return ent.outputKeyboards?.length ?? 0;
    case EntityType.Keyboard:
      return 1; // A keyboard counts as 1 keyboard
    case EntityType.Territory:
    case EntityType.Locale:
    case EntityType.Variant:
    case EntityType.Census:
    case EntityType.Org:
      return undefined;
    default:
      enforceExhaustiveSwitch(type);
  }
}

// Field.Literacy
export function getObjectLiteracy(ent: EntityData): number | undefined {
  switch (ent.type) {
    case EntityType.Language:
      return getLanguageLiteracy(ent);
    case EntityType.Locale:
      return ent.literacyPercent;
    case EntityType.Territory:
      return ent.literacyPercent;
    case EntityType.Census:
    case EntityType.WritingSystem:
    case EntityType.Variant:
    case EntityType.Keyboard:
    case EntityType.Org:
      // No literacy value to sort by
      return undefined;
  }
}

function getLanguageLiteracy(lang: LanguageData): number | undefined {
  const locales = uniqueBy(lang.locales, (loc) => loc.territoryCode ?? '').filter(
    (loc) => loc.territory?.scope === TerritoryScope.Country,
  );
  const totalLocalePopulation = sumBy(locales, (loc) => loc.pop.speaking.adjusted) || 0;
  const computedLiteracy =
    sumBy(
      locales,
      (locale) =>
        (locale.literacyPercent ?? locale.territory?.literacyPercent ?? 0) *
        (locale.pop.speaking.adjusted ?? 0),
    ) / totalLocalePopulation;
  return computedLiteracy || undefined;
}

// Field.CountOfWritingSystems
export function getCountOfWritingSystems(ent: EntityData): number | undefined {
  return getWritingSystemsInObject(ent)?.length;
}

export function getWritingSystemsInObject(ent: EntityData): WritingSystemData[] | undefined {
  const { type } = ent;
  switch (type) {
    case EntityType.Language:
      // Putting the primary writing system first
      return uniqueBy(
        [ent.primaryWritingSystem, ...Object.values(ent.writingSystems ?? {})].filter((ws) => !!ws),
        (ws) => ws.ID,
      );
    case EntityType.Territory:
      return uniqueBy(
        ent.locales
          ?.slice()
          .sort(sortByPopulation)
          .map((locale) => locale.writingSystem ?? locale.language?.primaryWritingSystem)
          .filter((ws) => !!ws) ?? [],
        (ws) => ws.ID,
      );
    case EntityType.Locale:
      if (ent.writingSystem) return [ent.writingSystem];
      // Not certain if we should include the fallback writing system here
      // For instance, for `pan_PK` it's probably `Arab`, but for pan its `Guru` but we don't have
      // those inferences in the system right now
      if (ent.language?.primaryWritingSystem) return [ent.language.primaryWritingSystem];
      return undefined;
    case EntityType.WritingSystem:
      // returns the number of contained writing systems + 1 for itself
      return [ent, ...(ent.childWritingSystems ?? []), ...(ent.containsWritingSystems ?? [])];
    case EntityType.Variant:
      return uniqueBy(
        ent.locales
          ?.map((locale) => locale.writingSystem)
          .filter((ws): ws is WritingSystemData => ws != null) ?? undefined,
        (ws) => ws.ID,
      );
    case EntityType.Census:
      return undefined; // Potentially derivable, but computationally expensive
    case EntityType.Keyboard:
      if (
        ent.inputWritingSystem &&
        ent.outputWritingSystem &&
        ent.inputScriptCode !== ent.outputScriptCode
      ) {
        return [ent.inputWritingSystem, ent.outputWritingSystem];
      }
      return ent.inputWritingSystem ? [ent.inputWritingSystem] : undefined;
    case EntityType.Org:
      return undefined; // Not well defined
    default:
      enforceExhaustiveSwitch(type);
  }
}

// Field.CountOfCensuses
export function getCountOfCensuses(ent: EntityData): number | undefined {
  const { type } = ent;
  switch (type) {
    case EntityType.Territory:
      return ent.censuses?.length ?? 0;
    case EntityType.Locale:
      return ent.censusRecords?.length ?? 0;
    case EntityType.Census:
      return 1;
    case EntityType.Language:
    case EntityType.WritingSystem:
    case EntityType.Variant:
    case EntityType.Keyboard:
      return undefined;
    case EntityType.Org:
      return ent.censuses?.length ?? 0;
    default:
      enforceExhaustiveSwitch(type);
  }
}

export function getCountOfVariants(ent: EntityData): number | undefined {
  const { type } = ent;
  switch (type) {
    case EntityType.Language:
      return getVariantsForEntity(ent)?.length ?? 0;
    case EntityType.Locale:
      return ent.variants?.length ?? 0;
    case EntityType.Keyboard:
      return ent.variant ? 1 : 0;
    case EntityType.Variant:
      return 1;
    case EntityType.Territory:
    case EntityType.Census:
    case EntityType.WritingSystem:
    case EntityType.Org:
      return undefined;
    default:
      enforceExhaustiveSwitch(type);
  }
}

// Field.Depth
export function getDepth(ent: EntityData): number | undefined {
  const { type } = ent;
  switch (type) {
    case EntityType.Language:
      return ent.depth;
    case EntityType.Locale:
      // Locales are named like language_territory_variant, so depth is number of underscores
      return ent.ID.split('_').length - 1;
    case EntityType.Territory:
      // Root territories with no parent region have depth 0, otherwise depth is parent's depth + 1
      return ent.parentUNRegion != null ? getDepth(ent.parentUNRegion)! + 1 : 0;
    case EntityType.WritingSystem:
      return ent.parentWritingSystem ? getDepth(ent.parentWritingSystem)! + 1 : 0;
    case EntityType.Census:
    case EntityType.Variant:
    case EntityType.Keyboard:
      return undefined;
    case EntityType.Org:
      return ent.parent ? getDepth(ent.parent)! + 1 : 0;
    default:
      enforceExhaustiveSwitch(type);
  }
}
