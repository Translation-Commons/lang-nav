enum Field {
  // Common, put these first
  None = 'None', // Empty
  Population = 'Population',
  Code = 'Code',
  Name = 'Name',

  // Identity
  Endonym = 'Endonym',
  LanguageScope = 'Language Scope',
  TerritoryScope = 'Territory Scope',

  // Status
  Modality = 'Modality',
  LanguageFormedHere = 'Language Formed Here',
  HistoricPresence = 'Historic Presence',

  // Status - Vitality
  VitalityMetascore = 'Vitality: Metascore',
  ISOStatus = 'ISO Status',
  VitalityEthnologueFine = 'Vitality: Ethnologue Fine',
  VitalityEthnologueCoarse = 'Vitality: Ethnologue Coarse',

  // Relation - Objects
  Language = 'Language',
  WritingSystem = 'Writing System',
  Territory = 'Territory',
  VariantTag = 'Variant Tag',
  Platform = 'Platform',
  OutputScript = 'Output Script',

  // Relation - Counts
  CountOfLanguages = '# of Languages',
  CountOfWritingSystems = '# of Writing Systems',
  CountOfChildTerritories = '# of Territories', // immediate children only
  CountOfCountries = '# of Countries', // recursive, only counting countries
  CountOfCensuses = '# of Censuses',

  // Quantity
  Latitude = 'Latitude',
  Longitude = 'Longitude',
  Date = 'Date',
  Area = 'Area',
  Depth = 'Depth',
  Literacy = 'Literacy',

  // Quantity - Population

  // Quantity - Population Percent
  PopulationDirectlySourced = 'Population Directly Sourced',
  PopulationOfDescendants = 'Population of Descendants',
  PercentOfTerritoryPopulation = '% of Territory Population',
  PercentOfOverallLanguageSpeakers = '% of Overall Language Speakers',
  PopulationPercentInBiggestDescendantLanguage = 'Biggest Descendant Relative Population',
}

export default Field;
