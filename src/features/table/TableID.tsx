// Only add new table IDs at the bottom to preserve existing urls
enum TableID {
  // Primary tables
  Censuses,
  Languages,
  Locales,
  Territories,
  VariantTags,
  WritingSystems,

  // Specialized tables
  LanguagesInCensus,
  LanguagesLargestDescendant,
  LanguagesInTerritory,
  CountriesWithCensuses,
  PotentialLocales,
}

export default TableID;
