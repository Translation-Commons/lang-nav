import { EntityType } from '@features/params/PageParamTypes';

import { EntityData } from '@entities/types/DataTypes';
import { VariantType } from '@entities/variant/VariantTypes';

import { sumBy } from '@shared/lib/setUtils';

import { getTerritoryBiggestLocale } from './getEntityRelatedTerritories';

// TODO make better upperbound/lowerbound population estimates when we don't have exact numbers
// Field.Population
export function getEntityPopulation(ent: EntityData): number | undefined {
  switch (ent.type) {
    case EntityType.Language:
      return ent.pop.overall;
    case EntityType.Locale:
      return Math.max(ent.pop.speaking.adjusted || 0, ent.pop.writing.adjusted || 0) || undefined;
    case EntityType.Census:
      return ent.population;
    case EntityType.WritingSystem:
      return ent.populationUpperBound;
    case EntityType.Territory:
      return ent.pop.overall;
    case EntityType.Variant:
      return ent.languages.length > 0
        ? ent.languages.reduce((sum, lang) => sum + (lang.pop.overall || 0), 0)
        : undefined;
    case EntityType.Org:
      return undefined;
  }
}

// Field.PopulationDirectlySourced
export function getEntityPopulationDirectlySourced(ent: EntityData): number | undefined {
  switch (ent.type) {
    case EntityType.Language:
      return ent.pop.rough;
    case EntityType.Locale:
      return ent.pop.speaking.unadjusted;
    case EntityType.Territory:
      return ent.pop.fromUN;
    case EntityType.Census:
      return ent.population;
    case EntityType.WritingSystem:
    case EntityType.Variant:
    case EntityType.Keyboard:
    case EntityType.Org:
      // There are no sources for population numbers for these, the population
      // numbers above are derived analytically
      return undefined;
  }
}

// Field.PopulationOfDescendants
export function getEntityPopulationOfDescendants(ent: EntityData): number | undefined {
  switch (ent.type) {
    case EntityType.Language:
      return (
        Math.max(ent.pop.speaking.descendants || 0, ent.pop.writing.descendants || 0) || undefined
      );
    case EntityType.WritingSystem:
      return ent.populationOfDescendants;
    case EntityType.Territory:
      return ent.dependentTerritories && ent.dependentTerritories.length > 0
        ? sumBy(ent.dependentTerritories, (t) => t.pop.overall ?? 0)
        : undefined;
    case EntityType.Census:
    case EntityType.Locale:
    case EntityType.Variant:
      return undefined;
  }
}

// Field.PopulationPercentInBiggestDescendantLanguage
export function getEntityPopulationPercentInBiggestDescendantLanguage(
  ent: EntityData,
): number | undefined {
  switch (ent.type) {
    case EntityType.Language:
      return ent.pop.overall && ent.largestDescendant
        ? ((ent.largestDescendant.pop.overall ?? 0) * 100) / ent.pop.overall
        : undefined;
    case EntityType.Territory:
      return getTerritoryBiggestLocale(ent)?.pop.speaking.percent;
    case EntityType.Census:
    case EntityType.Locale:
    case EntityType.Variant:
    case EntityType.WritingSystem:
      return undefined;
  }
}

// Field.PercentOfOverallLanguageSpeakers
export function getEntityPopulationRelativeToOverallLanguageSpeakers(
  ent: EntityData,
): number | undefined {
  switch (ent.type) {
    case EntityType.Locale:
      return ent.language && ent.pop.speaking.adjusted
        ? (ent.pop.speaking.adjusted * 100) / (ent.language.pop.speaking.estimate ?? 1)
        : undefined;
    case EntityType.Language:
      return ent.parentLanguage && ent.pop.speaking.estimate
        ? (ent.pop.speaking.estimate * 100) / (ent.parentLanguage.pop.speaking.estimate ?? 1)
        : undefined;
    case EntityType.Census:
    case EntityType.Territory:
    case EntityType.Variant:
    case EntityType.WritingSystem:
      return undefined;
  }
}

// Field.PercentOfTerritoryPopulation
export function getEntityPercentOfTerritoryPopulation(ent: EntityData): number | undefined {
  switch (ent.type) {
    case EntityType.Census:
      return ent.territory && ent.population
        ? (ent.population * 100) / (ent.territory.pop.overall ?? 1)
        : undefined;
    case EntityType.Locale:
      // Not discriminating between spoken & written
      return Math.max(ent.pop.speaking.percent ?? 0, ent.pop.writing.percent ?? 0) || undefined;
    case EntityType.Territory:
      return ent.parentUNRegion && ent.pop.overall
        ? (ent.pop.overall * 100) / ent.parentUNRegion.pop.overall
        : undefined;
    case EntityType.Language:
    case EntityType.WritingSystem:
    case EntityType.Variant:
      return undefined;
  }
}

// Field.PopulationSpeaking
export function getEntityPopulationSpeaking(ent: EntityData): number | undefined {
  switch (ent.type) {
    case EntityType.Locale:
      return ent.pop.speaking.adjusted;
    case EntityType.Language:
      return ent.pop.speaking.estimate;
    case EntityType.Territory:
      return ent.pop.speaking;
    case EntityType.Variant:
      return ent.variantType === VariantType.Dialect
        ? ent.languages.length > 0
          ? ent.languages.reduce((sum, lang) => sum + (lang.pop.speaking.estimate || 0), 0)
          : undefined
        : undefined;
    case EntityType.Census:
    case EntityType.WritingSystem:
    case EntityType.Org:
      return undefined;
  }
}

// Field.PopulationWriting
export function getEntityPopulationWriting(ent: EntityData): number | undefined {
  switch (ent.type) {
    case EntityType.Locale:
      return ent.pop.writing.adjusted;
    case EntityType.Language:
      return ent.pop.writing.estimate;
    case EntityType.WritingSystem:
      return ent.populationUpperBound;
    case EntityType.Territory:
      return ent.pop.writing;
    case EntityType.Variant:
      return ent.variantType === VariantType.Orthographic
        ? ent.languages.length > 0
          ? ent.languages.reduce((sum, lang) => sum + (lang.pop.writing.estimate || 0), 0)
          : undefined
        : undefined;
    case EntityType.Census:
    case EntityType.Org:
      return undefined;
  }
}
