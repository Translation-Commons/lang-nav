import { ObjectType } from '@features/params/PageParamTypes';

import { SortBy } from '../sorting/SortTypes';

export type ColorBy = SortBy | 'None';

/**
 * Get the color-by options applicable to a given object type.
 * Returns a filtered list of allowed color-by fields based on the object type.
 */
export function getColorBysApplicableToObjectType(objectType: ObjectType): SortBy[] {
  // Base allowed color-by fields (fields that make sense for color gradients)
  const allowedColorBys: SortBy[] = [
    SortBy.Population,
    SortBy.PopulationDirectlySourced,
    SortBy.Area,
    SortBy.CountOfLanguages,
    SortBy.CountOfDialects,
    SortBy.CountOfTerritories,
    SortBy.Literacy,
    SortBy.VitalityMetascore,
    SortBy.VitalityEthnologue2013,
    SortBy.VitalityEthnologue2025,
    SortBy.ISOStatus,
    SortBy.Latitude,
    SortBy.Longitude,
    SortBy.PercentOfOverallLanguageSpeakers,
    SortBy.PercentOfTerritoryPopulation,
    SortBy.PopulationOfDescendants,
    SortBy.PopulationPercentInBiggestDescendantLanguage,
    SortBy.Date,
    // Text fields for alphabetical coloring
    SortBy.Name,
    SortBy.Endonym,
    SortBy.Code,
  ];

  let filteredColorBys = [...allowedColorBys];

  // Exclude area and count-of-languages when mapping Languages (use CountOfDialects instead)
  if (objectType === ObjectType.Language) {
    filteredColorBys = filteredColorBys.filter(
      (s) => s !== SortBy.CountOfLanguages && s !== SortBy.Area,
    );
  }

  // Exclude count-of-dialects when mapping Territories (use CountOfLanguages instead)
  if (objectType === ObjectType.Territory) {
    filteredColorBys = filteredColorBys.filter((s) => s !== SortBy.CountOfDialects);
  }

  return filteredColorBys;
}

// Force it not to use 0 because that will be treated as falsy and removed
export enum ColorGradient {
  DivergingBlueToOrange = 1, // Blue - White - Orange
  DivergingOrangeToBlue = 2, // Orange - White - Blue
  DivergingRedToGreen = 3, // Red - White - Green
  DivergingGreenToRed = 4, // Green - White - Red
  StopLightRedToGreen = 11, // Red - Yellow - Green
  StopLightGreenToRed = 12, // Green - Yellow - Red
  HueRainbowBlueToRed = 21, // Blue - Green - Yellow - Orange - Red
  HueRainbowRedToBlue = 22, // Red - Orange - Yellow - Green - Blue
  SequentialBlue = 31, // Light to Dark Blue
  SequentialBlueReverse = 32, // Dark to Light Blue
  SequentialOrange = 33, // Light to Dark Orange
  SequentialOrangeReverse = 34, // Dark to Light Orange
}
