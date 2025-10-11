import { sumBy } from '../../generic/setUtils';
import { LocaleData, ObjectData, TerritoryData } from '../../types/DataTypes';
import { LanguageSource } from '../../types/LanguageTypes';
import { ObjectType } from '../../types/PageParamTypes';

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
      return object.languages.reduce((sum, lang) => sum + (lang.populationEstimate || 0), 0);
  }
}

// SortBy.PopulationAttested
export function getObjectPopulationAttested(object: ObjectData): number | undefined {
  switch (object.type) {
    case ObjectType.Language:
      return object.populationCited;
    case ObjectType.Locale:
      return object.populationCensus != null ? object.populationSpeaking : undefined;
    case ObjectType.Census:
    case ObjectType.WritingSystem:
    case ObjectType.Territory:
    case ObjectType.VariantTag:
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
    case ObjectType.Census:
    case ObjectType.VariantTag:
    case ObjectType.WritingSystem:
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
