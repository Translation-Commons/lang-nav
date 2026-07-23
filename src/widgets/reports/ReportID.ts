// ID should be entity type (usually plural) followed by specific information, even if it is ungrammatical.
// Names can change but the order should not, since the numeric values are used in the URL params and should not change.
enum ReportID {
  EntitiesMissingFields, // Useful for all entities
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
  VariantsAnnotationTool,
  WritingSystemsLanguagesWithout,
  LanguagePlurals,
}

export default ReportID;
