import { ObjectData } from '../types/DataTypes';
import { LanguageSource } from '../types/LanguageTypes';
import { ObjectType, SortBy, View } from '../types/PageParamTypes';

import { usePageParams } from './PageParamsContext';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

// TODO, it may be more performant to make a sortKey function
export function getSortFunction(languageSource?: LanguageSource): SortByFunctionType {
  const { sortBy, view, languageSource: languageSourcePageParam } = usePageParams();
  const effectiveLanguageSource = languageSource ?? languageSourcePageParam;

  switch (sortBy) {
    case SortBy.Code:
      return (a: ObjectData, b: ObjectData) => {
        if (a.codeDisplay > b.codeDisplay) return 1;
        if (b.codeDisplay > a.codeDisplay) return -1;
        return 0;
      };
    case SortBy.Name:
      return (a: ObjectData, b: ObjectData) => {
        if (a.nameDisplay > b.nameDisplay) return 1;
        if (b.nameDisplay > a.nameDisplay) return -1;
        return 0;
      };
    case SortBy.Endonym:
      return (a: ObjectData, b: ObjectData) => {
        if (a.nameEndonym == null) return b.nameEndonym == null ? 0 : 1;
        if (b.nameEndonym == null) return -1;
        if (a.nameEndonym > b.nameEndonym) return 1;
        if (b.nameEndonym > a.nameEndonym) return -1;
        return 0;
      };
    case SortBy.CountOfTerritories:
      return (a: ObjectData, b: ObjectData) => {
        switch (a.type) {
          case ObjectType.Language:
            return b.type === ObjectType.Language ? b.locales.length - a.locales.length : -1;
          case ObjectType.Locale:
            return 0; // Each locale only has one territory
          case ObjectType.Census:
            return 0; // Each census only has one territory
          case ObjectType.WritingSystem:
            return 0; // Not a useful sort for writing systems
          case ObjectType.Territory:
            return b.type === ObjectType.Territory
              ? b.containsTerritories.length - a.containsTerritories.length
              : -1;
        }
      };
    case SortBy.CountOfLanguages:
      return (a: ObjectData, b: ObjectData) => {
        switch (a.type) {
          case ObjectType.Language:
            return b.type === ObjectType.Language
              ? b.childLanguages.length - a.childLanguages.length
              : -1;
          case ObjectType.Locale:
            return b.type === ObjectType.Locale
              ? (b.containedLocales?.length || 0) - (a.containedLocales?.length || 0)
              : -1;
          case ObjectType.Census:
            return b.type === ObjectType.Census ? b.languageCount - a.languageCount : -1;
          case ObjectType.WritingSystem:
            return b.type === ObjectType.WritingSystem
              ? Object.values(b.languages).length - Object.values(a.languages).length
              : -1;
          case ObjectType.Territory:
            return b.type === ObjectType.Territory ? b.locales.length - a.locales.length : -1;
        }
      };
    case SortBy.Population:
      return (a: ObjectData, b: ObjectData) => {
        switch (a.type) {
          case ObjectType.Language:
            return b.type === ObjectType.Language
              ? (b.populationCited ?? 0) -
                  (a.populationCited ?? 0) +
                  (view === View.Hierarchy
                    ? (b.sourceSpecific[effectiveLanguageSource].populationOfDescendents ?? 0) -
                      (a.sourceSpecific[effectiveLanguageSource].populationOfDescendents ?? 0)
                    : 0)
              : -1;
          case ObjectType.Locale:
            return b.type === ObjectType.Locale ? b.populationSpeaking - a.populationSpeaking : -1;
          case ObjectType.Census:
            return b.type === ObjectType.Census ? b.eligiblePopulation - a.eligiblePopulation : -1;
          case ObjectType.WritingSystem:
            return b.type === ObjectType.WritingSystem
              ? b.populationUpperBound -
                  a.populationUpperBound +
                  (view === View.Hierarchy
                    ? b.populationOfDescendents - a.populationOfDescendents
                    : 0)
              : -1;
          case ObjectType.Territory:
            return b.type === ObjectType.Territory ? b.population - a.population : -1;
        }
      };
    case SortBy.RelativePopulation:
      return (a: ObjectData, b: ObjectData) => {
        switch (a.type) {
          case ObjectType.Census:
          case ObjectType.Language:
          case ObjectType.WritingSystem:
            // No percent to sort by
            return 0;
          case ObjectType.Locale:
            return b.type === ObjectType.Locale
              ? (b.populationSpeakingPercent ?? 0) - (a.populationSpeakingPercent ?? 0)
              : -1;
          case ObjectType.Territory:
            return b.type === ObjectType.Territory
              ? // Err, this is not the same percent as above.
                b.population / (b.parentUNRegion?.population ?? 1) -
                  a.population / (a.parentUNRegion?.population ?? 1)
              : -1;
        }
      };
    case SortBy.Literacy:
      return (a: ObjectData, b: ObjectData) => {
        switch (a.type) {
          case ObjectType.Census:
          case ObjectType.Language:
          case ObjectType.WritingSystem:
            // No percent to sort by
            return 0;
          case ObjectType.Locale:
            return b.type === ObjectType.Locale
              ? (b.populationWriting ?? 0) / (b.populationSpeaking ?? 1) -
                  (a.populationWriting ?? 0) / (a.populationSpeaking ?? 1)
              : -1;
          case ObjectType.Territory:
            return b.type === ObjectType.Territory
              ? // Err, this is not the same percent as above.
                (b.literacyPercent ?? 0) - (a.literacyPercent ?? 0)
              : -1;
        }
      };
  }
}
