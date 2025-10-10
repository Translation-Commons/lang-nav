export enum SortBy {
  Population = 'Population',
  Code = 'Code',
  Name = 'Name',
  Endonym = 'Endonym',
  CountOfLanguages = 'Count of Languages',
  CountOfTerritories = 'Count of Territories',
  Literacy = 'Literacy',
  Date = 'Date',

  // Extra population metrics
  PopulationAttested = 'Population Attested',
  PopulationOfDescendents = 'Population of Descendents',
  PercentOfTerritoryPopulation = '% of Territory Population',
  PercentOfOverallLanguageSpeakers = '% of Overall Language Speakers',
  BiggestDescendentRelativePopulation = 'Biggest Descendent Relative Population',
}

// Human-friendly display direction for sorting
export enum DisplaySortDirection {
  Normal = 1, // A to Z, 9999999 to 0
  Reverse = -1,
}

export enum TechnicalSortDirection {
  Ascending = 1, // A to Z, 0 to 9999999
  Descending = -1,
}
