enum Field {
  // Common, put these first
  None = 'None', // Empty
  Population = 'Population',
  Code = 'Code',
  Name = 'Name',

  // Identity
  Endonym = 'Endonym',
  LanguageScope = 'Language Scope',
  WritingSystemScope = 'Writing System Scope',
  TerritoryScope = 'Territory Scope',
  SourceType = 'Source Type',

  // Status
  Modality = 'Modality',
  DigitalSupport = 'Digital Support',
  CLDRCoverage = 'CLDR Coverage',
  UnicodeVersion = 'Unicode Version',

  Indigeneity = 'Indigeneity',
  GovernmentStatus = 'Government Status',
  LanguageFormedHere = 'Language Formed Here',
  HistoricPresence = 'Historic Presence',

  // Status - Vitality
  VitalityMetascore = 'Vitality: Metascore',
  ISOStatus = 'ISO Status',
  VitalityEthnologueFine = 'Vitality: Ethnologue Fine',
  VitalityEthnologueCoarse = 'Vitality: Ethnologue Coarse',

  // Relation - Objects
  Language = 'Language',
  LanguageFamily = 'Language Family',
  WritingSystem = 'Writing System',
  OutputScript = 'Output Script',
  Region = 'Region', // primary region or parent territory
  Territory = 'Territory',
  Variant = 'Variant',
  Platform = 'Platform',
  SourceForPopulation = 'Source for Population',
  SourceForLanguage = 'Source for Language',

  // Relation - Counts
  CountOfLanguages = '# of Languages',
  CountOfWritingSystems = '# of Writing Systems',
  CountOfChildTerritories = '# of Territories', // immediate children only
  CountOfCountries = '# of Countries', // recursive, only counting countries
  CountOfCensuses = '# of Censuses',
  CountOfVariants = '# of Variants',

  // Quantity
  Coordinates = 'Coordinates', // Lat + Long
  Latitude = 'Latitude',
  Longitude = 'Longitude',
  Area = 'Area',
  Depth = 'Depth',
  Literacy = 'Literacy',

  // Quantity - Population
  PopulationDirectlySourced = 'Population Directly Sourced',
  PopulationOfDescendants = 'Population of Descendants',

  // Quantity - Population Percent
  PercentOfTerritoryPopulation = '% of Territory Population',
  PercentOfOverallLanguageSpeakers = '% of Overall Language Speakers',
  PopulationPercentInBiggestDescendantLanguage = 'Biggest Descendant Relative Population',

  // Other
  Date = 'Date',
  Description = 'Description',
  Example = 'Example',
}

export default Field;
