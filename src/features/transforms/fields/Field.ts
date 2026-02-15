enum Field {
  None = 'None', // Empty

  Population = 'Population',
  Code = 'Code',
  Name = 'Name',
  Endonym = 'Endonym',
  Literacy = 'Literacy',
  Modality = 'Modality',

  Latitude = 'Latitude',
  Longitude = 'Longitude',
  Date = 'Date',
  Area = 'Area',
  Depth = 'Depth',
  LanguageScope = 'Language Scope',
  TerritoryScope = 'Territory Scope',

  // Vitality metrics
  VitalityMetascore = 'Vitality: Metascore',
  ISOStatus = 'ISO Status',
  VitalityEthnologueFine = 'Vitality: Ethnologue Fine',
  VitalityEthnologueCoarse = 'Vitality: Ethnologue Coarse',

  // Related object fields
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

export default Field;
