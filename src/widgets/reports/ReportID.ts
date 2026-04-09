import { ObjectType } from '@features/params/PageParamTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

// ID should be entity type (usually plural) followed by specific information, even if its ungrammatical
enum ReportID {
  CensusCountries,
  EntitiesMissingFields,
  LanguagesWithAmbiguousNames,
  LanguagesDubious,
  LanguageDescendents,
  LanguagePaths,
  LocalesCitationCompleteness,
  LocalesIndigeneity,
  LocalesPotential,
  VariantsAnnotationTool,
  WritingSystemsLanguagesWithout,
}

/** Output is sorted */
export function getReportIDsForEntityType(entityType: ObjectType): ReportID[] {
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
        ReportID.LocalesCitationCompleteness,
        ReportID.LocalesIndigeneity,
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

export default ReportID;
