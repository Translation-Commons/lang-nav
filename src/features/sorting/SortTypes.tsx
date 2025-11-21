export enum SortBy {
  Population = 'Population',
  Code = 'Code',
  Name = 'Name',
  Endonym = 'Endonym',
  Literacy = 'Literacy',

  // Vitality metrics
  VitalityMetascore = 'Vitality: Metascore',
  ISOStatus = 'ISO Status',
  VitalityEthnologue2013 = 'Vitality: Ethnologue 2013',
  VitalityEthnologue2025 = 'Vitality: Ethnologue 2025',

  Latitude = 'Latitude',
  Longitude = 'Longitude',
  Date = 'Date',
  Area = 'Area',
  CountOfLanguages = 'Count of Languages',
  CountOfTerritories = 'Count of Territories',
  Language = 'Language',
  WritingSystem = 'Writing System',
  Territory = 'Territory',

  // Extra population metrics
  PopulationAttested = 'Population Attested',
  PopulationOfDescendents = 'Population of Descendents',
  PercentOfTerritoryPopulation = '% of Territory Population',
  PercentOfOverallLanguageSpeakers = '% of Overall Language Speakers',
  PopulationPercentInBiggestDescendentLanguage = 'Biggest Descendent Relative Population',
}

// Human-friendly display direction for sorting
export enum SortBehavior {
  Normal = 1, // A to Z, 9999999 to 0
  Reverse = -1,
}

export enum SortDirection {
  Ascending = 1, // A to Z, 0 to 9999999
  Descending = -1,
}

export type ColorBy = SortBy | 'None';

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
