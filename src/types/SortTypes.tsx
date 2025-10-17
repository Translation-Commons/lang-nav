export enum SortBy {
  Population = 'Population',
  Code = 'Code',
  Name = 'Name',
  Endonym = 'Endonym',
  CountOfLanguages = 'Count of Languages',
  CountOfTerritories = 'Count of Territories',
  Literacy = 'Literacy',
  Date = 'Date',
  Language = 'Language',

  // Extra population metrics
  PopulationAttested = 'Population Attested',
  PopulationOfDescendents = 'Population of Descendents',
  PercentOfTerritoryPopulation = '% of Territory Population',
  PercentOfOverallLanguageSpeakers = '% of Overall Language Speakers',
  PopulationPercentInBiggestDescendentLanguage = 'Biggest Descendent Relative Population',
  VitalityMetascore = 'Vitality: Metascore',
  VitalityISO = 'Vitality: ISO',
  VitalityEthnologue2013 = 'Vitality: Ethnologue 2013',
  VitalityEthnologue2025 = 'Vitality: Ethnologue 2025',
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
