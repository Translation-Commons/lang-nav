import { ObjectType } from '@features/params/PageParamTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import ReportID from './ReportID';

/** Output should be sorted by how it should appear in the UI */
function getReportIDsForEntityType(entityType: ObjectType): ReportID[] {
  switch (entityType) {
    case ObjectType.Language:
      return [
        ReportID.LanguagesDubious,
        ReportID.LanguagesWithAmbiguousNames,
        ReportID.LanguagePaths,
        ReportID.LanguageDescendents,
      ];
    case ObjectType.Locale:
      return [
        ReportID.LocalesPotential,
        ReportID.LocaleCitationCompleteness,
        ReportID.LocaleIndigeneity,
      ];
    case ObjectType.WritingSystem:
      return [ReportID.WritingSystemsLanguagesWithout];
    case ObjectType.Census:
      return [ReportID.CensusCountries];
    case ObjectType.Keyboard:
      return [];
    case ObjectType.Territory:
      return [];
    case ObjectType.Variant:
      return [ReportID.VariantsAnnotationTool];
    default:
      enforceExhaustiveSwitch(entityType);
  }
}

export default getReportIDsForEntityType;
