// Only add new table IDs at the bottom to preserve existing urls
enum TableID {
  // Primary tables
  Censuses, // 0
  Languages, // 1
  Locales, // 2
  Territories, // 3
  Variants, // 4
  WritingSystems, // 5
  Keyboards, // 6
  Organizations, // 7

  // Specialized tables
  LanguagesInCensus, // 8
  LanguagesLargestDescendant, // 9
  LanguagesInTerritory, // 10
  CountriesWithCensuses, // 11
  PotentialLocales, // 12
  LocaleIndigeneity, // 13
  VariantAnnotation, // 14
  LanguageScopeIssues, // 15
  LanguagePlurals, // 16
}

export default TableID;
