import { EntityType } from '@features/params/PageParamTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import ReportID from './ReportID';

/** Output should be sorted by how it should appear in the UI */
function getReportIDsForEntityType(entType: EntityType): ReportID[] {
  switch (entType) {
    case EntityType.Language:
      return [
        ReportID.LanguagesDubious,
        ReportID.LanguagesWithAmbiguousNames,
        ReportID.LanguagePaths,
        ReportID.LanguageDescendants,
        ReportID.LanguageScopeIssues,
        ReportID.LanguagePlurals,
      ];
    case EntityType.Locale:
      return [
        ReportID.LocalesPotential,
        ReportID.LocaleCitationCompleteness,
        ReportID.LocaleIndigeneity,
        ReportID.LocalesLanguagesWithout,
      ];
    case EntityType.WritingSystem:
      return [ReportID.WritingSystemsLanguagesWithout];
    case EntityType.Census:
      return [ReportID.CensusCountries, ReportID.CensusInputTool];
    case EntityType.Variant:
      return [ReportID.VariantsAnnotationTool];
    case EntityType.Keyboard:
    case EntityType.Territory:
    case EntityType.Org:
      return [];
    default:
      enforceExhaustiveSwitch(entType);
  }
}

export default getReportIDsForEntityType;
