import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData } from '@entities/types/DataTypes';

import { sumBy } from '@shared/lib/setUtils';

import { getTerritoryBiggestLocale } from './getObjectRelatedTerritories';

// TODO make better upperbound/lowerbound population estimates when we don't have exact numbers
// Field.Population
export function getObjectPopulation(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.pop.overall;
    case ObjectType.Locale:
      return object.pop.speaking.adjusted;
    case ObjectType.Census:
      return object.population;
    case ObjectType.WritingSystem:
      return object.populationUpperBound;
    case ObjectType.Territory:
      return object.population;
    case ObjectType.Variant:
      return object.languages.length > 0
        ? object.languages.reduce((sum, lang) => sum + (lang.pop.overall || 0), 0)
        : undefined;
    case ObjectType.Org:
      return undefined;
  }
}

// Field.PopulationDirectlySourced
export function getObjectPopulationDirectlySourced(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.pop.rough;
    case ObjectType.Locale:
      return object.pop.speaking.unadjusted;
    case ObjectType.Territory:
      return object.populationFromUN;
    case ObjectType.Census:
      return object.population;
    case ObjectType.WritingSystem:
    case ObjectType.Variant:
    case ObjectType.Keyboard:
    case ObjectType.Org:
      // There are no sources for population numbers for these, the population
      // numbers above are derived analytically
      return undefined;
  }
}

// Field.PopulationOfDescendants
export function getObjectPopulationOfDescendants(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return (
        Math.max(object.pop.speaking.descendants || 0, object.pop.writing.descendants || 0) ||
        undefined
      );
    case ObjectType.WritingSystem:
      return object.populationOfDescendants;
    case ObjectType.Territory:
      return object.dependentTerritories && object.dependentTerritories.length > 0
        ? sumBy(object.dependentTerritories, (t) => t.population ?? 0)
        : undefined;
    case ObjectType.Census:
    case ObjectType.Locale:
    case ObjectType.Variant:
      return undefined;
  }
}

// Field.PopulationPercentInBiggestDescendantLanguage
export function getObjectPopulationPercentInBiggestDescendantLanguage(
  object: ObjectData,
): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.pop.overall && object.largestDescendant
        ? ((object.largestDescendant.pop.overall ?? 0) * 100) / object.pop.overall
        : undefined;
    case ObjectType.Territory:
      return getTerritoryBiggestLocale(object)?.pop.speaking.percent;
    case ObjectType.Census:
    case ObjectType.Locale:
    case ObjectType.Variant:
    case ObjectType.WritingSystem:
      return undefined;
  }
}

// Field.PercentOfOverallLanguageSpeakers
export function getObjectPopulationRelativeToOverallLanguageSpeakers(
  object: ObjectData,
): number | undefined {
  switch (object.type) {
    case ObjectType.Locale:
      return object.language && object.pop.speaking.adjusted
        ? (object.pop.speaking.adjusted * 100) / (object.language.pop.speaking.estimate ?? 1)
        : undefined;
    case ObjectType.Language:
      return object.parentLanguage && object.pop.speaking.estimate
        ? (object.pop.speaking.estimate * 100) / (object.parentLanguage.pop.speaking.estimate ?? 1)
        : undefined;
    case ObjectType.Census:
    case ObjectType.Territory:
    case ObjectType.Variant:
    case ObjectType.WritingSystem:
      return undefined;
  }
}

// Field.PercentOfTerritoryPopulation
export function getObjectPercentOfTerritoryPopulation(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Census:
      return object.territory && object.population
        ? (object.population * 100) / (object.territory.population ?? 1)
        : undefined;
    case ObjectType.Locale:
      return object.pop.speaking.percentAdjusted;
    case ObjectType.Territory:
      return object.parentUNRegion && object.population
        ? (object.population * 100) / object.parentUNRegion.population
        : undefined;
    case ObjectType.Language:
    case ObjectType.WritingSystem:
    case ObjectType.Variant:
      return undefined;
  }
}
