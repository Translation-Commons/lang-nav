import { LanguageSource } from '@entities/language/LanguageTypes';
import { ObjectData } from '@entities/types/DataTypes';
import { sumBy } from '@shared/lib/setUtils';
import { ObjectType } from '@widgets/PageParamTypes';

import { getTerritoryBiggestLocale } from './getObjectMiscFields';

// TODO make better upperbound/lowerbound population estimates when we don't have exact numbers
// SortBy.Population
export function getObjectPopulation(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.populationEstimate;
    case ObjectType.Locale:
      return object.populationSpeaking;
    case ObjectType.Census:
      return object.eligiblePopulation;
    case ObjectType.WritingSystem:
      return object.populationUpperBound;
    case ObjectType.Territory:
      return object.population;
    case ObjectType.VariantTag:
      return object.languages.length > 0
        ? object.languages.reduce((sum, lang) => sum + (lang.populationEstimate || 0), 0)
        : undefined;
  }
}

// SortBy.PopulationAttested
export function getObjectPopulationAttested(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.populationCited;
    case ObjectType.Locale:
      return object.populationCensus != null ? object.populationSpeaking : undefined;
    case ObjectType.Territory:
      return object.populationFromUN;
    case ObjectType.Census:
      return object.eligiblePopulation;
    case ObjectType.WritingSystem:
    case ObjectType.VariantTag:
      // There are no sources for population numbers for these, the population
      // numbers above are derived analytically
      return undefined;
  }
}

// SortBy.PopulationOfDescendents
export function getObjectPopulationOfDescendents(
  object: ObjectData,
  languageSource?: LanguageSource,
): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return languageSource
        ? object.sourceSpecific[languageSource].populationOfDescendents
        : object.populationOfDescendents;
    case ObjectType.WritingSystem:
      return object.populationOfDescendents;
    case ObjectType.Territory:
      return object.dependentTerritories && object.dependentTerritories.length > 0
        ? sumBy(object.dependentTerritories, (t) => t.population ?? 0)
        : undefined;
    case ObjectType.Census:
    case ObjectType.Locale:
    case ObjectType.VariantTag:
      return undefined;
  }
}

// SortBy.PopulationPercentInBiggestDescendentLanguage
export function getObjectPopulationPercentInBiggestDescendentLanguage(
  object: ObjectData,
): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.populationEstimate && object.largestDescendant
        ? ((object.largestDescendant.populationEstimate ?? 0) * 100) / object.populationEstimate
        : undefined;
    case ObjectType.Territory:
      return getTerritoryBiggestLocale(object)?.populationSpeakingPercent;
    case ObjectType.Census:
    case ObjectType.Locale:
    case ObjectType.VariantTag:
    case ObjectType.WritingSystem:
      return undefined;
  }
}

// SortBy.PercentOfOverallLanguageSpeakers
export function getObjectPopulationRelativeToOverallLanguageSpeakers(
  object: ObjectData,
): number | undefined {
  switch (object.type) {
    case ObjectType.Locale:
      return object.language && object.populationSpeaking
        ? (object.populationSpeaking * 100) / (object.language.populationEstimate ?? 1)
        : undefined;
    case ObjectType.Language:
      return object.parentLanguage && object.populationEstimate
        ? (object.populationEstimate * 100) / (object.parentLanguage.populationEstimate ?? 1)
        : undefined;
    case ObjectType.Census:
    case ObjectType.Territory:
    case ObjectType.VariantTag:
    case ObjectType.WritingSystem:
      return undefined;
  }
}

// SortBy.PercentOfTerritoryPopulation
export function getObjectPercentOfTerritoryPopulation(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Census:
      return object.territory && object.eligiblePopulation
        ? (object.eligiblePopulation * 100) / (object.territory.population ?? 1)
        : undefined;
    case ObjectType.Locale:
      return object.populationSpeakingPercent;
    case ObjectType.Territory:
      return object.parentUNRegion && object.population
        ? (object.population * 100) / object.parentUNRegion.population
        : undefined;
    case ObjectType.Language:
    case ObjectType.WritingSystem:
    case ObjectType.VariantTag:
      return undefined;
  }
}
