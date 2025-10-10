import { ObjectData } from '../../types/DataTypes';
import { LanguageSource } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';

// TODO make better upperbound/lowerbound population estimates when we don't have exact numbers
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
      return object.languages.reduce((sum, lang) => sum + (lang.populationEstimate || 0), 0);
  }
}

export function getObjectPopulationAttested(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.populationCited;
    case ObjectType.Locale:
      return object.populationCensus != null ? object.populationSpeaking : undefined;
    default:
      return undefined;
  }
}

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
      return object.containsTerritories?.reduce((sum, t) => sum + (t.population ?? 0), 0);
    case ObjectType.Census:
    case ObjectType.Locale:
    case ObjectType.VariantTag:
      return undefined;
  }
}

export function getObjectBiggestDescendentRelativePopulation(
  object: ObjectData,
): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.populationEstimate && object.largestDescendant
        ? (object.largestDescendant.populationEstimate ?? 0) / object.populationEstimate
        : undefined;
    case ObjectType.Territory:
      return object.population
        ? (object.containsTerritories?.reduce((max, t) => Math.max(max, t.population ?? 0), 0) ??
            0) / object.population
        : undefined;
    case ObjectType.Census:
    case ObjectType.Locale:
    case ObjectType.VariantTag:
    case ObjectType.WritingSystem:
      return undefined;
  }
}

export function getObjectPopulationRelativeToOverallLanguageSpeakers(
  object: ObjectData,
): number | undefined {
  switch (object.type) {
    case ObjectType.Locale:
      return object.language && object.populationSpeaking
        ? object.populationSpeaking / (object.language.populationEstimate ?? 1)
        : undefined;
    case ObjectType.Language:
      return object.parentLanguage && object.populationEstimate
        ? object.populationEstimate / (object.parentLanguage.populationEstimate ?? 1)
        : undefined;
    case ObjectType.Census:
    case ObjectType.Territory:
    case ObjectType.VariantTag:
    case ObjectType.WritingSystem:
      return undefined;
  }
}

export function getObjectPopulationRelativeToTerritory(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Census:
      return object.territory
        ? object.eligiblePopulation / (object.territory.population ?? 1)
        : undefined;
    case ObjectType.Locale:
      return object.populationSpeakingPercent;
    case ObjectType.Territory:
      return object.parentUNRegion && object.population
        ? object.population / object.parentUNRegion.population
        : undefined;
    case ObjectType.Language:
    case ObjectType.WritingSystem:
    case ObjectType.VariantTag:
      return undefined;
  }
}
