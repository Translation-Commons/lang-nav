// ID should be entity type (usually plural) followed by specific information, even if it is ungrammatical
enum ReportID {
  EntitiesMissingFields, // fixed at 0 since it is always there. All others should be alphabetic
  CensusCountries,
  LanguagesWithAmbiguousNames,
  LanguagesDubious,
  LanguageDescendants,
  LanguagePaths,
  LocaleCitationCompleteness,
  LocaleIndigeneity,
  LocalesPotential,
  VariantsAnnotationTool,
  WritingSystemsLanguagesWithout,
}

export default ReportID;
