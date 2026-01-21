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
  CountOfLanguages = '# of Languages',
  CountOfWritingSystems = '# of Writing Systems',
  CountOfChildTerritories = '# of Territories', // immediate children only
  CountOfCountries = '# of Countries', // recursive, only counting countries
  CountOfCensuses = '# of Censuses',
  Language = 'Language',
  WritingSystem = 'Writing System',
  Territory = 'Territory',

  // Extra population metrics
  PopulationDirectlySourced = 'Population Directly Sourced',
  PopulationOfDescendants = 'Population of Descendants',
  PercentOfTerritoryPopulation = '% of Territory Population',
  PercentOfOverallLanguageSpeakers = '% of Overall Language Speakers',
  PopulationPercentInBiggestDescendantLanguage = 'Biggest Descendant Relative Population',
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
