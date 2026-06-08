// Only add new table IDs at the bottom to preserve existing urls
enum TableID {
  // Primary tables
  Censuses,
  Languages,
  Locales,
  Territories,
  Variants,
  WritingSystems,
  Keyboards,
  Organizations,

  // Specialized tables
  LanguagesInCensus,
  LanguagesLargestDescendant,
  LanguagesInTerritory,
  CountriesWithCensuses,
  PotentialLocales,
  LocaleIndigeneity,
  VariantAnnotation,
  LanguageScopeIssues,
}

export default TableID;
