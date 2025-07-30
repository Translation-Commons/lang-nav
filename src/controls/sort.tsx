import { ObjectData } from '../types/DataTypes';
import { LanguageSource } from '../types/LanguageTypes';
import { ObjectType, SortBy, View } from '../types/PageParamTypes';

import { usePageParams } from './PageParamsContext';

export type SortByFunctionType = (a: ObjectData, b: ObjectData) => number;

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
            return b.type === ObjectType.Census ? b.languageCount - a.languageCount : -1;
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
  }
}
