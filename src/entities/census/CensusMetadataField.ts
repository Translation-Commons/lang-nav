export enum CensusMetadataField {
  codeDisplay = 'codeDisplay',
  nameDisplay = 'nameDisplay',
  isoRegionCode = 'isoRegionCode',
  yearCollected = 'yearCollected',

  // Kind of language data collected
  languageUse = 'languageUse',
  proficiency = 'proficiency',
  acquisitionOrder = 'acquisitionOrder',
  domain = 'domain',

  // Population
  population = 'population',
  populationSource = 'populationSource',
  populationSurveyed = 'populationSurveyed',
  populationWithPositiveResponses = 'populationWithPositiveResponses',
  sampleRate = 'sampleRate',
  responsesPerIndividual = 'responsesPerIndividual',

  // Data constraints
  languagesIncluded = 'languagesIncluded',
  geographicScope = 'geographicScope',
  age = 'age',
  gender = 'gender',
  nationality = 'nationality',
  residenceBasis = 'residenceBasis',
  quantity = 'quantity',
  notes = 'notes',

  // Author
  collectorType = 'collectorType',
  collectorName = 'collectorName',
  collectorNameShort = 'collectorNameShort',
  author = 'author',
  presentedBy = 'presentedBy',

  // Source
  url = 'url',
  datePublished = 'datePublished',
  dateAccessed = 'dateAccessed',
  documentName = 'documentName',
  tableName = 'tableName',
  columnName = 'columnName',
  citation = 'citation',
}
