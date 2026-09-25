// ID should be entity type (usually plural) followed by specific information, even if it is ungrammatical.
// Names can change but the order should not, since the numeric values are used in the URL params and should not change.
enum ReportID {
  None, // number = 0, so it will be treated as falsy in conditional checks
  CensusCountries,
  CensusInputTool,
  LanguagesWithAmbiguousNames,
  LanguagesDubious,
  LanguageDescendants,
  LanguagePaths,
  LanguageScopeIssues,
  LocaleCitationCompleteness,
  LocaleIndigeneity,
  LocalesPotential,
  LocalesLanguagesWithout,
  VariantsAnnotationTool,
  WritingSystemsLanguagesWithout,
  LanguagePlurals,
  EntitiesMissingFields, // Useful for all entities
}

export default ReportID;
