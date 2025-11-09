export enum SortBy {
  Population = 'Population',
  Code = 'Code',
  Name = 'Name',
  Endonym = 'Endonym',
  Literacy = 'Literacy',

  // Vitality metrics
  VitalityMetascore = 'Vitality: Metascore',
  VitalityISO = 'Vitality: ISO',
  VitalityEthnologue2013 = 'Vitality: Ethnologue 2013',
  VitalityEthnologue2025 = 'Vitality: Ethnologue 2025',

  Latitude = 'Latitude',
  Longitude = 'Longitude',
  Date = 'Date',
  CountOfLanguages = 'Count of Languages',
  CountOfTerritories = 'Count of Territories',
  Language = 'Language',

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

export enum ColorGradient {
  DivergingBlueToOrange, // Blue - White - Orange
  DivergingOrangeToBlue, // Orange - White - Blue
  DivergingRedToGreen, // Red - White - Green
  DivergingGreenToRed, // Green - White - Red
  StopLightRedToGreen, // Red - Yellow - Green
  StopLightGreenToRed, // Green - Yellow - Red
  HueRainbowBlueToRed, // Blue - Green - Yellow - Orange - Red
  HueRainbowRedToBlue, // Red - Orange - Yellow - Green - Blue
  SequentialBlue, // Light to Dark Blue
  SequentialBlueReverse, // Dark to Light Blue
  SequentialOrange, // Light to Dark Orange
  SequentialOrangeReverse, // Dark to Light Orange
}
