enum TableID {
  // Primary tables
  Languages,
  Territories,
  WritingSystems,
  Locales,
  Censuses,
  VariantTags,

  // Specialized tables
  LanguagesInCensus,
  LanguagesLargestDescendant,
  LanguagesInTerritory,
  CountriesWithCensuses,
  PotentialLocales,
}

export default TableID;
