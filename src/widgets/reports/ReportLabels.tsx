import ReportID from './ReportID';

const ReportLabels: Record<ReportID, string> = {
  [ReportID.CensusCountries]: 'Countries',
  [ReportID.CensusInputTool]: 'Census TSV Validation',
  [ReportID.EntitiesMissingFields]: 'Missing Fields',
  [ReportID.LanguageDescendants]: 'Descendants',
  [ReportID.LanguagePaths]: 'Paths',
  [ReportID.LanguagePlurals]: 'Plurals',
  [ReportID.LanguageScopeIssues]: 'Scope Issues',
  [ReportID.LanguagesDubious]: 'Dubious Languages',
  [ReportID.LanguagesWithAmbiguousNames]: 'Ambiguous Names',
  [ReportID.LocaleCitationCompleteness]: 'Citation Completeness',
  [ReportID.LocaleIndigeneity]: 'Indigeneity',
  [ReportID.LocalesPotential]: 'Potential Locales',
  [ReportID.LocalesLanguagesWithout]: 'Languages without Locales',
  [ReportID.VariantsAnnotationTool]: 'Annotation Tool',
  [ReportID.WritingSystemsLanguagesWithout]: 'Languages without Writing Systems',
};

export default ReportLabels;
