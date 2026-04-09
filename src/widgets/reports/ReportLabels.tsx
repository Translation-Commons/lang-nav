import ReportID from './ReportID';

const ReportLabels: Record<ReportID, string> = {
  [ReportID.CensusCountries]: 'Countries',
  [ReportID.CensusInputTool]: 'Input Tool',
  [ReportID.EntitiesMissingFields]: 'Missing Fields',
  [ReportID.LanguageDescendants]: 'Descendants',
  [ReportID.LanguagePaths]: 'Paths',
  [ReportID.LanguagesDubious]: 'Dubious Languages',
  [ReportID.LanguagesWithAmbiguousNames]: 'Ambiguous Names',
  [ReportID.LocaleCitationCompleteness]: 'Citation Completeness',
  [ReportID.LocaleIndigeneity]: 'Indigeneity',
  [ReportID.LocalesPotential]: 'Potential Locales',
  [ReportID.VariantsAnnotationTool]: 'Annotation Tool',
  [ReportID.WritingSystemsLanguagesWithout]: 'Languages Without Writing Systems',
};

export default ReportLabels;
